const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const twilio = require('twilio');
const redisClient = require('../config/redisClient'); // Importer le client Redis
const { updateUserProfile, addProfilePhoto, removeProfilePhoto, loginUser, getUserInfo } = require('../controllers/userController'); // Importer getUserInfo
const auth = require('../middleware/auth');
const router = express.Router();
const { users, io } = require('../socketManager'); // Importer users et io
const multer = require('multer');
const path = require('path');
const Message = require('../models/Message');
const mongoose = require('mongoose');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'gif', 'sticker'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Route de connexion
router.post('/login', loginUser);

router.post('/verify-phone', async (req, res) => {
  const { phone_number } = req.body;
  try {
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Code à 6 chiffres
    const expirationTime = new Date(Date.now() + 5 * 60000); // Expiration dans 5 minutes

    // Mettre à jour l'utilisateur avec le code et l'expiration
    const user = await User.findOneAndUpdate(
      { phone_number },
      { verificationCode, verificationCodeExpires: expirationTime },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    // Envoyer le SMS avec Twilio
    await client.messages.create({
      body: `Votre code de vérification est : ${verificationCode}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone_number
    });
    res.status(200).json({ message: 'Code de vérification envoyé par SMS' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Échec de l\'envoi du SMS' });
  }
});

// Route pour vérifier le code de vérification
router.post('/verify-code', async (req, res) => {
  const { phone_number, verificationCode } = req.body;

  try {
    const user = await User.findOne({ phone_number });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Vérifier que le code correspond et qu'il n'a pas expiré
    if (user.verificationCode !== verificationCode || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ error: 'Code incorrect ou expiré' });
    }

    // Le code est correct, on peut considérer que le numéro est vérifié
    res.status(200).json({ message: 'Numéro de téléphone vérifié avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Échec de la vérification du code' });
  }
});

// Route pour envoyer un message à un utilisateur spécifique
router.post('/send-message', auth, (req, res) => {
  const { to, message } = req.body;
  const from = req.user.id;

  // Envoyer le message via Socket.IO
  const recipientSocketId = users[to];
  if (recipientSocketId) {
    io.to(recipientSocketId).emit('receiveMessage', { from, message });
    res.status(200).json({ message: 'Message envoyé avec succès' });
  } else {
    res.status(404).json({ error: 'Utilisateur non connecté' });
  }
});

// Route pour mettre à jour le profil utilisateur
router.put('/profile', auth, updateUserProfile);

// Route pour ajouter une photo de profil
router.post('/profile/photo', auth, addProfilePhoto);

// Route pour supprimer une photo de profil
router.delete('/profile/photo', auth, removeProfilePhoto);

// Route pour récupérer les informations de l'utilisateur
router.get('/profile', auth, getUserInfo);

// Route pour mettre à jour la localisation de l'utilisateur
router.post('/updateLocation', auth, async (req, res) => {
  const { latitude, longitude } = req.body;

  // Valider les coordonnées
  if (!latitude || !longitude || 
      latitude < -90 || latitude > 90 || 
      longitude < -180 || longitude > 180) {
    return res.status(400).json({ 
      message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' 
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Stocker en format GeoJSON [longitude, latitude]
    user.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)], // Assurer que ce sont des nombres
      lastUpdated: new Date()
    };
    
    await user.save();
    
    // Stocker dans Redis pour un accès plus rapide
    await redisClient.set(`user:${user._id}:location`, JSON.stringify(user.location));
    
    res.status(200).json({ 
      message: 'Location updated successfully', 
      location: user.location 
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Failed to update location', error });
  }
});

// Route pour récupérer les utilisateurs à proximité
router.get('/nearbyUsers', auth, async (req, res) => {
  const { latitude, longitude, maxDistance } = req.query;
  try {
    const users = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch nearby users', error });
  }
});

// Route pour récupérer les profils à proximité
router.get('/nearby-profiles', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const maxDistance = user.maxDistance * 1000;

    const profiles = await User.find({
      _id: { $ne: user._id },
      gender: user.interested_in,
      interested_in: user.gender,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: maxDistance
        }
      },
      _id: { $nin: user.likedProfiles } // Exclure les profils déjà likés
    }).select('first_name age profilePhotos bio location gender interested_in');

    const formattedProfiles = profiles.map(profile => ({
      id: profile._id,
      name: profile.first_name,
      age: profile.age || '',
      bio: profile.bio || '',
      photos: profile.profilePhotos || [], // Send the full array of photos
      distance: '', 
      gender: profile.gender,
      interested_in: profile.interested_in
    }));

    res.status(200).json(formattedProfiles);
  } catch (error) {
    console.error('Error fetching nearby profiles:', error.stack);
    res.status(500).json({ message: 'Failed to fetch nearby profiles', error });
  }
});

// Route pour liker un profil
router.post('/like', auth, async (req, res) => {
  const { likedUserId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const likedUser = await User.findById(likedUserId);

    if (!user || !likedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Ajouter l'utilisateur liké à la liste des profils likés
    if (!user.likedProfiles.includes(likedUserId)) {
      user.likedProfiles.push(likedUserId);
      await user.save();
    }

    // Vérifier si l'utilisateur liké a également liké l'utilisateur actuel
    if (likedUser.likedProfiles.includes(userId)) {
      // Ajouter les deux utilisateurs à la liste des matchs
      if (!user.matches.includes(likedUserId)) {
        user.matches.push(likedUserId);
        await user.save();
      }
      if (!likedUser.matches.includes(userId)) {
        likedUser.matches.push(userId);
        await likedUser.save();
      }

      return res.status(200).json({ message: 'Match trouvé!', match: true });
    }

    res.status(200).json({ message: 'Profil liké avec succès', match: false });
  } catch (error) {
    console.error('Error liking profile:', error);
    res.status(500).json({ message: 'Erreur lors du like du profil', error });
  }
});

router.post('/signup', upload.array('photos', 1), async (req, res) => {
  try {
    const { first_name, email, phone_number, password, gender, interested_in, latitude, longitude } = req.body;
    const photoFiles = req.files;

    // Validate required fields
    if (!first_name || !email || !password || !phone_number) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone_number }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or phone number already exists' 
      });
    }

    // Create new user
    const user = new User({
      first_name,
      email,
      phone_number,
      password, // Will be hashed by the pre-save middleware
      gender,
      interested_in,
      profilePhotos: photoFiles ? photoFiles.map(file => file.filename) : [],
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        lastUpdated: new Date()
      }
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        location: user.location,
        profilePhotos: user.profilePhotos
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Route pour rafraîchir le token
router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;

  try {
    // Vérifier le token sans vérifier l'expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // Générer un nouveau token
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ message: 'Failed to refresh token', error });
  }
});

// Route pour récupérer les matchs de l'utilisateur
router.get('/matches', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('matches', 'first_name profilePhotos');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json(user.matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des matchs', error });
  }
});

// Route pour récupérer les conversations
router.get('/chats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const chats = await Promise.all(
      user.matches.map(async (matchId) => {
        const matchUser = await User.findById(matchId)
          .select('first_name profilePhotos isOnline lastActive');
        
        const hasNewMessage = await Message.exists({
          from: matchId,
          to: req.user.id,
          read: false
        });

        return {
          userId: matchUser._id,
          firstName: matchUser.first_name,
          profilePhoto: matchUser.profilePhotos[0],
          isOnline: matchUser.isOnline,
          lastActive: matchUser.lastActive,
          hasNewMessage: !!hasNewMessage  // S'assurer que cette valeur est bien renvoyée
        };
      })
    );
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des conversations' });
  }
});

// Route pour récupérer les messages d'une conversation
router.get('/messages/:chatId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.user.id, to: req.params.chatId },
        { from: req.params.chatId, to: req.user.id }
      ]
    }).sort('timestamp');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
});

// Route pour envoyer un message
router.post('/messages', auth, async (req, res) => {
  try {
    const { to, content, type = 'text' } = req.body;
    const message = new Message({
      from: req.user.id,
      to,
      content,
      type
    });
    await message.save();

    // Envoyer le message via Socket.IO
    const recipientSocketId = users[to];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receiveMessage', message);
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
});

// Route pour marquer les messages comme lus
router.put('/messages/read/:chatId', auth, async (req, res) => {
  try {
    await Message.updateMany(
      {
        from: req.params.chatId,
        to: req.user.id,
        read: false
      },
      { read: true }
    );
    res.status(200).json({ message: 'Messages marqués comme lus' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des messages' });
  }
});

// Route pour supprimer un message
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est l'expéditeur du message
    if (message.from.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce message' });
    }

    // Utiliser findByIdAndDelete au lieu de remove()
    await Message.findByIdAndDelete(req.params.messageId);
    res.status(200).json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du message' });
  }
});

module.exports = router;
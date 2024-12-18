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
const { users, io } = require('../server'); // Importer users et io
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route d'inscription
router.post('/signup', upload.single('photo'), async (req, res) => {
  const { first_name, email, phone_number, password, gender, interested_in, latitude, longitude } = req.body;
  const photoFile = req.file;

  if (!photoFile) {
    return res.status(400).json({ message: 'La photo de profil est obligatoire' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      first_name, 
      email, 
      phone_number, 
      password: hashedPassword,
      gender,
      interested_in,
      profilePhotos: [photoFile.filename], // Stocker le nom de fichier de la photo
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        lastUpdated: new Date()
      }
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès', 
      token, 
      user: {
        ...user.toJSON(),
        password: undefined
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error });
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
      photo: profile.profilePhotos && profile.profilePhotos.length > 0 
        ? `http://localhost:5000/uploads/${profile.profilePhotos[0]}` 
        : '',
      bio: profile.bio || '',
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

module.exports = router;
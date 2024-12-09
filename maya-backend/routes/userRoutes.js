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

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN);
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Route d'inscription
router.post('/signup', async (req, res) => {
  const { first_name, email, phone_number, password } = req.body;

  try {
    // Créer un nouvel utilisateur
    const user = new User({ first_name, email, phone_number, password });

    // Sauvegarder l'utilisateur dans la base de données
    await user.save();

    // Générer un token JWT
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'Utilisateur créé avec succès', token, user });
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
  try {
    const user = await User.findById(req.user.id);
    user.location.coordinates = [longitude, latitude];
    await user.save();
    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
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

module.exports = router;
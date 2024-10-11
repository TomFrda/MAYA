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

// Route pour mettre à jour le profil utilisateur
router.put('/profile', auth, updateUserProfile);

// Route pour ajouter une photo de profil
router.post('/profile/photo', auth, addProfilePhoto);

// Route pour supprimer une photo de profil
router.delete('/profile/photo', auth, removeProfilePhoto);

// Route pour récupérer les informations de l'utilisateur
router.get('/profile', auth, getUserInfo);

module.exports = router;
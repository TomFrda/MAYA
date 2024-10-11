const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const twilio = require('twilio');
const redisClient = require('../config/redisClient'); // Importer le client Redis
const { updateUserProfile } = require('../controllers/userController');
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

    // Retourner une réponse de succès
    res.status(201).json({ message: 'Utilisateur créé avec succès', user });
  } catch (err) {
    // Gérer les erreurs et retourner une réponse appropriée
    if (err.code === 11000) {
      res.status(400).json({ error: 'Email ou numéro de téléphone déjà utilisé' });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
    const { email, phone_number, password } = req.body;
  
    try {
      // Trouver l'utilisateur soit par email soit par numéro de téléphone
      const user = await User.findOne({ 
        $or: [{ email: email }, { phone_number: phone_number }]
      });
  
      // Si l'utilisateur n'existe pas, renvoyer une erreur
      if (!user) {
        return res.status(400).json({ error: 'Utilisateur introuvable' });
      }
  
      // Comparer le mot de passe avec le hash stocké
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Mot de passe incorrect' });
      }
  
      // Générer un token JWT
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET, // Clé secrète pour signer le token
        { expiresIn: '24h' } // Durée de validité du token
      );
  
      // Retourner une réponse avec le token et les informations de l'utilisateur
      res.status(200).json({ message: 'Connexion réussie', token, user });
    } catch (err) {
      console.error("Erreur serveur : ", err); // Log détaillé de l'erreur côté serveur
      res.status(500).json({ error: 'Erreur serveur', details: err.message }); // Renvoie le message d'erreur exact
    }
});  

// Route pour envoyer le code de vérification
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

// Route pour mettre à jour le profil utilisateur
router.put('/profile', auth, updateUserProfile);

module.exports = router;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require('validator');

// Définir le schéma utilisateur
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'Le prénom est obligatoire']
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Veuillez entrer un email valide']
  },
  phone_number: {
    type: String,
    required: [true, 'Le numéro de téléphone est obligatoire'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationCodeExpires: {
    type: Date,
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  profilePhotos: {
    type: [String], // Tableau d'URLs de photos de profil
    default: []
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0] // Coordonnées par défaut
    }
  },
  lastLocationUpdate: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ location: '2dsphere' });

// Hacher le mot de passe avant de le sauvegarder
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Créer et exporter le modèle utilisateur
const User = mongoose.model('User', userSchema);
module.exports = User;
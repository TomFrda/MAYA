const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config(); // Charger les variables d'environnement
const redisClient = require('./config/redisClient'); // Assure la connexion à Redis

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB', err));

// Middleware
app.use(express.json()); // Pour traiter les requêtes en JSON
app.use(cors()); // Pour autoriser les requêtes de toutes les origines
app.use(morgan('dev')); // Logger les requêtes

// Importer les routes utilisateur
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes); // Utiliser les routes définies dans userRoutes.js

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Le serveur tourne sur le port ${PORT}`);
});

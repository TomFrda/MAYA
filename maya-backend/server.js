const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config(); // Charger les variables d'environnement
const redisClient = require('./config/redisClient'); // Assure la connexion à Redis

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Autoriser toutes les origines, vous pouvez restreindre cela selon vos besoins
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

const conversationRoutes = require('./routes/conversationRoutes');
const userRoutes = require('./routes/userRoutes');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB', err));

// Middleware
app.use(express.json()); // Pour traiter les requêtes en JSON
app.use(cors()); // Pour autoriser les requêtes de toutes les origines
app.use(morgan('dev')); // Logger les requêtes

// Utiliser les routes définies
app.use('/api', conversationRoutes);
app.use('/api/users', userRoutes);

// Gestion des sockets
io.on('connection', (socket) => {
  console.log('Nouvelle connexion socket:', socket.id);

  socket.on('disconnect', () => {
    console.log('Déconnexion socket:', socket.id);
  });
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Le serveur tourne sur le port ${PORT}`);
});

module.exports = { app, server };
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

// Stocker les sockets des utilisateurs connectés
const users = {};

io.on('connection', (socket) => {
  console.log('Nouvelle connexion:', socket.id);

  // Associer l'utilisateur à son socket
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`Utilisateur ${userId} enregistré avec le socket ${socket.id}`);
  });

  // Écouter les messages entrants
  socket.on('sendMessage', ({ to, message }) => {
    const recipientSocketId = users[to];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receiveMessage', message);
      console.log(`Message envoyé à ${to}: ${message}`);
    } else {
      console.log(`Utilisateur ${to} non connecté`);
    }
  });

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log('Déconnexion:', socket.id);
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`Utilisateur ${userId} déconnecté`);
        break;
      }
    }
  });
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Le serveur tourne sur le port ${PORT}`);
});

module.exports = { users, io };
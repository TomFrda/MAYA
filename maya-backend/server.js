const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Charger les variables d'environnement
const redisClient = require('./config/redisClient'); // Assure la connexion à Redis
const User = require('./models/User');
const auth = require('./middleware/auth');
const { users, setIo } = require('./socketManager'); // Importer users et setIo

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Autoriser toutes les origines, vous pouvez restreindre cela selon vos besoins
    methods: ['GET', 'POST']
  }
});

setIo(io); // Définir io dans le module socketManager

const PORT = process.env.PORT || 5000;

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Increase timeout to 5 seconds
    });
    console.log('Connecté à MongoDB');
  } catch (err) {
    console.error('Erreur de connexion à MongoDB', err);
  }
};

connectDB();

// Middleware
app.use(express.json()); // Pour traiter les requêtes en JSON
app.use(cors()); // Pour autoriser les requêtes de toutes les origines
app.use(morgan('dev')); // Logger les requêtes

// Assurez-vous que le dossier uploads existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Servir les fichiers statiques
app.use('/uploads', express.static('uploads'));

// Importer les routes utilisateur
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes); // Utiliser les routes définies dans userRoutes.js

io.on('connection', (socket) => {
  console.log('Nouvelle connexion:', socket.id);

  // Associer l'utilisateur à son socket
  socket.on('register', async (userId) => {
    if (!userId) return;
    
    users[userId] = socket.id;
    // Mettre à jour le statut en ligne et la dernière activité
    await User.findByIdAndUpdate(userId, { 
      isOnline: true,
      lastActive: new Date()
    });
    // Émettre le changement de statut aux autres utilisateurs
    socket.broadcast.emit('userStatusChanged', { 
      userId, 
      isOnline: true,
      lastActive: new Date()
    });
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

  // Gérer les événements de swipe
  socket.on('swipe', async ({ userId, swipedUserId, direction }) => {
    try {
      const user = await User.findById(userId);
      const swipedUser = await User.findById(swipedUserId);

      if (!user || !swipedUser) {
        return socket.emit('swipeError', { message: 'Utilisateur non trouvé' });
      }

      if (direction === 'right') {
        // Ajouter l'utilisateur swipé à la liste des profils likés
        if (!user.likedProfiles.includes(swipedUserId)) {
          user.likedProfiles.push(swipedUserId);
          await user.save();
        }

        // Vérifier si l'utilisateur swipé a également liké l'utilisateur actuel
        if (swipedUser.likedProfiles.includes(userId)) {
          // Ajouter les deux utilisateurs à la liste des matchs
          if (!user.matches.includes(swipedUserId)) {
            user.matches.push(swipedUserId);
            await user.save();
          }
          if (!swipedUser.matches.includes(userId)) {
            swipedUser.matches.push(userId);
            await swipedUser.save();
          }

          // Notifier les deux utilisateurs du match
          io.to(users[userId]).emit('match', { match: swipedUser });
          io.to(users[swipedUserId]).emit('match', { match: user });
        }
      }

      socket.emit('swipeSuccess', { message: 'Swipe enregistré avec succès' });
    } catch (error) {
      console.error('Error handling swipe:', error);
      socket.emit('swipeError', { message: 'Erreur lors du traitement du swipe', error });
    }
  });

  // Gérer la déconnexion
  socket.on('disconnect', async () => {
    console.log('Déconnexion:', socket.id);
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        const now = new Date();
        // Mettre à jour le statut hors ligne et la dernière activité
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastActive: now
        });
        // Émettre le changement de statut aux autres utilisateurs
        socket.broadcast.emit('userStatusChanged', { 
          userId, 
          isOnline: false,
          lastActive: now
        });
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
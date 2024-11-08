const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Match = require('../models/Match');
const express = require('express');
const app = express();
app.use(express.json());

// Contrôleur pour mettre à jour le profil utilisateur
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assurez-vous que l'utilisateur est authentifié et que l'ID utilisateur est disponible
    const updatedData = req.body;

    // Récupérer l'utilisateur actuel
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'email a changé
    if (updatedData.email && updatedData.email !== currentUser.email) {
      const existingUser = await User.findOne({ email: updatedData.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }
    }

    // Vérifier si le numéro de téléphone a changé
    if (updatedData.phone_number && updatedData.phone_number !== currentUser.phone_number) {
      const existingUser = await User.findOne({ phone_number: updatedData.phone_number });
      if (existingUser) {
        return res.status(400).json({ message: 'Numéro de téléphone déjà utilisé' });
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil utilisateur', error });
  }
};

// Contrôleur pour ajouter une photo de profil
const addProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.profilePhotos.push(photoUrl);
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la photo de profil', error });
  }
};

// Contrôleur pour supprimer une photo de profil
const removeProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.profilePhotos = user.profilePhotos.filter(url => url !== photoUrl);
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la photo de profil', error });
  }
};

// Contrôleur pour la connexion des utilisateurs
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Connexion réussie', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error });
  }
};

// Contrôleur pour récupérer les informations de l'utilisateur
const getUserInfo = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const user = await User.findById(userId).select('-password'); // Exclure le mot de passe
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des informations de l\'utilisateur', error });
    }
  };
  
// Contrôleur pour liker un profil
const likeProfile = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur qui like
    const { targetUserId } = req.body; // ID de l'utilisateur qui reçoit le like

    // Vérifier que l'utilisateur ne se like pas lui-même
    if (userId === targetUserId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous liker vous-même' });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur cible non trouvé' });
    }

    // Vérifier si le like existe déjà
    if (user.likes.includes(targetUserId)) {
      return res.status(400).json({ message: 'Vous avez déjà liké ce profil' });
    }

    // Ajouter le like
    user.likes.push(targetUserId);
    await user.save();

    res.status(200).json({ message: 'Profil liké avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du like du profil', error });
  }
};

// Add this to userController.js
const matchUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    const currentUser = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur cible non trouvé' });
    }

    const mutualLike = currentUser.likes.includes(targetUserId) && 
                      targetUser.likes.includes(userId);

    if (mutualLike) {
      // Sauvegarder le match dans la BD
      const match = new Match({
        users: [userId, targetUserId]
      });
      await match.save();

      return res.status(200).json({ 
        matched: true,
        message: 'Match! Les deux utilisateurs se sont mutuellement likés',
        matchId: match._id,
        matchedWith: {
          id: targetUser._id,
          first_name: targetUser.first_name,
          email: targetUser.email
        }
      });
    }

    res.status(200).json({ 
      matched: false,
      message: 'Pas encore de match - like non réciproque'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification du match', error });
  }
};

// Add this controller function to userController.js
const getUserMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all matches where the user is involved
    const matches = await Match.find({
      users: userId
    })
    .populate({
      path: 'users',
      match: { _id: { $ne: userId } }, // Exclude the current user
      select: 'first_name email profilePhotos' // Select only needed fields
    });

    // Format the response
    const formattedMatches = matches.map(match => ({
      matchId: match._id,
      matchedUser: match.users[0], // Will contain the other user's info due to the $ne operator
      createdAt: match.createdAt,
      status: match.status,
      lastInteraction: match.lastInteraction
    }));

    res.status(200).json({
      matches: formattedMatches
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des matches', error });
  }
};

const updateLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude et longitude sont requises' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        lastLocationUpdate: new Date()
      },
      { new: true }
    );

    res.json({
      message: 'Position mise à jour avec succès',
      location: updatedUser.location
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de la position', 
      error: error.message 
    });
  }
};

const getNearbyUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { maxDistance = 10000 } = req.query; // Distance en mètres, par défaut 10km

    const currentUser = await User.findById(userId);
    if (!currentUser.location) {
      return res.status(400).json({ message: 'Position non définie pour l\'utilisateur actuel' });
    }

    const nearbyUsers = await User.find({
      _id: { $ne: userId }, // Exclure l'utilisateur actuel
      location: {
        $near: {
          $geometry: currentUser.location,
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).select('first_name location lastLocationUpdate');

    res.json({
      users: nearbyUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la recherche des utilisateurs à proximité', error });
  }
};

module.exports = {
  updateUserProfile,
  addProfilePhoto,
  removeProfilePhoto,
  loginUser,
  getUserInfo,
  likeProfile,
  matchUsers,
  getUserMatches,
  updateLocation,
  getNearbyUsers
};
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
  
module.exports = {
  updateUserProfile,
  addProfilePhoto,
  removeProfilePhoto,
  loginUser,
  getUserInfo, // Assurez-vous que getUserInfo est exporté
};
const User = require('../models/User');

// Contrôleur pour mettre à jour le profil utilisateur
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assurez-vous que l'utilisateur est authentifié et que l'ID utilisateur est disponible
    const updatedData = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil utilisateur', error });
  }
};

module.exports = {
  updateUserProfile,
};
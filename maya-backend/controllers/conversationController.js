const Conversation = require('../models/Conversation');

const getAllConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'first_name email')
      .populate('messages.sender', 'first_name email');

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des conversations', error });
  }
};

module.exports = {
  getAllConversations
};
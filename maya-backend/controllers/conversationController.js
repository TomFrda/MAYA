const Conversation = require('../models/Conversation');
// const Message = require('../models/Mesage');
const User = require('../models/User');
const { io, users } = require('../server'); // Assurez-vous que `io` et `users` sont importés correctement

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

// const sendMessage = async (req, res) => {
//     const { to, content } = req.body;
//     const from = req.user.id;
  
//     try {
//       // Vérifier si l'utilisateur destinataire existe
//       const recipient = await User.findById(to);
//       if (!recipient) {
//         return res.status(404).json({ error: 'Utilisateur destinataire non trouvé' });
//       }
  
//       // Créer et sauvegarder le message
//       const message = new Message({ from, to, content });
//       await message.save();
  
//       // Ajouter le message à la conversation
//       const conversation = await Conversation.findOneAndUpdate(
//         { participants: { $all: [from, to] } },
//         { $push: { messages: message } },
//         { new: true, upsert: true }
//       );
  
//       // Envoyer le message via Socket.IO
//       const recipientSocketId = users[to];
//       if (recipientSocketId) {
//         io.to(recipientSocketId).emit('receiveMessage', { from, content });
//       }
  
//       res.status(200).json({ message: 'Message envoyé et stocké avec succès', data: conversation });
//     } catch (error) {
//       res.status(500).json({ error: 'Erreur lors de l\'envoi du message', details: error.message });
//     }
// };

module.exports = {
  getAllConversations,
//   sendMessage
};
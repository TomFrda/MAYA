const express = require('express');
const { getAllConversations, sendMessage } = require('../controllers/conversationController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/conversations', auth, getAllConversations);
// router.post('/messages', auth, sendMessage);

module.exports = router;
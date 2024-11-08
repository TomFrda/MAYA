const express = require('express');
const { getAllConversations } = require('../controllers/conversationController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/conversations', auth, getAllConversations);

module.exports = router;
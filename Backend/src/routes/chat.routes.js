const express=require('express')
const router = express.Router();
const {auth }= require('../middleware/auth.middleware');

const  { 
  getOrCreateConversation, 
  createGroup,
  sendMessage, 
  deleteMessage, 
  deleteConversation 
} = require('../controllers/chat.controller');

router.get('/user/:receiverId', auth, getOrCreateConversation);

router.post('/group', auth, createGroup);

router.post('/send', auth, sendMessage);

router.delete('/message/:messageId', auth, deleteMessage);

router.delete('/conversation/:conversationId', auth, deleteConversation);

module.exports = router;
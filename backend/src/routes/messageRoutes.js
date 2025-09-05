const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  sendMediaMessage,
  markAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/room/:roomId', protect, getMessages);
router.post('/send', protect, sendMessage);
router.post('/media', protect, upload.single('file'), sendMediaMessage);
router.put('/:messageId/read', protect, markAsRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getRooms,
  createRoom,
  getOrCreatePrivateRoom,
  getRoomById
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRooms);
router.post('/', protect, createRoom);
router.get('/private/:userId', protect, getOrCreatePrivateRoom);
router.get('/:id', protect, getRoomById);

module.exports = router;

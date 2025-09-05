const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');

// Get all rooms for current user
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      participants: req.user._id
    })
    .populate('participants', 'username avatar isOnline')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username'
      }
    })
    .sort('-lastActivity');

    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { name, participants } = req.body;
    
    // Always include the current user
    const participantIds = [req.user._id, ...participants];
    const uniqueParticipants = [...new Set(participantIds)];

    const room = await Room.create({
      name,
      participants: uniqueParticipants,
      isPrivate: uniqueParticipants.length === 2
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('participants', 'username avatar isOnline');

    res.status(201).json(populatedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get or create private room between two users
const getOrCreatePrivateRoom = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if room already exists
    let room = await Room.findOne({
      isPrivate: true,
      participants: { $all: [req.user._id, userId], $size: 2 }
    }).populate('participants', 'username avatar isOnline');

    if (!room) {
      // Create new private room
      const otherUser = await User.findById(userId);
      if (!otherUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      room = await Room.create({
        name: `${req.user.username} & ${otherUser.username}`,
        participants: [req.user._id, userId],
        isPrivate: true
      });

      room = await Room.findById(room._id)
        .populate('participants', 'username avatar isOnline');
    }

    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('participants', 'username avatar isOnline');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is participant
    if (!room.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRooms,
  createRoom,
  getOrCreatePrivateRoom,
  getRoomById
};

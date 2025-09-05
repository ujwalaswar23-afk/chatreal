const Message = require('../models/Message');
const Room = require('../models/Room');
const path = require('path');

// Get messages for a room
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user has access to room
    const room = await Room.findById(roomId);
    if (
      !room ||
      !room.participants.some((id) => id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a text message
const sendMessage = async (req, res) => {
  try {
    const { roomId, content } = req.body;

    // Check if user has access to room
    const room = await Room.findById(roomId);
    if (
      !room ||
      !room.participants.some((id) => id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create message
    const message = await Message.create({
      room: roomId,
      sender: req.user._id,
      type: 'text',
      content
    });

    // Update room's last activity and message
    await Room.findByIdAndUpdate(roomId, {
      lastMessage: message._id,
      lastActivity: new Date()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar');

    // Emit via Socket.IO to room
    try {
      const io = req.app.get('io');
      if (io) io.to(roomId).emit('newMessage', populatedMessage);
    } catch (e) {
      console.error('Socket emit failed:', e.message);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send media message (image/video)
const sendMediaMessage = async (req, res) => {
  try {
    const { roomId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if user has access to room
    const room = await Room.findById(roomId);
    if (!room || !room.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Determine media type
    const fileExtension = path.extname(file.filename).toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.webm'];
    
    let mediaType = 'image';
    if (videoExtensions.includes(fileExtension)) {
      mediaType = 'video';
    }

    // Create message
    const message = await Message.create({
      room: roomId,
      sender: req.user._id,
      type: mediaType,
      mediaUrl: `/uploads/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size
    });

    // Update room's last activity and message
    await Room.findByIdAndUpdate(roomId, {
      lastMessage: message._id,
      lastActivity: new Date()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar');

    // Emit via Socket.IO to room
    try {
      const io = req.app.get('io');
      if (io) io.to(roomId).emit('newMessage', populatedMessage);
    } catch (e) {
      console.error('Socket emit failed:', e.message);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    await Message.findByIdAndUpdate(
      messageId,
      {
        $addToSet: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  sendMediaMessage,
  markAsRead
};

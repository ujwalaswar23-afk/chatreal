const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

const socketHandler = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user to their rooms
    const userRooms = await Room.find({ participants: socket.userId });
    userRooms.forEach(room => {
      socket.join(room._id.toString());
      // Notify room members that user is online
      socket.to(room._id.toString()).emit('userOnline', {
        userId: socket.userId,
        username: socket.user.username
      });
    });

    // Handle joining a specific room
    socket.on('joinRoom', async (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.user.username} joined room ${roomId}`);
    });

    // Handle leaving a room
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.user.username} left room ${roomId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { roomId, content, type = 'text', mediaUrl, fileName, fileSize } = data;

        // Create message
        const messageData = {
          room: roomId,
          sender: socket.userId,
          type,
          content
        };

        if (type === 'image' || type === 'video') {
          messageData.mediaUrl = mediaUrl;
          messageData.fileName = fileName;
          messageData.fileSize = fileSize;
        }

        const message = await Message.create(messageData);

        // Update room's last activity and message
        await Room.findByIdAndUpdate(roomId, {
          lastMessage: message._id,
          lastActivity: new Date()
        });

        // Populate message data
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar');

        // Emit to all users in the room (including sender)
        io.to(roomId).emit('newMessage', populatedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('userTyping', {
        userId: socket.userId,
        username: socket.user.username,
        isTyping
      });
    });

    // Handle read receipts
    socket.on('markAsRead', async ({ messageId }) => {
      try {
        await Message.findByIdAndUpdate(
          messageId,
          {
            $addToSet: {
              readBy: {
                user: socket.userId,
                readAt: new Date()
              }
            }
          }
        );

        // Notify sender that message was read
        const message = await Message.findById(messageId);
        if (message) {
          socket.to(message.room.toString()).emit('messageRead', {
            messageId,
            userId: socket.userId
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Notify rooms that user is offline
      userRooms.forEach(room => {
        socket.to(room._id.toString()).emit('userOffline', {
          userId: socket.userId,
          username: socket.user.username
        });
      });
    });
  });
};

module.exports = socketHandler;

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text'
  },
  content: {
    type: String,
    required: function() {
      return this.type === 'text';
    }
  },
  mediaUrl: {
    type: String,
    required: function() {
      return this.type === 'image' || this.type === 'video';
    }
  },
  fileName: String,
  fileSize: Number,
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient message queries
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Connect to database
connectDB();

// Initialize express
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach io instance to app for use in controllers
app.set('io', io);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend build if available
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// SPA fallback: send index.html for non-API routes
app.get('*', (req, res) => {
  // Don't override API or uploads
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ message: 'Not found' });
  }
  try {
    return res.sendFile(path.join(publicDir, 'index.html'));
  } catch (e) {
    return res.status(404).send('Not Found');
  }
});

// Socket.IO connection handling
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

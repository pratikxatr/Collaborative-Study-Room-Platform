require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:5173', credentials: true } });

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));

// Socket.io auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { username: socket.user.username });
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', { username: socket.user.username });
  });

  socket.on('send-message', async ({ roomId, text }) => {
    try {
      const msg = { sender: socket.user.id, senderName: socket.user.username, text, timestamp: new Date() };
      await Room.findByIdAndUpdate(roomId, { $push: { messages: msg } });
      io.to(roomId).emit('new-message', msg);
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  socket.on('session-started', ({ roomId, startTime }) => {
    socket.to(roomId).emit('session-started', { startTime, startedBy: socket.user.username });
  });

  socket.on('session-ended', ({ roomId, duration }) => {
    socket.to(roomId).emit('session-ended', { duration, endedBy: socket.user.username });
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`)))
  .catch(err => console.error(err));

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');
const { Server } = require('socket.io');
const http = require('http');
const sequelize = require('./config/database');
const env = require('./config/env');
const apiRoutes = require('./routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'stock-management-system',
    timestamp: new Date().toISOString(),
  });
});

io.on('connection', (socket) => {
  socket.emit('stock:sync', {
    message: 'Connected to stock movement realtime feed',
    timestamp: new Date().toISOString(),
  });

  socket.on('stock:movement', (payload) => {
    io.emit('stock:movement:update', payload);
  });
});

app.use('/api/v1', apiRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error', message: err.message || 'Unexpected error' });
});

module.exports = { app, server, io, sequelize };

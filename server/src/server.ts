import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { connectDB } from './config/db.js';
import { router as apiRouter } from './routes/api.js';
import { setupSockets } from './sockets/chatSocket.js';

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory
const uploadsPath = path.resolve('uploads');
app.use('/uploads', express.static(uploadsPath));

// API routes
app.use('/api', apiRouter);

// Root Welcome & Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    platform: 'UniSync — Department of Computer Science & Engineering',
    institution: 'Anurag University',
    version: '1.0.0',
    message: 'UniSync Academic API & Real-time Services are running smoothly.',
    healthCheck: '/health',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'UniSync Anurag University CSE',
    timestamp: new Date()
  });
});

// Setup sockets
setupSockets(io);

const PORT = process.env.PORT || 5000;

// Connect DB and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[UniSync] CSE Department Server is running on port ${PORT}`);
    console.log(`[UniSync] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[UniSync] REST APIs available at http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
});

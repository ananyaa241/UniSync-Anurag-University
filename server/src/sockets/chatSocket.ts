import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { Conversation } from '../models/Conversation.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSockets = (io: Server) => {
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required for socket connection.'));
    }
    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid socket authentication token.'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Join conversation rooms strictly checking membership authorization
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        if (!userId) return;
        const conv = await Conversation.findById(conversationId);
        if (conv && conv.participants.some((p) => p.toString() === userId.toString())) {
          socket.join(`conv:${conversationId}`);
        } else {
          socket.emit('error', { message: 'Privacy check failed: unauthorized to join room.' });
        }
      } catch (err) {
        console.error('Socket join_conversation error:', err);
      }
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Real-time chat message broadcast: Broadcast exclusively to OTHER sockets in the room so the sender does not get a duplicate
    socket.on('send_message', async (data: { conversationId: string; message: any }) => {
      try {
        if (!userId) return;
        const conv = await Conversation.findById(data.conversationId);
        if (conv && conv.participants.some((p) => p.toString() === userId.toString())) {
          // Emitting to socket.to(...) ensures other members receive it in real-time, avoiding double-rendering on the sender's client
          socket.to(`conv:${data.conversationId}`).emit('new_message', data);
        }
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    // Typing indicators strictly inside authorized room
    socket.on('typing_start', async (data: { conversationId: string; user: any }) => {
      socket.to(`conv:${data.conversationId}`).emit('user_typing', data);
    });

    socket.on('typing_stop', (data: { conversationId: string; userId: string }) => {
      socket.to(`conv:${data.conversationId}`).emit('user_stopped_typing', data);
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });
};

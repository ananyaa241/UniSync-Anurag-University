import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import mongoose from 'mongoose';

/**
 * Get all conversations where the authenticated user is explicitly in the participants list.
 * Conversations the user is not part of are NEVER returned.
 */
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'fullName email role designation avatarUrl')
      .populate('admins', 'fullName role')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get messages strictly verifying that the authenticated user is an authorized participant
 * of the conversation. Rejects with 403 Forbidden otherwise.
 */
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversationId = req.params.conversationId as string;
    const userId = req.user!._id;

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(400).json({ success: false, message: 'Invalid conversation ID format.' });
      return;
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    // PRIVACY ENFORCEMENT: User must be in participants list
    const isParticipant = conv.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'Access Denied: You are not an authorized participant in this private chat.'
      });
      return;
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'fullName email role designation avatarUrl')
      .populate('replyTo')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send a message with strict privacy authorization checks.
 * Supports file attachments (documents, images, marks reports, etc.)
 */
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId, content, attachments, replyTo } = req.body;
    const senderId = req.user!._id;

    if (!conversationId || (!content && (!attachments || attachments.length === 0))) {
      res.status(400).json({ success: false, message: 'Message content or attachment required.' });
      return;
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    // PRIVACY CHECK: User must be in participants list
    const isParticipant = conv.participants.some(
      (p) => p.toString() === senderId.toString()
    );

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'Access Denied: Cannot post in conversations where you are not a participant.'
      });
      return;
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content: content || '',
      attachments: attachments || [],
      replyTo: replyTo || undefined,
      readBy: [{ userId: senderId, readAt: new Date() }]
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text: content || (attachments && attachments.length > 0 ? `📎 ${attachments[0].fileName}` : 'Attachment'),
        senderId,
        sentAt: new Date()
      },
      updatedAt: new Date()
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'fullName email role designation avatarUrl')
      .populate('replyTo');

    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Start a private 1-on-1 direct message or small private group.
 */
export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, name, description, participantIds } = req.body;
    const currentUserId = req.user!._id;

    // Filter out duplicates and ensure valid strings
    const rawParticipants = [...(participantIds || []), currentUserId.toString()];
    const allParticipants = Array.from(new Set(rawParticipants.filter((id) => mongoose.Types.ObjectId.isValid(id))));

    if (allParticipants.length < 2 && type === 'DIRECT') {
      res.status(400).json({ success: false, message: 'Direct chat requires at least one other participant.' });
      return;
    }

    // If direct chat, verify if one already exists between these 2 users
    if (type === 'DIRECT' && allParticipants.length === 2) {
      const existing = await Conversation.findOne({
        type: 'DIRECT',
        participants: { $all: allParticipants, $size: 2 }
      }).populate('participants', 'fullName email role designation avatarUrl');

      if (existing) {
        res.json({ success: true, data: existing });
        return;
      }
    }

    const conv = await Conversation.create({
      type: type || 'DIRECT',
      name: name || undefined,
      description: description || undefined,
      participants: allParticipants,
      admins: [currentUserId]
    });

    const populated = await Conversation.findById(conv._id).populate(
      'participants',
      'fullName email role designation avatarUrl'
    );

    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

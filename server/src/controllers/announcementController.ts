import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Announcement } from '../models/Announcement.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export const getAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user!.role;
    const announcements = await Announcement.find({
      $or: [
        { targetAudience: 'ALL' },
        { targetAudience: userRole === 'COORDINATOR' ? 'COORDINATORS' : 'FACULTY' }
      ]
    })
      .populate('createdBy', 'fullName role designation')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: announcements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, priority, targetAudience, attachments, expiryDate } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, message: 'Title and message are required.' });
      return;
    }

    const announcement = await Announcement.create({
      title,
      message,
      priority: priority || 'MEDIUM',
      targetAudience: targetAudience || 'ALL',
      createdBy: req.user!._id,
      attachments: attachments || [],
      expiryDate: expiryDate ? new Date(expiryDate) : undefined
    });

    // Notify users
    const query: any = { accountStatus: 'ACTIVE', _id: { $ne: req.user!._id } };
    if (targetAudience === 'FACULTY') query.role = 'FACULTY';
    if (targetAudience === 'COORDINATORS') query.role = 'COORDINATOR';

    const recipients = await User.find(query).select('_id');
    const notifications = recipients.map((r) => ({
      recipientId: r._id,
      senderId: req.user!._id,
      title: `CSE Department Notice: ${title}`,
      message: message.substring(0, 100) + '...',
      type: 'ANNOUNCEMENT',
      referenceId: announcement._id,
      referenceModel: 'Announcement'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, message: 'Announcement published successfully.', data: announcement });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acknowledgeAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    await Announcement.findByIdAndUpdate(id, {
      $addToSet: {
        acknowledgedBy: { userId, acknowledgedAt: new Date() }
      }
    });

    res.json({ success: true, message: 'Announcement acknowledged.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, message, priority, targetAudience } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      res.status(404).json({ success: false, message: 'Announcement not found.' });
      return;
    }

    if (title) announcement.title = title;
    if (message) announcement.message = message;
    if (priority) announcement.priority = priority;
    if (targetAudience) announcement.targetAudience = targetAudience;

    await announcement.save();
    res.json({ success: true, message: 'Announcement updated successfully.', data: announcement });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      res.status(404).json({ success: false, message: 'Announcement not found.' });
      return;
    }

    res.json({ success: true, message: 'Announcement deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipientId: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user!._id },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { recipientId: req.user!._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendFacultyReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { facultyId, message, taskId } = req.body;
    if (!facultyId) {
      res.status(400).json({ success: false, message: 'Faculty recipient ID is required.' });
      return;
    }

    const senderRole = req.user?.role === 'COORDINATOR' ? 'Academic Coordinator' : 'Dean, CSE';
    const senderName = req.user?.fullName ? `${req.user.fullName} (${senderRole})` : senderRole;

    const notification = new Notification({
      recipientId: facultyId,
      senderId: req.user!._id,
      title: `Task Reminder from ${senderName}`,
      message:
        message && message.trim().length > 0
          ? message.trim()
          : 'Please complete and submit your pending departmental deliverables.',
      type: 'TASK_DEADLINE_APPROACHING',
      referenceId: taskId || undefined,
      referenceModel: taskId ? 'Task' : undefined,
      isRead: false
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Reminder notification successfully sent to faculty member.',
      data: notification
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

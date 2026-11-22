import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';

export const getAllFaculty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({ accountStatus: 'ACTIVE' })
      .select('-passwordHash')
      .sort({ role: 1, fullName: 1 });
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRegistrationRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pendingUsers = await User.find({ accountStatus: 'PENDING' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: pendingUsers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleRegistrationApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, action, assignedRole } = req.body; // action: 'APPROVE' | 'REJECT'
    if (!userId || !action) {
      res.status(400).json({ success: false, message: 'User ID and action are required.' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (action === 'APPROVE') {
      user.accountStatus = 'ACTIVE';
      if (assignedRole && ['HOD', 'COORDINATOR', 'FACULTY'].includes(assignedRole)) {
        user.role = assignedRole;
      }
      await user.save();
      res.json({ success: true, message: `Account approved for ${user.fullName} (${user.role}).`, data: user });
    } else {
      user.accountStatus = 'REJECTED';
      await user.save();
      res.json({ success: true, message: `Account rejected for ${user.fullName}.`, data: user });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

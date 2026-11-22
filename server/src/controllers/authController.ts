import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { DeviceSession } from '../models/DeviceSession.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, employeeId, role, designation, password } = req.body;

    if (!fullName || !email || !employeeId || !password) {
      res.status(400).json({ success: false, message: 'Please provide all required fields.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { employeeId: employeeId.trim() }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An account with this email address or Employee ID already exists.'
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Initial administrative setup vs regular registration
    // If it's the very first HOD in system, it could be auto-active, otherwise requires HOD approval
    const totalUsers = await User.countDocuments();
    const isFirstUser = totalUsers === 0;

    // Security rule: Only 1 HOD can exist. Public users cannot register as HOD.
    const requestedRole = role === 'COORDINATOR' ? 'COORDINATOR' : 'FACULTY';
    const accountStatus = isFirstUser ? 'ACTIVE' : 'PENDING';

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      employeeId: employeeId.trim(),
      role: isFirstUser ? 'HOD' : requestedRole,
      department: 'Computer Science and Engineering',
      designation: designation || 'Assistant Professor',
      passwordHash,
      accountStatus,
      isEmailVerified: true
    });

    res.status(201).json({
      success: true,
      message:
        accountStatus === 'ACTIVE'
          ? 'Dean Master Account created and activated successfully.'
          : 'Registration request submitted. Pending verification and Dean approval.',
      data: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        accountStatus: newUser.accountStatus
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, deviceId, deviceName, deviceType } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Institutional email and password are required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email credentials or account not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid password. Please check and try again.' });
      return;
    }

    if (user.accountStatus === 'PENDING') {
      res.status(403).json({
        success: false,
        message: 'Your registration is pending review & approval by the CSE Dean.'
      });
      return;
    }

    if (user.accountStatus === 'REJECTED' || user.accountStatus === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        message: `Your account is ${user.accountStatus.toLowerCase()}. Please contact the CSE Department Administration.`
      });
      return;
    }

    // Device session tracking for simultaneous multi-device logins
    const currentDeviceId = deviceId || crypto.randomUUID();
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      deviceId: currentDeviceId
    };

    const tokens = generateTokens(tokenPayload);

    // Hash refresh token for DB storage
    const refreshTokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Upsert device session
    await DeviceSession.findOneAndUpdate(
      { userId: user._id, deviceId: currentDeviceId },
      {
        deviceName: deviceName || 'Web Browser',
        deviceType: deviceType || 'desktop',
        refreshTokenHash,
        isActive: true,
        lastActiveAt: new Date(),
        expiresAt
      },
      { upsert: true, new: true }
    );

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        deviceId: currentDeviceId,
        user: {
          _id: user._id,
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          department: user.department,
          designation: user.role === 'HOD' ? 'Dean, CSE' : user.designation,
          avatarUrl: user.avatarUrl,
          notificationPreferences: user.notificationPreferences
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken, deviceId } = req.body;
    if (!refreshToken || !deviceId) {
      res.status(400).json({ success: false, message: 'Refresh token and deviceId required.' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const session = await DeviceSession.findOne({
      userId: decoded.userId,
      deviceId,
      isActive: true
    });

    if (!session) {
      res.status(401).json({ success: false, message: 'Invalid or revoked device session.' });
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (session.refreshTokenHash !== hashedToken) {
      res.status(401).json({ success: false, message: 'Token rotation mismatch. Session invalidated.' });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.accountStatus !== 'ACTIVE') {
      res.status(403).json({ success: false, message: 'User not active.' });
      return;
    }

    const newTokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      deviceId
    });

    session.refreshTokenHash = crypto.createHash('sha256').update(newTokens.refreshToken).digest('hex');
    session.lastActiveAt = new Date();
    await session.save();

    res.json({
      success: true,
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

export const getActiveSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await DeviceSession.find({
      userId: req.user!._id,
      isActive: true
    }).sort({ lastActiveAt: -1 });

    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.body;
    const targetDeviceId = deviceId || req.tokenPayload?.deviceId;

    await DeviceSession.findOneAndUpdate(
      { userId: req.user!._id, deviceId: targetDeviceId },
      { isActive: false }
    );

    res.json({ success: true, message: 'Device session logged out successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutAllSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await DeviceSession.updateMany(
      { userId: req.user!._id },
      { isActive: false }
    );
    res.json({ success: true, message: 'All active device sessions terminated.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNotificationPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { inApp, email, sms, classReminders, reminderOffsetMinutes } = req.body;
    const user = req.user!;

    if (inApp !== undefined) user.notificationPreferences.inApp = Boolean(inApp);
    if (email !== undefined) user.notificationPreferences.email = Boolean(email);
    if (sms !== undefined) user.notificationPreferences.sms = Boolean(sms);
    if (classReminders !== undefined) user.notificationPreferences.classReminders = Boolean(classReminders);
    if (reminderOffsetMinutes !== undefined) user.notificationPreferences.reminderOffsetMinutes = Number(reminderOffsetMinutes);

    await user.save();
    res.json({ success: true, message: 'Notification preferences updated.', data: user.notificationPreferences });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, designation, phone } = req.body;
    const user = req.user!;

    if (fullName) user.fullName = fullName.trim();
    if (designation) user.designation = designation.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();
    res.json({ success: true, message: 'Profile details updated successfully.', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user!;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

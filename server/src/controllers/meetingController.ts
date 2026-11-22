import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Meeting } from '../models/Meeting.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export const getMeetings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const meetings = await Meeting.find({
      $or: [{ organizerId: userId }, { 'participants.userId': userId }]
    })
      .populate('organizerId', 'fullName role designation')
      .populate('participants.userId', 'fullName email role designation')
      .sort({ date: 1, startTime: 1 });

    // Auto-update meetings whose end time in IST has already passed to COMPLETED
    const nowUtc = new Date().getTime();
    for (const m of meetings) {
      if (m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS') {
        // Calculate meeting end timestamp in UTC
        const meetingDate = new Date(m.date);
        const [hours, minutes] = (m.startTime || '00:00').split(':').map(Number);
        
        // Meeting date stored as UTC midnight or date
        // Since user creates date YYYY-MM-DD and time HH:mm in IST (UTC+5:30):
        const y = meetingDate.getFullYear();
        const mon = meetingDate.getMonth();
        const d = meetingDate.getDate();
        // Convert IST time to UTC timestamp:
        const meetingStartUtc = Date.UTC(y, mon, d, hours, minutes) - (5.5 * 60 * 60 * 1000);
        const meetingEndUtc = meetingStartUtc + (m.durationMinutes || 60) * 60 * 1000;

        if (nowUtc > meetingEndUtc) {
          m.status = 'COMPLETED';
          await Meeting.findByIdAndUpdate(m._id, { status: 'COMPLETED' });
        }
      }
    }

    res.json({ success: true, data: meetings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, agenda, date, startTime, durationMinutes, participantIds, googleMeetLink, targetRoles } = req.body;

    if (!title || !date || !startTime) {
      res.status(400).json({ success: false, message: 'Title, date, and startTime are required.' });
      return;
    }

    // Disallow scheduling meetings on dates before today in IST (UTC+5:30)
    const nowUtc = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const todayIst = new Date(nowUtc.getTime() + istOffsetMs);
    todayIst.setUTCHours(0, 0, 0, 0);

    const meetingDateObj = new Date(date);
    // meeting date string YYYY-MM-DD
    const meetingDateParts = date.split('-');
    if (meetingDateParts.length === 3) {
      const targetDateIst = new Date(Date.UTC(Number(meetingDateParts[0]), Number(meetingDateParts[1]) - 1, Number(meetingDateParts[2])));
      if (targetDateIst < todayIst) {
        res.status(400).json({ success: false, message: 'Cannot schedule meetings on dates prior to today.' });
        return;
      }
    }

    let finalParticipantUserIds: string[] = [];

    // If specific targetRoles are provided (e.g. ['FACULTY'] or ['COORDINATOR'] or ['HOD'])
    if (targetRoles && Array.isArray(targetRoles) && targetRoles.length > 0) {
      const usersInRoles = await User.find({
        role: { $in: targetRoles },
        accountStatus: 'ACTIVE',
        _id: { $ne: req.user!._id }
      }).select('_id');
      finalParticipantUserIds = usersInRoles.map((u) => u._id.toString());
    } else if (participantIds && Array.isArray(participantIds) && participantIds.length > 0) {
      finalParticipantUserIds = participantIds;
    } else {
      // Default: include all active faculty
      const allFaculty = await User.find({
        role: 'FACULTY',
        accountStatus: 'ACTIVE',
        _id: { $ne: req.user!._id }
      }).select('_id');
      finalParticipantUserIds = allFaculty.map((u) => u._id.toString());
    }

    const participants = finalParticipantUserIds.map((id: string) => ({
      userId: id,
      status: 'INVITED'
    }));

    const meeting = await Meeting.create({
      title,
      description: description || '',
      agenda: agenda || '',
      date: new Date(date),
      startTime,
      durationMinutes: durationMinutes || 60,
      organizerId: req.user!._id,
      participants,
      googleMeetLink: googleMeetLink || 'https://meet.google.com/new',
      status: 'SCHEDULED'
    });

    for (const p of participants) {
      await Notification.create({
        recipientId: p.userId,
        senderId: req.user!._id,
        title: 'Academic Meeting Invitation',
        message: `Invited to: "${title}" on ${new Date(date).toLocaleDateString()} at ${startTime}.`,
        type: 'MEETING_INVITE',
        referenceId: meeting._id,
        referenceModel: 'Meeting'
      });
    }

    res.status(201).json({ success: true, message: 'Meeting scheduled.', data: meeting });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMeetingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, minutesOfMeeting } = req.body;

    const meeting = await Meeting.findByIdAndUpdate(
      id,
      { status, minutesOfMeeting },
      { new: true }
    );

    res.json({ success: true, data: meeting });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const editMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, durationMinutes, googleMeetLink } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found.' });
      return;
    }

    if (title) meeting.title = title.trim();
    if (description !== undefined) meeting.description = description.trim();
    if (date) meeting.date = new Date(date);
    if (startTime) meeting.startTime = startTime;
    if (durationMinutes) meeting.durationMinutes = Number(durationMinutes);
    if (googleMeetLink) meeting.googleMeetLink = googleMeetLink.trim();

    await meeting.save();
    res.json({ success: true, message: 'Meeting details updated successfully.', data: meeting });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findByIdAndUpdate(
      id,
      { status: 'CANCELLED' },
      { new: true }
    );

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found.' });
      return;
    }

    // Notify participants
    for (const p of meeting.participants) {
      await Notification.create({
        recipientId: p.userId,
        senderId: req.user!._id,
        title: 'Meeting Cancelled',
        message: `The meeting "${meeting.title}" scheduled for ${new Date(meeting.date).toLocaleDateString()} has been cancelled.`,
        type: 'MEETING_INVITE',
        referenceId: meeting._id,
        referenceModel: 'Meeting'
      });
    }

    res.json({ success: true, message: 'Meeting has been cancelled.', data: meeting });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

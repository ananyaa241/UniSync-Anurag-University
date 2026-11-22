import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ClassSchedule } from '../models/ClassSchedule.js';

export const getMySchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedules = await ClassSchedule.find({ facultyId: req.user!._id }).sort({ startTime: 1 });
    res.json({ success: true, data: schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      subject,
      subjectCode,
      classSection,
      classroom,
      dayOfWeek,
      startTime,
      endTime,
      recurrenceDays,
      reminderOffsetMinutes,
      notes
    } = req.body;

    if (!subject || !classSection || !classroom || !startTime || !endTime) {
      res.status(400).json({ success: false, message: 'Please provide all mandatory schedule fields.' });
      return;
    }

    const schedule = await ClassSchedule.create({
      facultyId: req.user!._id,
      subject,
      subjectCode,
      classSection,
      classroom,
      dayOfWeek: dayOfWeek || 1,
      startTime,
      endTime,
      recurrenceDays: recurrenceDays || [1, 2, 3, 4, 5],
      reminderOffsetMinutes: reminderOffsetMinutes !== undefined ? reminderOffsetMinutes : 10,
      notes
    });

    res.status(201).json({ success: true, message: 'Class schedule added.', data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const schedule = await ClassSchedule.findOneAndUpdate(
      { _id: id, facultyId: req.user!._id },
      req.body,
      { new: true }
    );
    if (!schedule) {
      res.status(404).json({ success: false, message: 'Schedule not found.' });
      return;
    }
    res.json({ success: true, message: 'Schedule updated.', data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await ClassSchedule.findOneAndDelete({ _id: id, facultyId: req.user!._id });
    res.json({ success: true, message: 'Schedule removed.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

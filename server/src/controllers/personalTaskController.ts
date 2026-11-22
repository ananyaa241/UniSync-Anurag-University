import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { PersonalTask } from '../models/PersonalTask.js';

export const getPersonalTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await PersonalTask.find({ facultyId: req.user!._id }).sort({ isCompleted: 1, createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPersonalTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, dueDate, priority, checklist, notes } = req.body;
    if (!title) {
      res.status(400).json({ success: false, message: 'Title is required.' });
      return;
    }

    const task = await PersonalTask.create({
      facultyId: req.user!._id,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'MEDIUM',
      checklist: checklist || [],
      notes
    });

    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePersonalTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await PersonalTask.findOneAndUpdate(
      { _id: id, facultyId: req.user!._id },
      req.body,
      { new: true }
    );
    if (!task) {
      res.status(404).json({ success: false, message: 'Personal task not found.' });
      return;
    }
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePersonalTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await PersonalTask.findOneAndDelete({ _id: id, facultyId: req.user!._id });
    res.json({ success: true, message: 'Task deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

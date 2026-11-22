import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { FeedbackRequest } from '../models/FeedbackRequest.js';
import { Notification } from '../models/Notification.js';
import { Task } from '../models/Task.js';

export const getRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    let query: any = {};

    if (user.role === 'FACULTY') {
      query.facultyId = user._id;
    } else if (user.role === 'COORDINATOR') {
      // Coordinator sees requests meant for coordinator or their assigned
      query = { reviewerRole: 'COORDINATOR' };
    }

    const requests = await FeedbackRequest.find(query)
      .populate('facultyId', 'fullName email designation employeeId')
      .populate('assignedReviewerId', 'fullName role')
      .populate('taskId', 'title dueDate')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, category, description, priority, reviewerRole, attachments, taskId, requestedDueDate } = req.body;

    if (!title || !description) {
      res.status(400).json({ success: false, message: 'Title and description are required.' });
      return;
    }

    const request = await FeedbackRequest.create({
      facultyId: req.user!._id,
      title,
      category: category || 'General Feedback',
      description,
      priority: priority || 'MEDIUM',
      reviewerRole: reviewerRole || 'COORDINATOR',
      attachments: attachments || [],
      taskId: taskId || undefined,
      requestedDueDate: requestedDueDate ? new Date(requestedDueDate) : undefined,
      status: 'SUBMITTED'
    });

    res.status(201).json({ success: true, message: 'Request submitted.', data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleRequestReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reviewRemarks, forwardToHod } = req.body;

    const request = await FeedbackRequest.findById(id);
    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found.' });
      return;
    }

    if (forwardToHod) {
      request.reviewerRole = 'HOD';
      request.status = 'FORWARDED_TO_HOD';
    } else if (status) {
      request.status = status;
    }

    if (reviewRemarks) {
      request.reviewRemarks = reviewRemarks;
    }

    request.assignedReviewerId = req.user!._id;

    // If deadline extension approved, update task deadline
    if (status === 'APPROVED' && request.category === 'Deadline Extension' && request.taskId && request.requestedDueDate) {
      await Task.findByIdAndUpdate(request.taskId, {
        dueDate: request.requestedDueDate
      });
    }

    await request.save();

    // Notify faculty
    await Notification.create({
      recipientId: request.facultyId,
      senderId: req.user!._id,
      title: `Request Status Update: ${request.title}`,
      message: `Your request is now marked as ${request.status}. Remarks: ${reviewRemarks || 'No remarks.'}`,
      type: 'REQUEST_UPDATE',
      referenceId: request._id,
      referenceModel: 'FeedbackRequest'
    });

    res.json({ success: true, message: 'Request review saved.', data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

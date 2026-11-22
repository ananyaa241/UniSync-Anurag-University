import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Task } from '../models/Task.js';
import { Notification } from '../models/Notification.js';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { scope, facultyId, taskType } = req.query as { scope?: string; facultyId?: string; taskType?: string };
    let query: any = { isArchived: false };

    if (user.role === 'FACULTY') {
      query['assignees.facultyId'] = user._id;
    } else if (user.role === 'COORDINATOR') {
      if (scope === 'dean_tasks' || taskType === 'DEAN_TO_COORDINATOR') {
        // Coordinator viewing tasks assigned directly to them by Dean
        query['taskType'] = 'DEAN_TO_COORDINATOR';
        query['assignees.facultyId'] = user._id;
      } else if (scope === 'faculty_tasks' || taskType === 'COORDINATOR_TO_FACULTY') {
        // Coordinator managing faculty tasks
        query['taskType'] = 'COORDINATOR_TO_FACULTY';
        if (facultyId) {
          query['assignees.facultyId'] = facultyId;
        }
      } else {
        // Default: return tasks assigned to coordinator OR tasks created for faculty
        query.$or = [
          { taskType: 'DEAN_TO_COORDINATOR', 'assignees.facultyId': user._id },
          { taskType: 'COORDINATOR_TO_FACULTY' }
        ];
      }
    } else if (user.role === 'HOD') {
      if (scope === 'dean_tasks' || taskType === 'DEAN_TO_COORDINATOR') {
        query['taskType'] = 'DEAN_TO_COORDINATOR';
      } else if (scope === 'faculty_tasks' || taskType === 'COORDINATOR_TO_FACULTY') {
        query['taskType'] = 'COORDINATOR_TO_FACULTY';
      }
      if (facultyId) {
        query['assignees.facultyId'] = facultyId;
      }
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'fullName role designation email')
      .populate('assignees.facultyId', 'fullName email employeeId designation role')
      .sort({ createdAt: -1, dueDate: 1 });

    // Strict Privacy Filtering:
    // If the user is FACULTY, filter assignees list so they only see their own assignment & submission
    const sanitizedTasks = tasks.map((task) => {
      const taskObj = task.toObject();
      if (user.role === 'FACULTY') {
        taskObj.assignees = taskObj.assignees.filter(
          (a: any) =>
            a.facultyId?._id?.toString() === user._id.toString() ||
            a.facultyId?.toString() === user._id.toString()
        );
      }
      return taskObj;
    });

    res.json({ success: true, data: sanitizedTasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const task = await Task.findById(id)
      .populate('createdBy', 'fullName role designation email')
      .populate('assignees.facultyId', 'fullName email employeeId designation role');

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    const taskObj = task.toObject();
    if (user.role === 'FACULTY') {
      const isAssigned = taskObj.assignees.some(
        (a: any) => a.facultyId?._id?.toString() === user._id.toString() || a.facultyId?.toString() === user._id.toString()
      );
      if (!isAssigned) {
        res.status(403).json({ success: false, message: 'Access Denied: Task not assigned to you.' });
        return;
      }
      taskObj.assignees = taskObj.assignees.filter(
        (a: any) => a.facultyId?._id?.toString() === user._id.toString() || a.facultyId?.toString() === user._id.toString()
      );
    }

    res.json({ success: true, data: taskObj });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      priority,
      assigneeIds,
      startDate,
      dueDate,
      dueTime,
      reviewRequired,
      requiredDocumentsDescription,
      instructions,
      expectedDeliverables,
      attachments
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Task title is required.' });
      return;
    }

    const isDean = req.user!.role === 'HOD';
    const assignees = (assigneeIds || []).map((id: string) => ({
      facultyId: id,
      role: isDean ? 'COORDINATOR' : 'FACULTY',
      status: 'NOT_STARTED',
      submissionFiles: []
    }));

    const effectiveDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const effectiveDesc = description ? description.trim() : '';
    const effectiveInstructions = instructions ? instructions.trim() : '';

    const task = await Task.create({
      title: title.trim(),
      description: effectiveDesc,
      category: category || (isDean ? 'Accreditation' : 'Academic'),
      priority: priority || 'MEDIUM',
      createdBy: req.user!._id,
      creatorRole: isDean ? 'DEAN' : 'COORDINATOR',
      taskType: isDean ? 'DEAN_TO_COORDINATOR' : 'COORDINATOR_TO_FACULTY',
      assignees,
      startDate: startDate ? new Date(startDate) : new Date(),
      dueDate: effectiveDueDate,
      dueTime: dueTime || '17:00',
      reviewRequired: reviewRequired !== undefined ? reviewRequired : true,
      instructions: effectiveInstructions,
      expectedDeliverables: expectedDeliverables ? expectedDeliverables.trim() : '',
      attachments: Array.isArray(attachments) ? attachments : [],
      requiredDocumentsDescription,
      overallStatus: 'NOT_STARTED'
    });

    // Notify all assigned coordinators or faculty
    for (const assignee of assignees) {
      await Notification.create({
        recipientId: assignee.facultyId,
        senderId: req.user!._id,
        title: isDean ? 'New Executive Responsibility Assigned by Dean' : 'New Academic Task Assigned',
        message: isDean
          ? `Dean Dr. G. Vishnu Murthy has assigned you: "${title}". Due by ${new Date(dueDate).toLocaleDateString()}.`
          : `You have been assigned: "${title}". Due by ${new Date(dueDate).toLocaleDateString()}.`,
        type: 'TASK_ASSIGNED',
        referenceId: task._id,
        referenceModel: 'Task'
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'fullName role designation email')
      .populate('assignees.facultyId', 'fullName email employeeId designation role');

    res.status(201).json({ success: true, message: 'Task created and assigned successfully.', data: populatedTask });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks, progressPercentage, notes } = req.body;
    const user = req.user!;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    // Check if user is an assignee (Faculty on coordinator task, or Coordinator on Dean task)
    const assignee = task.assignees.find(
      (a) =>
        a.facultyId.toString() === user._id.toString() ||
        (a.facultyId as any)?._id?.toString() === user._id.toString()
    );

    if (assignee) {
      if (status) assignee.status = status;
      if (progressPercentage !== undefined) {
        assignee.progressPercentage = Math.min(100, Math.max(0, Number(progressPercentage)));
        task.progressPercentage = assignee.progressPercentage;
      }
      if (notes) assignee.submissionNotes = notes;

      if (status === 'IN_PROGRESS') {
        task.overallStatus = 'IN_PROGRESS';
      } else if (status === 'COMPLETED' && !task.reviewRequired) {
        task.overallStatus = 'COMPLETED';
      }

      await task.save();
      const populated = await Task.findById(id)
        .populate('createdBy', 'fullName role designation email')
        .populate('assignees.facultyId', 'fullName email employeeId designation role');
      res.json({ success: true, message: 'Task progress updated successfully.', data: populated });
      return;
    }

    // Coordinator or Dean updating task overall status as creator
    if (user.role === 'HOD' || task.createdBy.toString() === user._id.toString()) {
      if (status) task.overallStatus = status;
      if (progressPercentage !== undefined) task.progressPercentage = Number(progressPercentage);
      await task.save();
      const populated = await Task.findById(id)
        .populate('createdBy', 'fullName role designation email')
        .populate('assignees.facultyId', 'fullName email employeeId designation role');
      res.json({ success: true, message: 'Overall task status updated.', data: populated });
      return;
    }

    res.status(403).json({ success: false, message: 'You are not authorized to update this task.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitTaskWork = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes, files } = req.body; // files: [{ fileName, fileUrl, fileSize, mimeType }]
    const user = req.user!;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    const assignee = task.assignees.find((a) => a.facultyId.toString() === user._id.toString());
    if (!assignee) {
      res.status(403).json({ success: false, message: 'You are not assigned to this task.' });
      return;
    }

    assignee.status = task.reviewRequired ? 'SUBMITTED' : 'COMPLETED';
    assignee.submittedAt = new Date();
    assignee.submissionNotes = notes;

    if (files && Array.isArray(files)) {
      const currentVersion = assignee.submissionFiles.length > 0 ? assignee.submissionFiles[assignee.submissionFiles.length - 1].version + 1 : 1;
      for (const f of files) {
        assignee.submissionFiles.push({
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize || 0,
          mimeType: f.mimeType || 'application/pdf',
          uploadedAt: new Date(),
          version: currentVersion
        });
      }
    }

    // Check overall status
    const allCompletedOrSubmitted = task.assignees.every(
      (a) => a.status === 'SUBMITTED' || a.status === 'COMPLETED'
    );
    if (allCompletedOrSubmitted) {
      task.overallStatus = task.reviewRequired ? 'SUBMITTED' : 'COMPLETED';
    } else {
      task.overallStatus = 'IN_PROGRESS';
    }

    await task.save();

    // Notify task creator
    await Notification.create({
      recipientId: task.createdBy,
      senderId: user._id,
      title: 'Task Submission Received',
      message: `${user.fullName} has submitted documents for: "${task.title}".`,
      type: 'TASK_SUBMITTED',
      referenceId: task._id,
      referenceModel: 'Task'
    });

    res.json({ success: true, message: 'Work submitted successfully.', data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewTaskSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { facultyId, action, remarks } = req.body; // action: 'APPROVE' | 'REVISE'
    const user = req.user!;
    const isDean = user.role === 'HOD';

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    // Determine target assignees
    let targetAssignees = task.assignees;
    if (facultyId) {
      const match = task.assignees.find(
        (a) => a.facultyId.toString() === facultyId.toString() || (a as any)._id?.toString() === facultyId.toString()
      );
      if (match) targetAssignees = [match];
    }

    for (const assignee of targetAssignees) {
      assignee.reviewedAt = new Date();
      assignee.reviewerRemarks = remarks || '';

      if (action === 'APPROVE') {
        assignee.status = 'COMPLETED';
        assignee.progressPercentage = 100;

        await Notification.create({
          recipientId: assignee.facultyId,
          senderId: user._id,
          title: 'Task Submission Approved',
          message: isDean
            ? `Dean Dr. G. Vishnu Murthy has APPROVED your deliverable: "${task.title}".`
            : `Your submission for "${task.title}" has been approved.`,
          type: 'TASK_APPROVED',
          referenceId: task._id,
          referenceModel: 'Task'
        });
      } else {
        assignee.status = 'REVISION_REQUESTED';

        await Notification.create({
          recipientId: assignee.facultyId,
          senderId: user._id,
          title: 'Task Revision Requested',
          message: isDean
            ? `Dean Dr. G. Vishnu Murthy requested revisions on "${task.title}": ${remarks || 'Please update your submission.'}`
            : `Revision requested on "${task.title}": ${remarks || 'Please update your submission.'}`,
          type: 'TASK_REVISION',
          referenceId: task._id,
          referenceModel: 'Task'
        });
      }
    }

    if (action === 'APPROVE') {
      const allApproved = task.assignees.every((a) => a.status === 'COMPLETED');
      if (allApproved || isDean) {
        task.overallStatus = 'COMPLETED';
        task.progressPercentage = 100;
      }
    } else {
      task.overallStatus = 'UNDER_REVIEW';
    }

    await task.save();

    const populated = await Task.findById(id)
      .populate('createdBy', 'fullName role designation email')
      .populate('assignees.facultyId', 'fullName email employeeId designation role');

    res.json({
      success: true,
      message: `Submission ${action === 'APPROVE' ? 'approved' : 'returned for revision'}.`,
      data: populated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      priority,
      startDate,
      dueDate,
      dueTime,
      instructions,
      expectedDeliverables,
      assigneeIds,
      attachments,
      overallStatus
    } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    // Permission check:
    // Dean can edit Dean tasks.
    // Coordinator can ONLY edit tasks they created (taskType === 'COORDINATOR_TO_FACULTY' and createdBy === user._id).
    // The Academic Coordinator must not modify original tasks assigned by the Dean.
    if (req.user!.role === 'COORDINATOR') {
      if (task.taskType === 'DEAN_TO_COORDINATOR' || task.createdBy.toString() !== req.user!._id.toString()) {
        res.status(403).json({
          success: false,
          message: 'Permission Denied: The Academic Coordinator cannot modify original tasks assigned by the Dean.'
        });
        return;
      }
    } else if (req.user!.role !== 'HOD' && task.createdBy.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized: You can only edit tasks you have created.' });
      return;
    }

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description ? description.trim() : '';
    if (category) task.category = category;
    if (priority) task.priority = priority;
    if (startDate) task.startDate = new Date(startDate);
    if (dueDate) task.dueDate = new Date(dueDate);
    if (dueTime) task.dueTime = dueTime;
    if (instructions !== undefined) task.instructions = instructions;
    if (expectedDeliverables !== undefined) task.expectedDeliverables = expectedDeliverables;
    if (attachments && Array.isArray(attachments)) task.attachments = attachments;
    if (overallStatus) task.overallStatus = overallStatus;

    if (assigneeIds && Array.isArray(assigneeIds)) {
      const isDean = req.user!.role === 'HOD';
      task.assignees = assigneeIds.map((aid: string) => {
        const existing = task.assignees.find((a) => a.facultyId.toString() === aid);
        if (existing) return existing;
        return {
          facultyId: aid as any,
          role: isDean ? 'COORDINATOR' : 'FACULTY',
          status: 'NOT_STARTED',
          progressPercentage: 0,
          submissionFiles: []
        };
      });
    }

    await task.save();

    // Notify assignees of task updates
    for (const assignee of task.assignees) {
      await Notification.create({
        recipientId: assignee.facultyId,
        senderId: req.user!._id,
        title: 'Task Details Updated',
        message: `Task "${task.title}" has been updated. Due: ${new Date(task.dueDate).toLocaleDateString()} at ${task.dueTime || '17:00'}.`,
        type: 'TASK_ASSIGNED',
        referenceId: task._id,
        referenceModel: 'Task'
      });
    }

    const updatedTask = await Task.findById(id)
      .populate('createdBy', 'fullName role designation email')
      .populate('assignees.facultyId', 'fullName email employeeId designation role');

    res.json({ success: true, message: 'Task updated successfully.', data: updatedTask });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    // Permission check:
    // Dean can delete tasks.
    // Coordinator can ONLY delete tasks they created.
    // The Academic Coordinator must not delete original tasks assigned by the Dean.
    if (req.user!.role === 'COORDINATOR') {
      if (task.taskType === 'DEAN_TO_COORDINATOR' || task.createdBy.toString() !== req.user!._id.toString()) {
        res.status(403).json({
          success: false,
          message: 'Permission Denied: The Academic Coordinator cannot delete original tasks assigned by the Dean.'
        });
        return;
      }
    } else if (req.user!.role !== 'HOD' && task.createdBy.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized: You can only delete tasks you have created.' });
      return;
    }

    task.isArchived = true;
    await task.save();

    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

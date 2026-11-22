import { Router, Request, Response } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import * as authCtrl from '../controllers/authController.js';
import * as userCtrl from '../controllers/userController.js';
import * as taskCtrl from '../controllers/taskController.js';
import * as personalTaskCtrl from '../controllers/personalTaskController.js';
import * as scheduleCtrl from '../controllers/scheduleController.js';
import * as chatCtrl from '../controllers/chatController.js';
import * as announcementCtrl from '../controllers/announcementController.js';
import * as meetingCtrl from '../controllers/meetingController.js';
import * as requestCtrl from '../controllers/requestController.js';
import * as notificationCtrl from '../controllers/notificationController.js';
import * as emailCtrl from '../controllers/emailController.js';
import * as aiCtrl from '../controllers/aiController.js';
import * as analyticsCtrl from '../controllers/analyticsController.js';

export const router = Router();

// 1. Auth routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.post('/auth/refresh-token', authCtrl.refreshToken);
router.get('/auth/me', authenticate, authCtrl.getMe);
router.get('/auth/sessions', authenticate, authCtrl.getActiveSessions);
router.post('/auth/logout', authenticate, authCtrl.logoutSession);
router.post('/auth/logout-all', authenticate, authCtrl.logoutAllSessions);
router.put('/auth/preferences', authenticate, authCtrl.updateNotificationPreferences);
router.put('/auth/profile', authenticate, authCtrl.updateProfile);
router.put('/auth/change-password', authenticate, authCtrl.changePassword);

// 2. Users & Faculty Directory
router.get('/users/faculty', authenticate, userCtrl.getAllFaculty);
router.get('/users/registrations', authenticate, authorizeRoles('HOD'), userCtrl.getRegistrationRequests);
router.post('/users/registrations/approve', authenticate, authorizeRoles('HOD'), userCtrl.handleRegistrationApproval);

// 3. Tasks & Submissions
router.get('/tasks', authenticate, taskCtrl.getTasks);
router.get('/tasks/:id', authenticate, taskCtrl.getTaskById);
router.post('/tasks', authenticate, authorizeRoles('HOD', 'COORDINATOR'), taskCtrl.createTask);
router.put('/tasks/:id', authenticate, authorizeRoles('HOD', 'COORDINATOR'), taskCtrl.updateTask);
router.delete('/tasks/:id', authenticate, authorizeRoles('HOD', 'COORDINATOR'), taskCtrl.deleteTask);
router.put('/tasks/:id/status', authenticate, taskCtrl.updateTaskStatus);
router.post('/tasks/:id/submit', authenticate, taskCtrl.submitTaskWork);
router.post('/tasks/:id/review', authenticate, authorizeRoles('HOD', 'COORDINATOR'), taskCtrl.reviewTaskSubmission);

// 4. Personal Tasks
router.get('/personal-tasks', authenticate, personalTaskCtrl.getPersonalTasks);
router.post('/personal-tasks', authenticate, personalTaskCtrl.createPersonalTask);
router.put('/personal-tasks/:id', authenticate, personalTaskCtrl.updatePersonalTask);
router.delete('/personal-tasks/:id', authenticate, personalTaskCtrl.deletePersonalTask);

// 5. Schedules
router.get('/schedules', authenticate, scheduleCtrl.getMySchedules);
router.post('/schedules', authenticate, scheduleCtrl.createSchedule);
router.put('/schedules/:id', authenticate, scheduleCtrl.updateSchedule);
router.delete('/schedules/:id', authenticate, scheduleCtrl.deleteSchedule);

// 6. Real-time Chat
router.get('/chat/conversations', authenticate, chatCtrl.getConversations);
router.post('/chat/conversations', authenticate, chatCtrl.createConversation);
router.get('/chat/messages/:conversationId', authenticate, chatCtrl.getMessages);
router.post('/chat/messages', authenticate, chatCtrl.sendMessage);

// 7. Announcements
router.get('/announcements', authenticate, announcementCtrl.getAnnouncements);
router.post('/announcements', authenticate, authorizeRoles('HOD', 'COORDINATOR'), announcementCtrl.createAnnouncement);
router.put('/announcements/:id', authenticate, authorizeRoles('HOD', 'COORDINATOR'), announcementCtrl.updateAnnouncement);
router.delete('/announcements/:id', authenticate, authorizeRoles('HOD'), announcementCtrl.deleteAnnouncement);
router.post('/announcements/:id/acknowledge', authenticate, announcementCtrl.acknowledgeAnnouncement);

// 8. Meetings
router.get('/meetings', authenticate, meetingCtrl.getMeetings);
router.post('/meetings', authenticate, authorizeRoles('HOD', 'COORDINATOR'), meetingCtrl.createMeeting);
router.put('/meetings/:id', authenticate, meetingCtrl.updateMeetingStatus);
router.put('/meetings/:id/edit', authenticate, authorizeRoles('HOD', 'COORDINATOR'), meetingCtrl.editMeeting);
router.delete('/meetings/:id', authenticate, authorizeRoles('HOD', 'COORDINATOR'), meetingCtrl.cancelMeeting);

// 9. Feedback Requests
router.get('/requests', authenticate, requestCtrl.getRequests);
router.post('/requests', authenticate, requestCtrl.createRequest);
router.put('/requests/:id/review', authenticate, authorizeRoles('HOD', 'COORDINATOR'), requestCtrl.handleRequestReview);

// 10. Notifications
router.get('/notifications', authenticate, notificationCtrl.getNotifications);
router.post('/notifications/reminder', authenticate, authorizeRoles('HOD', 'COORDINATOR'), notificationCtrl.sendFacultyReminder);
router.put('/notifications/:id/read', authenticate, notificationCtrl.markAsRead);
router.put('/notifications/read-all', authenticate, notificationCtrl.markAllAsRead);

// 11. Email
router.post('/emails/send', authenticate, emailCtrl.sendEmail);
router.get('/emails/sent', authenticate, emailCtrl.getSentEmails);

// 12. AI Assistant
router.post('/ai/generate', authenticate, aiCtrl.generateDraft);

// 13. Analytics & Stats
router.get('/analytics/dashboard', authenticate, analyticsCtrl.getDashboardStats);

// 14. File Upload endpoint
router.post('/upload', authenticate, upload.single('file') as any, (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded.' });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    data: {
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    }
  });
});

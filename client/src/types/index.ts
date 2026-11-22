export interface User {
  _id: string;
  fullName: string;
  email: string;
  employeeId: string;
  role: 'HOD' | 'COORDINATOR' | 'FACULTY';
  department: string;
  designation: string;
  phone?: string;
  avatarUrl?: string;
  accountStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  notificationPreferences?: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    classReminders: boolean;
    reminderOffsetMinutes: number;
  };
}

export interface TaskAssignee {
  _id?: string;
  facultyId: {
    _id: string;
    fullName: string;
    email: string;
    employeeId: string;
    designation: string;
  };
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'REVISION_REQUESTED';
  progressPercentage?: number;
  submissionNotes?: string;
  submissionFiles: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    version: number;
  }[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewerRemarks?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  taskType?: 'DEAN_TO_COORDINATOR' | 'COORDINATOR_TO_FACULTY';
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdBy: {
    _id: string;
    fullName: string;
    role: string;
    designation: string;
    email?: string;
  };
  assignees: TaskAssignee[];
  progressPercentage?: number;
  startDate: string;
  dueDate: string;
  dueTime: string;
  reviewRequired: boolean;
  instructions?: string;
  expectedDeliverables?: string;
  requiredDocumentsDescription?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
  overallStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt?: string;
}

export interface PersonalTask {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isCompleted: boolean;
  checklist: { text: string; done: boolean }[];
  notes?: string;
}

export interface ClassSchedule {
  _id: string;
  subject: string;
  subjectCode?: string;
  classSection: string;
  classroom: string;
  startTime: string;
  endTime: string;
  recurrenceDays: number[];
  reminderOffsetMinutes: number;
  notes?: string;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetAudience: 'ALL' | 'FACULTY' | 'COORDINATORS';
  createdBy: {
    _id: string;
    fullName: string;
    role: string;
    designation: string;
  };
  createdAt: string;
}

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  agenda?: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  organizerId: {
    _id: string;
    fullName: string;
    role: string;
  };
  participants: {
    userId: {
      _id: string;
      fullName: string;
      email: string;
      role: string;
      designation: string;
    };
    status: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'ATTENDED';
  }[];
  googleMeetLink?: string;
  minutesOfMeeting?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface FeedbackRequest {
  _id: string;
  facultyId: {
    _id: string;
    fullName: string;
    email: string;
    employeeId: string;
    designation: string;
  };
  title: string;
  category: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reviewerRole: 'HOD' | 'COORDINATOR';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'FORWARDED_TO_HOD' | 'RESOLVED';
  reviewRemarks?: string;
  createdAt: string;
  taskId?: {
    _id: string;
    title: string;
    dueDate: string;
  };
  requestedDueDate?: string;
}

import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskAssignee {
  facultyId: mongoose.Types.ObjectId; // Can be Coordinator or Faculty
  role?: 'COORDINATOR' | 'FACULTY';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'REVISION_REQUESTED';
  progressPercentage?: number; // 0 to 100
  submissionNotes?: string;
  submissionFiles: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    version: number;
  }[];
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewerRemarks?: string;
  isOverdue?: boolean;
}

export interface ITaskComment {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: string;
  text: string;
  createdAt: Date;
}

export interface ITask extends Document {
  title: string;
  description: string;
  taskType: 'DEAN_TO_COORDINATOR' | 'COORDINATOR_TO_FACULTY';
  category: string;
  department: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdBy: mongoose.Types.ObjectId;
  creatorRole: 'DEAN' | 'HOD' | 'COORDINATOR';
  assignees: ITaskAssignee[];
  progressPercentage: number; // Overall progress
  startDate: Date;
  dueDate: Date;
  dueTime?: string;
  reviewRequired: boolean;
  instructions?: string;
  expectedDeliverables?: string;
  requiredDocumentsDescription?: string;
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
  comments: ITaskComment[];
  overallStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED';
  isArchived: boolean;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskAssigneeSchema = new Schema<ITaskAssignee>(
  {
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['COORDINATOR', 'FACULTY'], default: 'FACULTY' },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'COMPLETED', 'REVISION_REQUESTED'],
      default: 'NOT_STARTED'
    },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    submissionNotes: { type: String },
    submissionFiles: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number, default: 0 },
        mimeType: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        version: { type: Number, default: 1 }
      }
    ],
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewerRemarks: { type: String },
    isOverdue: { type: Boolean, default: false }
  },
  { _id: true }
);

const TaskCommentSchema = new Schema<ITaskComment>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    taskType: {
      type: String,
      enum: ['DEAN_TO_COORDINATOR', 'COORDINATOR_TO_FACULTY'],
      default: 'COORDINATOR_TO_FACULTY',
      index: true
    },
    category: { type: String, default: 'Academic', index: true },
    department: { type: String, default: 'Computer Science and Engineering', index: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creatorRole: { type: String, enum: ['DEAN', 'HOD', 'COORDINATOR'], default: 'COORDINATOR' },
    assignees: [TaskAssigneeSchema],
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true, index: true },
    dueTime: { type: String, default: '17:00' },
    reviewRequired: { type: Boolean, default: true },
    instructions: { type: String },
    expectedDeliverables: { type: String },
    requiredDocumentsDescription: { type: String },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number, default: 0 }
      }
    ],
    comments: [TaskCommentSchema],
    overallStatus: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'COMPLETED', 'CANCELLED'],
      default: 'NOT_STARTED',
      index: true
    },
    isArchived: { type: Boolean, default: false, index: true },
    commentsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

TaskSchema.index({ 'assignees.facultyId': 1 });
TaskSchema.index({ taskType: 1, createdBy: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);

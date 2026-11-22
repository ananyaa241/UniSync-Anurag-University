import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedbackRequest extends Document {
  facultyId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reviewerRole: 'HOD' | 'COORDINATOR';
  assignedReviewerId?: mongoose.Types.ObjectId;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'FORWARDED_TO_HOD' | 'RESOLVED';
  reviewRemarks?: string;
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
  // If this is a deadline extension request:
  taskId?: mongoose.Types.ObjectId;
  requestedDueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackRequestSchema = new Schema<IFeedbackRequest>(
  {
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'General Feedback', index: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    reviewerRole: { type: String, enum: ['HOD', 'COORDINATOR'], default: 'COORDINATOR' },
    assignedReviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'FORWARDED_TO_HOD', 'RESOLVED'],
      default: 'SUBMITTED',
      index: true
    },
    reviewRemarks: { type: String },
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        fileSize: { type: Number }
      }
    ],
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    requestedDueDate: { type: Date }
  },
  { timestamps: true }
);

export const FeedbackRequest = mongoose.model<IFeedbackRequest>('FeedbackRequest', FeedbackRequestSchema);

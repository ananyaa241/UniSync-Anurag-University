import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type:
    | 'TASK_ASSIGNED'
    | 'TASK_DEADLINE_APPROACHING'
    | 'TASK_SUBMITTED'
    | 'TASK_APPROVED'
    | 'TASK_REVISION'
    | 'CLASS_REMINDER'
    | 'NEW_MESSAGE'
    | 'ANNOUNCEMENT'
    | 'MEETING_INVITE'
    | 'REQUEST_UPDATE'
    | 'EXTENSION_DECISION';
  referenceId?: mongoose.Types.ObjectId;
  referenceModel?: string; // e.g. 'Task', 'Meeting', 'Announcement'
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true, index: true },
    referenceId: { type: Schema.Types.ObjectId },
    referenceModel: { type: String },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date }
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

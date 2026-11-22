import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetAudience: 'ALL' | 'FACULTY' | 'COORDINATORS';
  createdBy: mongoose.Types.ObjectId;
  startDate: Date;
  expiryDate?: Date;
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
  acknowledgedBy: {
    userId: mongoose.Types.ObjectId;
    acknowledgedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM', index: true },
    targetAudience: { type: String, enum: ['ALL', 'FACULTY', 'COORDINATORS'], default: 'ALL' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number, default: 0 }
      }
    ],
    acknowledgedBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        acknowledgedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

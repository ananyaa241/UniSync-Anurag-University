import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  description?: string;
  agenda?: string;
  date: Date;
  startTime: string; // "14:30"
  durationMinutes: number; // 60
  organizerId: mongoose.Types.ObjectId;
  participants: {
    userId: mongoose.Types.ObjectId;
    status: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'ATTENDED';
  }[];
  googleMeetLink?: string;
  minutesOfMeeting?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeMeeting>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    agenda: { type: String },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    durationMinutes: { type: Number, default: 60 },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['INVITED', 'ACCEPTED', 'DECLINED', 'ATTENDED'], default: 'INVITED' }
      }
    ],
    googleMeetLink: { type: String },
    minutesOfMeeting: { type: String },
    status: { type: String, enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' }
  },
  { timestamps: true }
);

export const Meeting = mongoose.model<IMeMeeting>('Meeting', MeetingSchema);
type IMeMeeting = IMeeting;

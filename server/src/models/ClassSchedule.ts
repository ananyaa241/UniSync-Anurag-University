import mongoose, { Schema, Document } from 'mongoose';

export interface IClassSchedule extends Document {
  facultyId: mongoose.Types.ObjectId;
  subject: string;
  subjectCode?: string;
  classSection: string; // e.g. "CSE - II Year - Section A"
  classroom: string; // e.g. "Room C-204"
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // "10:00"
  endTime: string; // "10:50"
  recurrenceDays: number[]; // [1, 3, 5] = Mon, Wed, Fri
  reminderOffsetMinutes: number; // 0, 5, 10, 15, 30 (default 10)
  isCancelled: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassScheduleSchema = new Schema<IClassSchedule>(
  {
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, trim: true },
    subjectCode: { type: String, trim: true },
    classSection: { type: String, required: true, trim: true },
    classroom: { type: String, required: true, trim: true },
    dayOfWeek: { type: Number, default: 1 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    recurrenceDays: [{ type: Number }],
    reminderOffsetMinutes: { type: Number, default: 10 },
    isCancelled: { type: Boolean, default: false },
    notes: { type: String }
  },
  { timestamps: true }
);

export const ClassSchedule = mongoose.model<IClassSchedule>('ClassSchedule', ClassScheduleSchema);

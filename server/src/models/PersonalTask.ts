import mongoose, { Schema, Document } from 'mongoose';

export interface IPersonalTask extends Document {
  facultyId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isCompleted: boolean;
  checklist: { text: string; done: boolean }[];
  reminderTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalTaskSchema = new Schema<IPersonalTask>(
  {
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    dueDate: { type: Date },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    isCompleted: { type: Boolean, default: false, index: true },
    checklist: [
      {
        text: { type: String, required: true },
        done: { type: Boolean, default: false }
      }
    ],
    reminderTime: { type: Date },
    notes: { type: String }
  },
  { timestamps: true }
);

export const PersonalTask = mongoose.model<IPersonalTask>('PersonalTask', PersonalTaskSchema);

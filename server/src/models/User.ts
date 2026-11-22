import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  employeeId: string;
  role: 'HOD' | 'COORDINATOR' | 'FACULTY';
  department: string;
  designation: string;
  phone?: string;
  passwordHash: string;
  accountStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  isEmailVerified: boolean;
  avatarUrl?: string;
  lastLoginAt?: Date;
  notificationPreferences: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    classReminders: boolean;
    reminderOffsetMinutes: number; // e.g. 10
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    employeeId: { type: String, required: true, unique: true, trim: true, index: true },
    role: { type: String, enum: ['HOD', 'COORDINATOR', 'FACULTY'], default: 'FACULTY', required: true, index: true },
    department: { type: String, default: 'Computer Science and Engineering', required: true },
    designation: { type: String, default: 'Assistant Professor', trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    accountStatus: { type: String, enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'], default: 'PENDING', index: true },
    isEmailVerified: { type: Boolean, default: true },
    avatarUrl: { type: String },
    lastLoginAt: { type: Date },
    notificationPreferences: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      classReminders: { type: Boolean, default: true },
      reminderOffsetMinutes: { type: Number, default: 10 }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

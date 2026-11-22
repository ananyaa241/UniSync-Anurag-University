import mongoose, { Schema, Document } from 'mongoose';

export interface IDeviceSession extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  refreshTokenHash: string;
  ipAddress?: string;
  isActive: boolean;
  lastActiveAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

const DeviceSessionSchema = new Schema<IDeviceSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String, required: true },
    deviceName: { type: String, default: 'Web Browser' },
    deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' },
    browser: { type: String, default: 'Chrome' },
    os: { type: String, default: 'Windows' },
    refreshTokenHash: { type: String, required: true },
    ipAddress: { type: String },
    isActive: { type: Boolean, default: true },
    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

DeviceSessionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export const DeviceSession = mongoose.model<IDeviceSession>('DeviceSession', DeviceSessionSchema);

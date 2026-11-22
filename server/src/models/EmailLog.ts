import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailLog extends Document {
  senderId: mongoose.Types.ObjectId;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
  status: 'SENT' | 'FAILED' | 'DRAFT';
  providerMessageId?: string;
  errorMessage?: string;
  createdAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    to: [{ type: String, required: true }],
    cc: [{ type: String }],
    bcc: [{ type: String }],
    subject: { type: String, required: true },
    body: { type: String, required: true },
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        fileSize: { type: Number }
      }
    ],
    status: { type: String, enum: ['SENT', 'FAILED', 'DRAFT'], default: 'SENT' },
    providerMessageId: { type: String },
    errorMessage: { type: String }
  },
  { timestamps: true }
);

export const EmailLog = mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);

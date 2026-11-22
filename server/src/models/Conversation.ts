import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  type: 'DIRECT' | 'GROUP' | 'TASK_DISCUSSION';
  name?: string;
  description?: string;
  participants: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  taskId?: mongoose.Types.ObjectId;
  lastMessage?: {
    text: string;
    senderId: mongoose.Types.ObjectId;
    sentAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    type: { type: String, enum: ['DIRECT', 'GROUP', 'TASK_DISCUSSION'], default: 'DIRECT', index: true },
    name: { type: String },
    description: { type: String },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    lastMessage: {
      text: { type: String },
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date }
    }
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

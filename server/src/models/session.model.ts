import { Schema, model, Document, Types } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  valid: boolean;
  userAgent: string;
  ip: string;
  token?: string; // Hashed refresh token
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    valid: {
      type: Boolean,
      default: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Align with refresh token expiry (7d) + 1 hour grace period
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: (60 * 60 * 24 * 7) + 3600 }); 


const Session = model<ISession>('Session', sessionSchema);

export default Session;

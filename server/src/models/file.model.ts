import mongoose, { Document, Schema } from "mongoose";

export interface IFile extends Document {
  originalName: string;
  s3Key: string;
  size: number;
  uuid: string;
  uploader: mongoose.Types.ObjectId;
  mimeType: string;
  password?: string;
  expiresAt?: Date;
  isPasswordProtected: boolean;
  downloadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema: Schema = new Schema(
  {
    originalName: { type: String, required: true },
    s3Key: { type: String, required: true },
    size: { type: Number, required: true },
    uuid: { type: String, required: true },
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mimeType: { type: String, required: true },
    password: { type: String, select: false }, // optional password
    isPasswordProtected: { type: Boolean, default: false },
    expiresAt: { type: Date, index: { expires: 0 } }, // TTL index for auto-delete
    downloadCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// INT-5: Compound index for efficient user file listing with cursor pagination
FileSchema.index({ uploader: 1, isActive: 1, createdAt: -1 });
// Unique index to enforce data integrity at the DB level
FileSchema.index({ uuid: 1 }, { unique: true });

const File = mongoose.model<IFile>("File", FileSchema);
export default File;

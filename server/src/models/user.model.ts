import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  profilePic?: string;
  role: string;
  storageBytes: number;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    select: false,
  },
  profilePic: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  storageBytes: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;

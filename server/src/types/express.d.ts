import { IUser } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
      sessionId?: string;
    }
  }
}

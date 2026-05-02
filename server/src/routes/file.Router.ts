import { Router } from "express";
import rateLimit from "express-rate-limit";
import { 
  getUploadUrl, 
  downloadFileUrl, 
  getFile, 
  getStatsS3, 
  getAllFiles, 
  deleteFile 
} from "../controller/s3.controller";
import { isAuthenticated } from "../middleware/auth.Middleware";
import { validate } from "../middleware/validate.Middleware";
import { uploadUrlSchema, downloadFileSchema } from "../schemas/file.schema";

const downloadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many download attempts, please try again later." },
});

const router = Router();

// Specific Protected routes
router.post("/upload-url", isAuthenticated, validate(uploadUrlSchema), getUploadUrl);
router.get("/stats", isAuthenticated, getStatsS3);
router.get("/", isAuthenticated, getAllFiles);

// Public dynamic routes
router.post("/:id/download", downloadLimiter, validate(downloadFileSchema), downloadFileUrl);
router.get("/:id", getFile);

// Protected dynamic routes
router.delete("/:id", isAuthenticated, deleteFile);

export default router;

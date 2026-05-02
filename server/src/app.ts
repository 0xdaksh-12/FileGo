import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";

import { errorHandler } from "./utils/errorHandler";
import { logger } from "./utils/logger";

import authRouter from "./routes/auth.Router";
import fileRouter from "./routes/file.Router";

import requestHandler from "./middleware/requestHandler";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.amazonaws.com"],
      },
    },
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use("/api/auth", authLimiter);

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Request Handler
app.use(requestHandler);

// Swagger API Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  logger.warn(
    "Swagger documentation not found or failed to load. Skipping /api-docs.",
  );
}

app.use("/api/auth", authRouter);
app.use("/api/files", fileRouter);

app.use(errorHandler);

export default app;

import winston from "winston";

const { combine, timestamp, json, printf, colorize } = winston.format;
import { env } from "../config/env";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";

const transports: winston.transport[] = [
  new winston.transports.File({ filename: "error.log", level: "error" }),
  new winston.transports.File({ filename: "combined.log" }),
];

// Better Stack (Logtail) integration for production logging
if (env.BETTER_STACK_SOURCE_TOKEN) {
  const logtail = new Logtail(env.BETTER_STACK_SOURCE_TOKEN);
  transports.push(new LogtailTransport(logtail));
}

// Telemetry/Uptime API integration can be added by creating a custom Winston transport
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  transports,
});

if (env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        printf(({ level, message, timestamp, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
    }),
  );
}

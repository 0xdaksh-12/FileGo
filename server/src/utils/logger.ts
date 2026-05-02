import winston from "winston";

const { combine, timestamp, json, printf, colorize } = winston.format;
import { env } from "../config/env";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";

const transports: winston.transport[] = [];

if (env.NODE_ENV === "production") {
  // CLOUD MODE: JSON Console + Better Stack
  transports.push(
    new winston.transports.Console({
      format: combine(timestamp(), json()),
    })
  );

  if (env.BETTER_STACK_SOURCE_TOKEN) {
    const logtail = new Logtail(env.BETTER_STACK_SOURCE_TOKEN);
    transports.push(new LogtailTransport(logtail));
  }
} else {
  // LOCAL MODE: Pretty Console + Local Files
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ""
          }`;
        })
      ),
    }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" })
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports,
});


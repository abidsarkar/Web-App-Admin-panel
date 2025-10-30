import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// Separate logger for security/login events
export const securityLogger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    // Security-specific log file
    new DailyRotateFile({
      filename: path.join("logs", "security-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "info",
    }),
    // Error logs for security (separate from main errors)
    new DailyRotateFile({
      filename: path.join("logs", "security-error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
    }),
  ],
});

// Add console logging for development
if (process.env.NODE_ENV !== "production") {
  securityLogger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

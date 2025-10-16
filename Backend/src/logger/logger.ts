import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { Request, Response, NextFunction } from "express";
import {
  blue,
  green,
  yellow,
  yellowBright,
  red,
  magenta,
  magentaBright,
} from "colorette";
import { NODE_ENV } from "../config/envConfig";

// Winston logger configuration
export const logger = createLogger({
  level: NODE_ENV === "production" ? "warn" : "info",
  format: format.combine(
    format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    // Error logs
    new DailyRotateFile({
      filename: path.join("logs", "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
    }),
    // Combined logs
    new DailyRotateFile({
      filename: path.join("logs", "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join("logs", "exceptions.log") }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join("logs", "rejections.log") }),
  ],
});

// Add console logging (only in development)
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

// 🧾 Middleware to log all HTTP requests
export const logHttpRequests = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    // IP detection (trust proxy if behind reverse proxy like Nginx)
    const clientIp = req.ip?.startsWith("::ffff:")
      ? req.ip.substring(7)
      : req.ip || "Unknown IP";

    // Color and emoji formatting for methods and status codes
    const colorizeByStatusCode = (statusCode: number) => {
      if (statusCode >= 200 && statusCode < 300)
        return green(`${statusCode} ✅`);
      if (statusCode >= 400 && statusCode < 500) return red(`${statusCode} ⚠️`);
      if (statusCode >= 500) return yellow(`${statusCode} 🔥`);
      return blue(`${statusCode} ❗`);
    };

    const colorizeByMethod = (method: string) => {
      switch (method) {
        case "GET":
          return green(method + " 🔍");
        case "POST":
          return blue(method + " ✏️");
        case "PATCH":
          return yellow(method + " ✨");
        case "PUT":
          return yellowBright(method + " 🛠️");
        case "DELETE":
          return red(method + " ❌");
        default:
          return magentaBright(method + " ❓");
      }
    };

    // Build log message
    const logMessage = `🖥️ IP: ${clientIp} |🌐 Incoming Request:${colorizeByMethod(
      req.method
    )} ${colorizeByStatusCode(res.statusCode)} ${magenta(
      req.originalUrl
    )} |⏱️ Response Time: ${yellowBright(duration)} ms`;
    //const responseTime = `|⏱️ Response Time: ${yellowBright(duration)} ms`;
    const sizeOfContent = `${res.get("Content-Length") || 0} bytes`;
    const timeStamp = `📅 ${new Date().toLocaleDateString("en-Us", {
      weekday: "long",
    })} ${new Date().toISOString()}`;
    // Write to Winston
    logger.info({
      message: logMessage,
      Size: sizeOfContent,
      timestamp: timeStamp,
    });
  });

  next();
};

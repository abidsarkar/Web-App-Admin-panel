import path from "path";
// Import the 'express' module
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import router from "./routes";
import { logger, logHttpRequests } from "./logger/logger";
import helmet from "helmet";
import { template } from "./rootTemplate";
import { globalRateLimiter } from "./middlewares/rateLimiter";
import mongoSanitizer, { SanitizedRequest } from 'mongo-sanitizer';
import { FRONTEND_URL } from "./config/envConfig";

// Create an Express application
const app: Application = express();
//for global no sql injection prevent
app.use(mongoSanitizer());
//!for global trust ip find
//! need to study more latter
// app.set("trust proxy", true);
// for global rate limiting to stop brutForce
app.use(globalRateLimiter);
app.use(logHttpRequests);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: FRONTEND_URL as string,
    credentials: true,
  })
);


// ✅ Serve static files from root-level "public" folder
app.use("/public", express.static(path.join(__dirname, "../public")));
//application router
app.use(router);

// Define a route for the root path ('/')
app.get("/", (req: Request, res: Response) => {
  logger.info("Root endpoint hit 🌐 :");
  res.status(200).send(template);
});

// ============================================
// ❌ Handle 404 - Unknown API routes
// ============================================
app.use(notFound);

// ============================================
// 🧱 Global Error Handler
// ============================================
app.use(globalErrorHandler);
// ============================================
// 🪵 Log Errors (Optional: can move to globalErrorHandler)
// ============================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error occurred: ${err.message}`, { stack: err.stack });
  next(err);
});

export default app;

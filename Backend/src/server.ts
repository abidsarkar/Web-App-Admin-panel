import { createServer, Server as HttpServer } from "http";
import mongoose from "mongoose";
import app from "./app"; // Your Express app
import { PORT, DATABASE_URL } from "./config/envConfig";
import seedSuperAdmin from "./DB/index";

let server: HttpServer;

async function connectDB() {
  const dbStartTime = Date.now();
  const loadingFrames = ["🌍", "🌎", "🌏"];
  let frameIndex = 0;

  // Loader animation
  const loader = setInterval(() => {
    process.stdout.write(
      `\rMongoDB connecting ${loadingFrames[frameIndex]} Please wait 😢`
    );
    frameIndex = (frameIndex + 1) % loadingFrames.length;
  }, 300);

  try {
    await mongoose.connect(DATABASE_URL as string, {
      connectTimeoutMS: 10000, // 10s timeout
    });
    clearInterval(loader);
    console.log(
      `\r✅ MongoDB connected successfully in ${Date.now() - dbStartTime}ms`
    );
  } catch (err: any) {
    clearInterval(loader);
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

async function startServer() {
  await connectDB();
  //! 🦸 Seed Super Admin

  //await seedSuperAdmin();
  // Start HTTP server
  server = createServer(app);
  const serverStartTime = Date.now();

  server.listen(PORT, () => {
    console.log(
      `🚀 Server is running on port ${PORT} and took ${
        Date.now() - serverStartTime
      }ms to start`
    );
  });
}

// Run the main function
startServer().catch((error) => {
  console.error("☠️ Unhandled error in main:", error);
  process.exit(1);
});

// =============================
// 🔒 Global Error Handlers
// =============================

// Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.error("☠️ Unhandled promise rejection detected:", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Uncaught Exceptions
process.on("uncaughtException", (error) => {
  console.error("☠️ Uncaught exception detected:", error);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Graceful Shutdown (for Docker, PM2, etc.)
process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

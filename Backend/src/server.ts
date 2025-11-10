//src/server.ts
import { createServer, Server as HttpServer } from "http";
import mongoose from "mongoose";
import app from "./app"; // Your Express app
import { PORT, DATABASE_URL } from "./config/envConfig";
import seedSuperAdmin from "./DB/index";
import { scheduleCustomerCleanupJob } from "./cornJobs/customerCleanup.corn";
import { redisConnection } from "./config/redisConfig"; // Add this import

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

async function connectRedis() {
  const redisStartTime = Date.now();
  const loadingFrames = ["🔴", "🟡", "🟢"];
  let frameIndex = 0;

  // Loader animation for Redis
  const loader = setInterval(() => {
    process.stdout.write(
      `\rRedis connecting ${loadingFrames[frameIndex]} Please wait 😢`
    );
    frameIndex = (frameIndex + 1) % loadingFrames.length;
  }, 300);

  try {
    await redisConnection.connect();
    clearInterval(loader);
    console.log(
      `\r✅ Redis connected successfully in ${Date.now() - redisStartTime}ms`
    );
  } catch (err: any) {
    clearInterval(loader);
    console.error("❌ Redis connection failed:", err.message);
    // Don't exit process for Redis failure - app can work without cache
    console.log("⚠️  Continuing without Redis cache...");
  }
}

function initializeCronJobs() {
  try {
    scheduleCustomerCleanupJob();
    console.log("✅ Customer cleanup cron job initialized");
  } catch (error) {
    console.error("❌ Failed to initialize cron jobs:", error);
  }
}

async function startServer() {
  // Connect to databases
  await connectDB();
  await connectRedis(); // Add Redis connection
  
  //! 🦸 Seed Super Admin
  //await seedSuperAdmin();
  
  // Initialize cron jobs after DB connections
  initializeCronJobs();
  
  // Start HTTP server
  server = createServer(app);
  const serverStartTime = Date.now();

  server.listen(PORT, () => {
    console.log(
      `🚀 Server is running on port ${PORT} and took ${
        Date.now() - serverStartTime
      }ms to start`
    );
    console.log(`⏰ Customer cleanup cron job is scheduled`);
    console.log(`📊 Redis status: ${redisConnection.isReady() ? '✅ Connected' : '❌ Disconnected'}`);
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
process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  if (server) {
    server.close(async () => {
      await redisConnection.disconnect(); // Disconnect Redis gracefully
      process.exit(0);
    });
  } else {
    await redisConnection.disconnect(); // Disconnect Redis gracefully
    process.exit(0);
  }
});

process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  if (server) {
    server.close(async () => {
      await redisConnection.disconnect(); // Disconnect Redis gracefully
      process.exit(0);
    });
  } else {
    await redisConnection.disconnect(); // Disconnect Redis gracefully
    process.exit(0);
  }
});
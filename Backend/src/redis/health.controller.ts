// src/modules/health/health.controller.ts - Minimal version
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';
import mongoose from 'mongoose';
import { redisConnection } from '../config/redisConfig';

export const healthCheckController = catchAsync(async (req: Request, res: Response) => {
  // Check MongoDB
  const mongoHealthy = mongoose.connection.readyState === 1;
  
  // Check Redis
  const redisHealthy = redisConnection.isReady();
  
  const overallHealthy = mongoHealthy && redisHealthy;
  
  sendResponse(res, {
    statusCode: overallHealthy ? 200 : 503,
    success: overallHealthy,
    message: overallHealthy ? 'Service is healthy' : 'Service is unhealthy',
    data: {
      status: overallHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      mongo: mongoHealthy ? 'connected' : 'disconnected',
      redis: redisHealthy ? 'connected' : 'disconnected',
    },
  });
});

export const redisHealthCheckController = catchAsync(async (req: Request, res: Response) => {
  const isHealthy = redisConnection.isReady();
  
  sendResponse(res, {
    statusCode: isHealthy ? 200 : 503,
    success: isHealthy,
    message: isHealthy ? 'Redis is connected' : 'Redis is disconnected',
    data: {
      status: isHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    },
  });
});

export const mongoHealthCheckController = catchAsync(async (req: Request, res: Response) => {
  const isHealthy = mongoose.connection.readyState === 1;
  
  sendResponse(res, {
    statusCode: isHealthy ? 200 : 503,
    success: isHealthy,
    message: isHealthy ? 'MongoDB is connected' : 'MongoDB is disconnected',
    data: {
      status: isHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    },
  });
});
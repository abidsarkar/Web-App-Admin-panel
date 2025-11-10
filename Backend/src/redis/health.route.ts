// src/modules/health/health.route.ts
import { Router } from 'express';
import { 
  healthCheckController, 
  redisHealthCheckController, 
  mongoHealthCheckController 
} from './health.controller';

const router = Router();

/**
 * @route GET /health
 * @description Comprehensive health check for all services
 * @access Public
 */
router.get('/', healthCheckController);

/**
 * @route GET /health/redis
 * @description Redis-specific health check
 * @access Public
 */
router.get('/redis', redisHealthCheckController);

/**
 * @route GET /health/mongo
 * @description MongoDB-specific health check
 * @access Public
 */
router.get('/mongo', mongoHealthCheckController);

export const healthRoutes = router;
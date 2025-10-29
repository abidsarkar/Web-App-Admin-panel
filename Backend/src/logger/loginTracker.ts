import { Request, Response, NextFunction } from "express";
import dayjs from "dayjs";
import { logger } from "./logger";

// Enhanced login tracking
export const loginMetrics = {
  totalLogins: 0,
  successfulLogins: 0,
  failedLogins: 0,
  dailyLogins: new Map<string, { 
    success: number; 
    failed: number; 
    total: number;
    uniqueIPs: Set<string>;
  }>(),
  loginAttemptsByIP: new Map<string, number>(),
  lastFailedAttempts: new Map<string, Date>(),
};

export const loginTracker = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.path === '/login' && req.method === 'POST') {
    const today = dayjs().format("YYYY-MM-DD");
    const clientIp = req.ip || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Track IP attempts
    loginMetrics.loginAttemptsByIP.set(
      clientIp, 
      (loginMetrics.loginAttemptsByIP.get(clientIp) || 0) + 1
    );

    const originalSend = res.send;
    
    res.send = function(body: any) {
      // Initialize today's data
      if (!loginMetrics.dailyLogins.has(today)) {
        loginMetrics.dailyLogins.set(today, { 
          success: 0, 
          failed: 0, 
          total: 0,
          uniqueIPs: new Set() 
        });
      }
      
      const todayData = loginMetrics.dailyLogins.get(today)!;
      todayData.total++;
      todayData.uniqueIPs.add(clientIp);
      
      loginMetrics.totalLogins++;

      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      
      if (isSuccess) {
        loginMetrics.successfulLogins++;
        todayData.success++;
        
        logger.info(`✅ Successful login - IP: ${clientIp}, User-Agent: ${userAgent.substring(0, 50)}`);
      } else {
        loginMetrics.failedLogins++;
        todayData.failed++;
        loginMetrics.lastFailedAttempts.set(clientIp, new Date());
        
        logger.warn(`❌ Failed login - IP: ${clientIp}, Status: ${res.statusCode}, User-Agent: ${userAgent.substring(0, 50)}`);
      }
      
      return originalSend.call(this, body);
    };
  }

  next();
};
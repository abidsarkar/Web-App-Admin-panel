import { Request, Response, NextFunction } from "express";
import dayjs from "dayjs";
import { securityLogger } from "./securityLogger"; // Import the separate logger

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
    const email = req.body?.email || 'unknown'; // Log attempted email

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
        
        // Log to security file only
        securityLogger.info('Successful login', {
          ip: clientIp,
          email: email,
          userAgent: userAgent,
          timestamp: new Date().toISOString(),
          type: 'LOGIN_SUCCESS'
        });
        
      } else {
        loginMetrics.failedLogins++;
        todayData.failed++;
        loginMetrics.lastFailedAttempts.set(clientIp, new Date());
        
        // Log to security file only
        securityLogger.warn('Failed login attempt', {
          ip: clientIp,
          email: email,
          userAgent: userAgent,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString(),
          type: 'LOGIN_FAILED'
        });
      }
      
      return originalSend.call(this, body);
    };
  }

  next();
};
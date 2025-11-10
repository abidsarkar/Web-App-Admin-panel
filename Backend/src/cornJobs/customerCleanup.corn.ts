// src/cronJobs/customerCleanup.cron.ts
import cron from "node-cron";
import { customerInfoModel } from "../modules/customerAuth/customerAuth.model";
import { logger } from "../logger/logger";


/**
 * Permanently delete customer accounts that were marked for deletion 
 * more than {RETENTION_MONTHS} months ago
 */
export const scheduleCustomerCleanupJob = () => {
  let retentionMonths = parseInt(process.env.CUSTOMER_RETENTION_MONTHS || '1');
  let cronTime = process.env.CUSTOMER_CLEANUP_CRON_TIME || '0 1 * * *'; // Default: 1:00 AM daily
  
  if (!cron.validate(cronTime)) {
    logger.error(`Invalid cron time: ${cronTime}. Using default: 0 1 * * *`);
    cronTime = '0 1 * * *';
  }

  logger.info(`Scheduling customer cleanup job to run at: ${cronTime} (retention: ${retentionMonths} months)`);

  cron.schedule(cronTime, async () => {
    try {
      await performCustomerCleanup(retentionMonths);
    } catch (error) {
      logger.error('Customer cleanup job failed:', error);
    }
  });
};

/**
 * Perform the actual cleanup of old deleted customer accounts
 */
export const performCustomerCleanup = async (retentionMonths: number = 1) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);

    logger.info(`Starting customer cleanup for accounts deleted before: ${cutoffDate.toISOString()}`);

    // Find and delete customers that are marked as deleted and deletedAt is older than retention period
    const result = await customerInfoModel.deleteMany({
      isDeleted: true,
      deletedAt: { $lt: cutoffDate }
    });

    logger.info(`Customer cleanup completed: ${result.deletedCount} accounts permanently deleted`);

    return {
      success: true,
      deletedCount: result.deletedCount,
      cutoffDate: cutoffDate.toISOString(),
      message: `Successfully deleted ${result.deletedCount} customer accounts that were marked for deletion before ${cutoffDate.toISOString()}`
    };

  } catch (error) {
    logger.error('Error during customer cleanup:', error);
    throw error;
  }
};
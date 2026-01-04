import Bull from 'bull';
import { logInfo, logError } from './logger';

// Create queues
export const emailQueue = new Bull('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export const smsQueue = new Bull('sms', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export const imageProcessingQueue = new Bull('image-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export const notificationQueue = new Bull('notification', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Email queue processor
emailQueue.process(async (job) => {
  const { to, subject, html, template, data } = job.data;

  try {
    // Send email using your email service
    logInfo('Processing email job', { to, subject });

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));

    logInfo('Email sent successfully', { to });

    return { success: true };
  } catch (error: any) {
    logError('Email job failed', error);
    throw error;
  }
});

// SMS queue processor
smsQueue.process(async (job) => {
  const { phone, message, template, data } = job.data;

  try {
    logInfo('Processing SMS job', { phone });

    // Send SMS using your SMS service
    await new Promise(resolve => setTimeout(resolve, 500));

    logInfo('SMS sent successfully', { phone });

    return { success: true };
  } catch (error: any) {
    logError('SMS job failed', error);
    throw error;
  }
});

// Image processing queue processor
imageProcessingQueue.process(async (job) => {
  const { imageUrl, operations } = job.data;

  try {
    logInfo('Processing image', { imageUrl, operations });

    // Process image (resize, compress, etc.)
    await new Promise(resolve => setTimeout(resolve, 2000));

    logInfo('Image processed successfully', { imageUrl });

    return { success: true, processedUrl: imageUrl };
  } catch (error: any) {
    logError('Image processing job failed', error);
    throw error;
  }
});

// Notification queue processor
notificationQueue.process(async (job) => {
  const { userId, type, title, message, data } = job.data;

  try {
    logInfo('Processing notification', { userId, type });

    // Send notification via WebSocket, push notification, etc.
    await new Promise(resolve => setTimeout(resolve, 500));

    logInfo('Notification sent successfully', { userId });

    return { success: true };
  } catch (error: any) {
    logError('Notification job failed', error);
    throw error;
  }
});

// Queue event handlers
const setupQueueEvents = (queue: Bull.Queue, name: string) => {
  queue.on('completed', (job, result) => {
    logInfo(`${name} job completed`, { jobId: job.id, result });
  });

  queue.on('failed', (job, err) => {
    logError(`${name} job failed`, { jobId: job?.id, error: err });
  });

  queue.on('stalled', (job) => {
    logError(`${name} job stalled`, { jobId: job.id });
  });
};

setupQueueEvents(emailQueue, 'Email');
setupQueueEvents(smsQueue, 'SMS');
setupQueueEvents(imageProcessingQueue, 'Image Processing');
setupQueueEvents(notificationQueue, 'Notification');

// Helper functions to add jobs
export const addEmailJob = async (
  to: string,
  subject: string,
  html: string,
  options?: Bull.JobOptions
) => {
  return emailQueue.add(
    { to, subject, html },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      ...options,
    }
  );
};

export const addSMSJob = async (
  phone: string,
  message: string,
  options?: Bull.JobOptions
) => {
  return smsQueue.add(
    { phone, message },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      ...options,
    }
  );
};

export const addImageProcessingJob = async (
  imageUrl: string,
  operations: any[],
  options?: Bull.JobOptions
) => {
  return imageProcessingQueue.add(
    { imageUrl, operations },
    {
      attempts: 2,
      timeout: 30000,
      ...options,
    }
  );
};

export const addNotificationJob = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: any,
  options?: Bull.JobOptions
) => {
  return notificationQueue.add(
    { userId, type, title, message, data },
    {
      attempts: 3,
      ...options,
    }
  );
};

// Get queue stats
export const getQueueStats = async (queue: Bull.Queue) => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
};

// Clean old jobs
export const cleanOldJobs = async () => {
  const queues = [emailQueue, smsQueue, imageProcessingQueue, notificationQueue];

  for (const queue of queues) {
    await queue.clean(24 * 60 * 60 * 1000, 'completed'); // 24 hours
    await queue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // 7 days
  }

  logInfo('Old jobs cleaned');
};

// Schedule cleanup
setInterval(cleanOldJobs, 24 * 60 * 60 * 1000); // Run daily

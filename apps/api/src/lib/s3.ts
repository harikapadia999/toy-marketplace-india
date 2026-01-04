import AWS from 'aws-sdk';
import { logInfo, logError } from './logger';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'toy-marketplace-india';

// Upload file to S3
export const uploadToS3 = async (
  file: Buffer,
  key: string,
  contentType: string,
  metadata?: Record<string, string>
) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
      ACL: 'public-read',
    };

    const result = await s3.upload(params).promise();

    logInfo('File uploaded to S3', { key, location: result.Location });

    return {
      success: true,
      data: {
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket,
      },
    };
  } catch (error: any) {
    logError('Upload to S3 error', error);
    return { success: false, error: error.message };
  }
};

// Delete file from S3
export const deleteFromS3 = async (key: string) => {
  try {
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: key,
    }).promise();

    logInfo('File deleted from S3', { key });

    return { success: true };
  } catch (error: any) {
    logError('Delete from S3 error', error);
    return { success: false, error: error.message };
  }
};

// Get signed URL for private files
export const getS3SignedUrl = async (
  key: string,
  expiresIn: number = 3600
) => {
  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
    });

    return { success: true, url };
  } catch (error: any) {
    logError('Get S3 signed URL error', error);
    return { success: false, error: error.message };
  }
};

// List files in S3
export const listS3Files = async (prefix?: string, maxKeys: number = 1000) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
    };

    const result = await s3.listObjectsV2(params).promise();

    return {
      success: true,
      data: {
        files: result.Contents || [],
        count: result.KeyCount,
      },
    };
  } catch (error: any) {
    logError('List S3 files error', error);
    return { success: false, error: error.message };
  }
};

// Copy file within S3
export const copyS3File = async (sourceKey: string, destinationKey: string) => {
  try {
    await s3.copyObject({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    }).promise();

    logInfo('File copied in S3', { sourceKey, destinationKey });

    return { success: true };
  } catch (error: any) {
    logError('Copy S3 file error', error);
    return { success: false, error: error.message };
  }
};

// Get file metadata
export const getS3FileMetadata = async (key: string) => {
  try {
    const result = await s3.headObject({
      Bucket: BUCKET_NAME,
      Key: key,
    }).promise();

    return {
      success: true,
      data: {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        metadata: result.Metadata,
      },
    };
  } catch (error: any) {
    logError('Get S3 file metadata error', error);
    return { success: false, error: error.message };
  }
};

// Multipart upload for large files
export const uploadLargeFileToS3 = async (
  file: Buffer,
  key: string,
  contentType: string
) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    };

    const upload = s3.upload(params);

    // Track progress
    upload.on('httpUploadProgress', (progress) => {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      logInfo('Upload progress', { key, percentage });
    });

    const result = await upload.promise();

    logInfo('Large file uploaded to S3', { key, location: result.Location });

    return {
      success: true,
      data: {
        url: result.Location,
        key: result.Key,
      },
    };
  } catch (error: any) {
    logError('Upload large file to S3 error', error);
    return { success: false, error: error.message };
  }
};

import { v2 as cloudinary } from 'cloudinary';
import { logInfo, logError } from './logger';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image
export async function uploadImage(
  file: string | Buffer,
  options?: {
    folder?: string;
    public_id?: string;
    transformation?: any;
  }
) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options?.folder || 'toys',
      public_id: options?.public_id,
      transformation: options?.transformation || [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    logInfo('Image uploaded', {
      public_id: result.public_id,
      url: result.secure_url,
      size: result.bytes,
    });

    return {
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      },
    };
  } catch (error: any) {
    logError('Upload image error', error);
    return { success: false, error: error.message };
  }
}

// Upload multiple images
export async function uploadMultipleImages(
  files: (string | Buffer)[],
  options?: {
    folder?: string;
    transformation?: any;
  }
) {
  try {
    const uploadPromises = files.map((file) =>
      uploadImage(file, options)
    );

    const results = await Promise.allSettled(uploadPromises);

    const successful = results
      .filter((r) => r.status === 'fulfilled' && r.value.success)
      .map((r: any) => r.value.data);

    const failed = results.filter(
      (r) => r.status === 'rejected' || !r.value.success
    ).length;

    logInfo('Multiple images uploaded', {
      total: files.length,
      successful: successful.length,
      failed,
    });

    return {
      success: true,
      data: successful,
      failed,
    };
  } catch (error: any) {
    logError('Upload multiple images error', error);
    return { success: false, error: error.message };
  }
}

// Delete image
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    logInfo('Image deleted', { public_id: publicId, result });

    return { success: true, data: result };
  } catch (error: any) {
    logError('Delete image error', error, { publicId });
    return { success: false, error: error.message };
  }
}

// Delete multiple images
export async function deleteMultipleImages(publicIds: string[]) {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);

    logInfo('Multiple images deleted', {
      count: publicIds.length,
      deleted: result.deleted,
    });

    return { success: true, data: result };
  } catch (error: any) {
    logError('Delete multiple images error', error);
    return { success: false, error: error.message };
  }
}

// Get image details
export async function getImageDetails(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId);

    return { success: true, data: result };
  } catch (error: any) {
    logError('Get image details error', error, { publicId });
    return { success: false, error: error.message };
  }
}

// Generate transformation URL
export function generateImageUrl(
  publicId: string,
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
) {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: transformation?.width,
        height: transformation?.height,
        crop: transformation?.crop || 'fill',
        quality: transformation?.quality || 'auto',
        fetch_format: transformation?.format || 'auto',
      },
    ],
    secure: true,
  });
}

// Generate thumbnail
export function generateThumbnail(publicId: string, size: number = 200) {
  return cloudinary.url(publicId, {
    transformation: [
      { width: size, height: size, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
    secure: true,
  });
}

// Generate responsive images
export function generateResponsiveImages(publicId: string) {
  const sizes = [320, 640, 768, 1024, 1280, 1920];

  return sizes.map((size) => ({
    size,
    url: cloudinary.url(publicId, {
      transformation: [
        { width: size, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
      secure: true,
    }),
  }));
}

// Search images
export async function searchImages(expression: string, maxResults: number = 30) {
  try {
    const result = await cloudinary.search
      .expression(expression)
      .max_results(maxResults)
      .execute();

    return { success: true, data: result };
  } catch (error: any) {
    logError('Search images error', error, { expression });
    return { success: false, error: error.message };
  }
}

// Get folder contents
export async function getFolderContents(folder: string) {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 500,
    });

    return { success: true, data: result };
  } catch (error: any) {
    logError('Get folder contents error', error, { folder });
    return { success: false, error: error.message };
  }
}

// Create folder
export async function createFolder(path: string) {
  try {
    const result = await cloudinary.api.create_folder(path);

    logInfo('Folder created', { path });

    return { success: true, data: result };
  } catch (error: any) {
    logError('Create folder error', error, { path });
    return { success: false, error: error.message };
  }
}

// Delete folder
export async function deleteFolder(path: string) {
  try {
    const result = await cloudinary.api.delete_folder(path);

    logInfo('Folder deleted', { path });

    return { success: true, data: result };
  } catch (error: any) {
    logError('Delete folder error', error, { path });
    return { success: false, error: error.message };
  }
}

export default cloudinary;

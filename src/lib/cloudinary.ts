import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export { cloudinary };

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = "kryso/uploads",
  publicId?: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "auto",
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload image to Cloudinary"));
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export async function checkCloudinaryConnection(): Promise<{
  configured: boolean;
  cloudName?: string;
  status?: string;
  error?: string;
}> {
  if (!cloudName || !apiKey || !apiSecret) {
    return {
      configured: false,
      error: "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing.",
    };
  }

  try {
    const res = await cloudinary.api.ping();
    return {
      configured: true,
      cloudName,
      status: res.status,
    };
  } catch (err) {
    return {
      configured: false,
      cloudName,
      error: (err as Error).message,
    };
  }
}

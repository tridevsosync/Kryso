import { NextResponse } from "next/server";
import { checkMongoConnection } from "@/lib/mongodb";
import { checkCloudinaryConnection } from "@/lib/cloudinary";
import { checkRedisConnection } from "@/lib/redis";

export async function GET() {
  const [mongoStatus, cloudinaryStatus, redisStatus] = await Promise.all([
    checkMongoConnection(),
    checkCloudinaryConnection(),
    checkRedisConnection(),
  ]);

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      mongodb: {
        ...mongoStatus,
        configured: Boolean(process.env.MONGODB_URI),
      },
      redis: {
        ...redisStatus,
        configured: Boolean(process.env.REDIS_URL),
      },
      cloudinary: {
        ...cloudinaryStatus,
        configured: Boolean(
          process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET
        ),
      },
    },
  });
}

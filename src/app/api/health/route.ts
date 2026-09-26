import { NextResponse } from "next/server";
import { checkMongoConnection } from "@/lib/mongodb";
import { checkCloudinaryConnection } from "@/lib/cloudinary";

export async function GET() {
  const [mongoStatus, cloudinaryStatus] = await Promise.all([
    checkMongoConnection(),
    checkCloudinaryConnection(),
  ]);

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      mongodb: {
        ...mongoStatus,
        configured: Boolean(process.env.MONGODB_URI),
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

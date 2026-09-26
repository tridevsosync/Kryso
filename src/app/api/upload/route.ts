import { NextRequest, NextResponse } from "next/server";
import { uploadBufferToCloudinary, checkCloudinaryConnection } from "@/lib/cloudinary";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "kryso/spotlight";

    if (!file) {
      return NextResponse.json(
        { error: "No file was provided for upload." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check if Cloudinary is configured
    const cloudCheck = await checkCloudinaryConnection();
    if (cloudCheck.configured) {
      try {
        const publicId = `upload_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
        const result = await uploadBufferToCloudinary(buffer, folder, publicId);

        return NextResponse.json({
          success: true,
          provider: "cloudinary",
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to local file system:", cloudErr);
      }
    }

    // Fallback: save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeName);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      provider: "local",
      url: `/uploads/${safeName}`,
      note: cloudCheck.configured
        ? "Saved locally as fallback."
        : "Saved locally because Cloudinary credentials are not configured.",
    });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal upload error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inputIdentifier = (body.identifier || body.username || body.email || "").toString().trim().toLowerCase();
    const inputPassword = (body.password || "").toString().trim();

    const expectedEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();
    const expectedPassword = (process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "").trim();

    if (!expectedEmail || !expectedPassword) {
      return NextResponse.json(
        { error: "Admin credentials are not configured in .env file." },
        { status: 500 }
      );
    }

    const isIdentifierValid =
      inputIdentifier === expectedEmail ||
      inputIdentifier === "admin" ||
      (expectedEmail.includes("@") && inputIdentifier === expectedEmail.split("@")[0]);

    const isPasswordValid = inputPassword === expectedPassword;

    if (isIdentifierValid && isPasswordValid) {
      const response = NextResponse.json({
        success: true,
        user: expectedEmail,
        timestamp: Date.now(),
      });

      // Set cookie for session persistence
      response.cookies.set("kryso_admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      {
        error: "Invalid email/username or password.",
      },
      { status: 401 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}

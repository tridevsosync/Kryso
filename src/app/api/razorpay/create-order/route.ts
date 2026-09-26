import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = "INR",
      receipt,
      notes = {},
      studentName,
      courseName,
    } = body;

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    // Razorpay amount in paise (e.g., 2000 INR -> 200000 paise)
    const amountInPaise = Math.round(numAmount * 100);
    const orderReceipt = (receipt || `rcpt_${Date.now()}`).slice(0, 40);

    if (keyId && keySecret) {
      try {
        const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
        const response = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: currency.toUpperCase(),
            receipt: orderReceipt,
            notes: {
              studentName: studentName || "",
              courseName: courseName || "",
              ...notes,
            },
          }),
        });

        const data = await response.json();

        if (response.ok && data.id) {
          return NextResponse.json({
            success: true,
            orderId: data.id,
            amount: data.amount,
            currency: data.currency,
            keyId: keyId,
          });
        } else {
          console.warn("Razorpay API order creation responded with non-200:", data);
          return NextResponse.json({
            success: false,
            fallback: true,
            keyId: keyId,
            amount: amountInPaise,
            currency: currency,
            orderId: null,
            error: data?.error?.description || "Unable to create Razorpay Order ID",
          });
        }
      } catch (apiErr) {
        console.error("Razorpay order API error:", apiErr);
        return NextResponse.json({
          success: false,
          fallback: true,
          keyId: keyId,
          amount: amountInPaise,
          currency: currency,
          orderId: null,
          error: (apiErr as Error).message,
        });
      }
    }

    // Fallback if keys not configured
    return NextResponse.json({
      success: false,
      fallback: true,
      keyId: keyId || "rzp_test_T7ub9uRXOT69Du",
      amount: amountInPaise,
      currency: currency,
      orderId: null,
      error: "Razorpay keys not fully configured",
    });
  } catch (err) {
    console.error("Razorpay route error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

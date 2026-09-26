import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentName,
      age,
      dob,
      email,
      mobile,
      address,
      courseName,
      teacherName,
      duration,
      fees,
      paymentId,
      invoiceNumber,
      paidAt,
    } = body;

    if (!studentName || !email || !mobile) {
      return NextResponse.json(
        { error: "Missing required student details (Name, Email, Mobile)" },
        { status: 400 }
      );
    }

    const generatedInv = invoiceNumber || `KRYSO-INV-${Date.now().toString().slice(-6)}`;
    const effectivePaidAt = paidAt || new Date().toISOString();
    const effectivePaymentId = paymentId || `pay_${Date.now()}`;

    const enrollmentRecord = {
      id: `ENR-${Date.now()}`,
      invoiceNumber: generatedInv,
      studentName,
      age: Number(age) || null,
      dob: dob || "",
      email,
      mobile,
      address: address || "",
      courseName: courseName || "Academy Course",
      teacherName: teacherName || "Kryso Music Faculty",
      duration: duration || "1 Month",
      fees: Number(fees) || 0,
      paymentId: effectivePaymentId,
      paymentMethod: "Razorpay Online",
      paymentStatus: "PAID",
      createdAt: effectivePaidAt,
    };

    // 1. Save to MongoDB collections 'academy_students', 'academy_enrollments', and 'enquiries'
    try {
      const db = await getDb();
      if (db) {
        const studentRecord = {
          id: enrollmentRecord.id,
          name: studentName,
          email: email,
          mobile: mobile,
          phone: mobile,
          age: Number(age) || "",
          dob: dob || "",
          address: address || "",
          course: courseName || "Academy Course",
          teacher: teacherName || "Kryso",
          fees: Number(fees) || 0,
          level: "Enrolled Student",
          paymentStatus: "PAID via Razorpay",
          invoiceNumber: generatedInv,
          paymentId: effectivePaymentId,
          joined: new Date(effectivePaidAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          createdAt: effectivePaidAt,
          _syncedAt: new Date(),
        };

        // Insert / upsert in academy_students collection so it appears in Students admin section
        await db.collection("academy_students").updateOne(
          { id: studentRecord.id },
          { $set: studentRecord },
          { upsert: true }
        );

        // Record in academy_enrollments collection
        await db.collection("academy_enrollments").insertOne({
          ...enrollmentRecord,
          _syncedAt: new Date(),
        });

        // Mirror into enquiries for admin dashboard notification
        await db.collection("enquiries").insertOne({
          id: enrollmentRecord.id,
          name: studentName,
          email,
          phone: mobile,
          course: `${courseName} (PAID - ₹${fees})`,
          message: `[ONLINE ADMISSION & ENROLLMENT - PAID via Razorpay]\nInvoice: ${enrollmentRecord.invoiceNumber}\nPayment ID: ${enrollmentRecord.paymentId}\nAge: ${age || "N/A"} | DOB: ${dob || "N/A"}\nAddress: ${address || "N/A"}\nTeacher: ${teacherName || "Kryso"}\nDuration: ${duration || "1 Month"}`,
          type: "course",
          read: false,
          status: "paid_enrollment",
          createdAt: enrollmentRecord.createdAt,
          _syncedAt: new Date(),
        });
      }
    } catch (mongoErr) {
      console.warn("MongoDB connection warning in enrollment route:", mongoErr);
    }

    // 2. Send Admission Confirmation & Tax Invoice Email via Nodemailer
    let emailSent = false;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
    const emailPort = Number(process.env.EMAIL_PORT) || 587;
    const emailFrom = process.env.EMAIL_FROM || `"Kryso Music Academy" <${emailUser}>`;

    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: emailHost,
          port: emailPort,
          secure: process.env.EMAIL_SECURE === "true" || emailPort === 465,
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        const formattedDate = new Date(effectivePaidAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        const invoiceHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0e12; color: #f3f4f6; margin: 0; padding: 24px; }
              .container { max-width: 600px; margin: 0 auto; background-color: #16181f; border-radius: 16px; border: 1px solid #282b37; overflow: hidden; }
              .header { background: linear-gradient(135deg, #ea580c, #f97316); padding: 32px 24px; text-align: center; color: #ffffff; }
              .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
              .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
              .content { padding: 28px 24px; }
              .badge { display: inline-block; background-color: #22c55e22; color: #4ade80; border: 1px solid #22c55e66; border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: bold; margin-bottom: 20px; }
              .info-grid { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; }
              .info-grid td { padding: 10px 12px; border-bottom: 1px solid #242834; font-size: 14px; }
              .info-grid td.label { color: #9ca3af; width: 40%; font-weight: 500; }
              .info-grid td.value { color: #ffffff; font-weight: 600; }
              .total-box { background-color: #1f222d; border-radius: 12px; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; border: 1px solid #2e3342; }
              .footer { text-align: center; padding: 20px 24px; font-size: 12px; color: #6b7280; border-top: 1px solid #242834; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>KRYSO MUSIC ACADEMY</h1>
                <p>Official Admission & Tax Invoice Receipt</p>
              </div>
              <div class="content">
                <div style="text-align: center;">
                  <span class="badge">✓ ADMISSION CONFIRMED & PAYMENT SUCCESSFUL</span>
                </div>
                <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
                  Dear <strong>${studentName}</strong>,<br>
                  Congratulations! Your enrollment at <strong>Kryso Music Academy</strong> has been officially confirmed. We are thrilled to welcome you to your musical journey.
                </p>

                <table class="info-grid">
                  <tr>
                    <td class="label">Invoice Number</td>
                    <td class="value" style="color: #fb923c;">${generatedInv}</td>
                  </tr>
                  <tr>
                    <td class="label">Transaction ID</td>
                    <td class="value">${effectivePaymentId}</td>
                  </tr>
                  <tr>
                    <td class="label">Date</td>
                    <td class="value">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td class="label">Course Enrolled</td>
                    <td class="value">${courseName}</td>
                  </tr>
                  <tr>
                    <td class="label">Assigned Teacher</td>
                    <td class="value">${teacherName}</td>
                  </tr>
                  <tr>
                    <td class="label">Course Duration</td>
                    <td class="value">${duration}</td>
                  </tr>
                  <tr>
                    <td class="label">Student Age / DOB</td>
                    <td class="value">${age ? `${age} yrs` : "N/A"} ${dob ? `(${dob})` : ""}</td>
                  </tr>
                  <tr>
                    <td class="label">Contact Mobile</td>
                    <td class="value">${mobile}</td>
                  </tr>
                  <tr>
                    <td class="label">Address</td>
                    <td class="value">${address || "Pune, India"}</td>
                  </tr>
                  <tr>
                    <td class="label">Amount Paid</td>
                    <td class="value" style="color: #4ade80; font-size: 18px;">₹${fees}</td>
                  </tr>
                </table>

                <p style="font-size: 13px; color: #9ca3af; line-height: 1.5;">
                  Our academy administration will reach out via WhatsApp/Call at <strong>${mobile}</strong> with your class schedule, batch timing, and studio orientation details.
                </p>
              </div>
              <div class="footer">
                <p>Kryso Music Academy · Pune, Maharashtra · Phone: +91 87678 28945</p>
                <p>© ${new Date().getFullYear()} Kryso Music. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: emailFrom,
          to: email,
          cc: emailUser, // notify admin as well
          subject: `Admission Confirmed & Invoice ${generatedInv} - Kryso Music Academy`,
          html: invoiceHtml,
        });

        emailSent = true;
      } catch (mailErr) {
        console.warn("SMTP email dispatch warning:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Enrollment recorded successfully and invoice generated.",
      invoiceNumber: enrollmentRecord.invoiceNumber,
      emailSent,
      enrollment: enrollmentRecord,
    });
  } catch (err) {
    console.error("Enrollment invoice error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

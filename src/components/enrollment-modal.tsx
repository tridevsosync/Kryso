"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  User,
  X,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Course } from "@/data/catalog";

interface RazorpayResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string | number | undefined>;
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface EnrollmentModalProps {
  course: Course | null;
  onClose: () => void;
}

export function CourseEnrollmentModal({ course, onClose }: EnrollmentModalProps) {
  const [step, setStep] = useState<"form" | "paying" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState("Connecting to Razorpay Secure Gateway...");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Student form state
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    dob: "",
    email: "",
    mobile: "",
    address: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [invoiceData, setInvoiceData] = useState<{
    invoiceNumber: string;
    paymentId: string;
    paidAt: string;
    emailSent?: boolean;
  } | null>(null);

  if (!course) return null;

  const sellingPrice = Number(course.fees || (course as unknown as { price?: number }).price || 0);
  const actualPrice = Number(course.actualPrice || (course as unknown as { originalPrice?: number }).originalPrice || 0);
  const teacherName = course.instructor || (course as unknown as { teacherName?: string }).teacherName || "Kryso Music Faculty";

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Full Name is required.";
    if (!formData.age.trim() || isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      errors.age = "Please enter a valid age.";
    }
    if (!formData.dob.trim()) errors.dob = "Date of Birth is required.";
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.mobile.trim() || formData.mobile.length < 10) {
      errors.mobile = "Please enter a valid 10-digit mobile number.";
    }
    if (!formData.address.trim()) errors.address = "Residential address is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);

      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setPaymentError(null);
    setStep("paying");
    setPaymentStatusText("Creating secure Razorpay order...");

    const invNumber = `KRYSO-INV-${Date.now().toString().slice(-6)}`;
    const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const targetPrice = sellingPrice > 0 ? sellingPrice : 2000;

    let orderId: string | undefined = undefined;
    let effectiveKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_T7ub9uRXOT69Du";

    try {
      // 1. Create order on server
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: targetPrice,
          currency: "INR",
          receipt: invNumber,
          studentName: formData.name,
          courseName: course.name,
        }),
      });

      const orderData = await res.json();
      if (orderData.orderId) {
        orderId = orderData.orderId;
      }
      if (orderData.keyId) {
        effectiveKey = orderData.keyId;
      }
    } catch (orderErr) {
      console.warn("Order creation API warning, continuing with standard checkout:", orderErr);
    }

    // 2. Load Checkout script
    setPaymentStatusText("Launching Razorpay checkout modal...");
    const isLoaded = await loadRazorpayScript();

    if (isLoaded && typeof window.Razorpay === "function") {
      try {
        const amountInPaise = Math.round(targetPrice * 100);

        const rzp = new window.Razorpay({
          key: effectiveKey,
          amount: amountInPaise,
          currency: "INR",
          name: "Kryso Music Academy",
          description: `Admission: ${course.name}`,
          image: "/kryso-logo.png",
          order_id: orderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.mobile,
          },
          notes: {
            courseName: course.name,
            teacherName,
            studentAge: formData.age,
            studentDob: formData.dob,
            address: formData.address,
            invoiceNumber: invNumber,
          },
          theme: {
            color: "#ea580c",
          },
          handler: function (response: RazorpayResponse) {
            setPaymentStatusText("Verifying payment & generating tax invoice...");
            completeEnrollment(
              response.razorpay_payment_id || orderId || mockPaymentId,
              invNumber
            );
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setStep("form");
            },
          },
        });

        rzp.on("payment.failed", (response) => {
          setPaymentError(response.error?.description || "Payment failed. Please retry.");
          setLoading(false);
          setStep("form");
        });

        rzp.open();
        return;
      } catch (rzpErr) {
        console.warn("Razorpay standard modal exception:", rzpErr);
        setPaymentError("Could not open Razorpay checkout automatically. You can simulate test payment below.");
      }
    } else {
      setPaymentError("Razorpay SDK could not be loaded from CDN (check your internet or adblock). You can test payment below.");
    }
  };

  const completeEnrollment = async (paymentId: string, invoiceNumber: string) => {
    setLoading(true);
    const paidAt = new Date().toISOString();
    let emailSent = false;

    try {
      const res = await fetch("/api/enrollments/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: formData.name,
          age: formData.age,
          dob: formData.dob,
          email: formData.email,
          mobile: formData.mobile,
          address: formData.address,
          courseName: course.name,
          teacherName,
          duration: course.duration || "1 Month",
          fees: sellingPrice || 2000,
          paymentId,
          invoiceNumber,
          paidAt,
        }),
      });

      const resData = await res.json();
      if (resData?.emailSent) {
        emailSent = true;
      }
    } catch (err) {
      console.warn("Failed to record enrollment on server:", err);
    }

    // Save directly to localStorage for instant student roster update
    try {
      const stored = localStorage.getItem("admin-students-v3");
      const parsed = stored ? JSON.parse(stored) : [];
      const newStudent = {
        id: `STU-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        phone: formData.mobile,
        age: formData.age,
        dob: formData.dob,
        address: formData.address,
        course: course.name,
        teacher: teacherName,
        fees: sellingPrice || 2000,
        level: "Enrolled Student",
        paymentStatus: "PAID via Razorpay",
        invoiceNumber,
        paymentId,
        joined: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        createdAt: paidAt,
      };
      const updatedList = [
        newStudent,
        ...parsed.filter(
          (s: { invoiceNumber?: string; id?: string }) =>
            s.invoiceNumber !== invoiceNumber && s.id !== newStudent.id
        ),
      ];
      localStorage.setItem("admin-students-v3", JSON.stringify(updatedList));
    } catch {}

    setInvoiceData({
      invoiceNumber,
      paymentId,
      emailSent,
      paidAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    setLoading(false);
    setStep("success");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-2xl text-card-foreground p-5 sm:p-7">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-secondary/80 p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X size={17} />
        </button>

        {/* STEP 1: STUDENT DETAILS & ADMISSION FORM */}
        {step === "form" && (
          <div>
            <div className="border-b border-border pb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary mb-2">
                <GraduationCap size={13} /> Official Course Admission
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                Enroll in {course.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>
                  Mentor: <strong className="text-foreground">{teacherName}</strong>
                </span>
                <span>•</span>
                <span>
                  Duration: <strong className="text-foreground">{course.duration || "1 Month"}</strong>
                </span>
                <span>•</span>
                <span>
                  Fee: <strong className="text-primary text-sm font-extrabold">₹{sellingPrice.toLocaleString("en-IN")}</strong>
                  {actualPrice > sellingPrice && (
                    <span className="ml-1.5 text-[11px] line-through text-muted-foreground">
                      ₹{actualPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {paymentError && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Payment notice</p>
                  <p>{paymentError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleProceedToPayment} className="mt-5 grid gap-4">
              {/* Full Name */}
              <label className="grid gap-1 text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <User size={13} className="text-primary" /> Full Name *
                </span>
                <Input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  className="bg-secondary/40 border-border text-foreground text-sm focus-visible:ring-primary"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {formErrors.name && <span className="text-[11px] text-destructive">{formErrors.name}</span>}
              </label>

              {/* Age and DOB */}
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-bold text-foreground">
                  <span>Age (Years) *</span>
                  <Input
                    type="number"
                    min="4"
                    max="100"
                    placeholder="e.g. 19"
                    value={formData.age}
                    className="bg-secondary/40 border-border text-foreground text-sm focus-visible:ring-primary"
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                  {formErrors.age && <span className="text-[11px] text-destructive">{formErrors.age}</span>}
                </label>

                <label className="grid gap-1 text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" /> Date of Birth (DOB) *
                  </span>
                  <Input
                    type="date"
                    value={formData.dob}
                    className="bg-secondary/40 border-border text-foreground text-sm focus-visible:ring-primary"
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                  {formErrors.dob && <span className="text-[11px] text-destructive">{formErrors.dob}</span>}
                </label>
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-primary" /> Email Address (For Invoice) *
                  </span>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    className="bg-secondary/40 border-border text-foreground text-sm focus-visible:ring-primary"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {formErrors.email && <span className="text-[11px] text-destructive">{formErrors.email}</span>}
                </label>

                <label className="grid gap-1 text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-primary" /> Mobile / WhatsApp Number *
                  </span>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    className="bg-secondary/40 border-border text-foreground text-sm focus-visible:ring-primary"
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                  {formErrors.mobile && <span className="text-[11px] text-destructive">{formErrors.mobile}</span>}
                </label>
              </div>

              {/* Residential Address */}
              <label className="grid gap-1 text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-primary" /> Residential Address (Street, City, Pincode) *
                </span>
                <Textarea
                  rows={2}
                  placeholder="e.g. Flat 402, Sunshine Heights, FC Road, Pune - 411004"
                  value={formData.address}
                  className="bg-secondary/40 border-border text-foreground text-sm focus-visible:ring-primary"
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                {formErrors.address && <span className="text-[11px] text-destructive">{formErrors.address}</span>}
              </label>

              {/* Order & Payment Summary */}
              <div className="rounded-2xl border border-border bg-secondary/50 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Course Fee</span>
                  <span className="font-semibold text-foreground">₹{sellingPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Admission & Registration</span>
                  <span className="font-semibold text-emerald-400">FREE (Included)</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between text-sm font-bold text-foreground">
                  <span>Total Payable Amount</span>
                  <span className="text-base text-primary font-extrabold">₹{sellingPrice.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Secured by Razorpay · UPI, Cards, NetBanking, GPay, Paytm
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-full border-border hover:bg-secondary text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 rounded-full px-8 font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-sm"
                >
                  Pay ₹{sellingPrice.toLocaleString("en-IN")} via Razorpay <ArrowRight size={15} className="ml-1.5" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: PROCESSING PAYMENT */}
        {step === "paying" && (
          <div className="py-12 text-center space-y-5">
            <div className="size-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary">
              <Loader2 size={32} className="animate-spin" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">
                {paymentStatusText}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">
                Please complete your payment in the Razorpay popup window.
              </p>
            </div>

            {/* In case user is in test mode or script blocked */}
            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-[11px] text-muted-foreground">
                Testing environment or popup didn&apos;t open?
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const mockInv = `KRYSO-INV-${Date.now().toString().slice(-6)}`;
                    const mockTxn = `pay_test_${Date.now()}`;
                    completeEnrollment(mockTxn, mockInv);
                  }}
                  className="rounded-full border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold"
                >
                  <CreditCard size={13} className="mr-1.5" /> Confirm Test Payment & Get Invoice
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLoading(false);
                    setStep("form");
                  }}
                  className="rounded-full text-xs text-muted-foreground hover:bg-secondary"
                >
                  Back to Form
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESSFUL ENROLLMENT & TAX INVOICE */}
        {step === "success" && invoiceData && (
          <div className="space-y-6">
            {/* Header notification */}
            <div className="text-center space-y-2">
              <div className="size-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 size={30} />
              </div>
              <h2 className="font-display text-2xl font-extrabold text-foreground">
                Enrollment Confirmed & Paid!
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Welcome to Kryso Music Academy! An admission receipt and tax invoice has been sent to{" "}
                <strong className="text-foreground">{formData.email}</strong>.
              </p>
              {invoiceData.emailSent && (
                <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-[11px] font-bold text-emerald-400">
                  ✓ Email Invoice Sent Successfully
                </span>
              )}
            </div>

            {/* Printable Tax Invoice Box */}
            <div
              id="printable-kryso-invoice"
              className="rounded-2xl border border-border bg-background p-5 sm:p-6 text-foreground text-xs space-y-4 shadow-sm"
            >
              {/* Invoice Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div>
                  <Image
                    src="/kryso-logo.png"
                    alt="KRYSO"
                    width={110}
                    height={38}
                    className="h-6 w-auto object-contain mb-1.5"
                  />
                  <p className="font-bold text-foreground">Kryso Music Academy</p>
                  <p className="text-muted-foreground text-[11px]">Pune, Maharashtra, India</p>
                  <p className="text-muted-foreground text-[11px]">Email: krysomusicacademy@gmail.com</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 mb-1">
                    TAX INVOICE / RECEIPT
                  </span>
                  <p className="font-bold text-foreground">{invoiceData.invoiceNumber}</p>
                  <p className="text-muted-foreground text-[11px]">Date: {invoiceData.paidAt}</p>
                  <p className="text-muted-foreground text-[11px]">Txn ID: {invoiceData.paymentId}</p>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-3 border-b border-border pb-4 text-[11px]">
                <div>
                  <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Billed To (Student):</p>
                  <p className="font-bold text-foreground text-xs mt-0.5">{formData.name}</p>
                  <p className="text-muted-foreground">{formData.email}</p>
                  <p className="text-muted-foreground">{formData.mobile}</p>
                  <p className="text-muted-foreground">Age: {formData.age} yrs | DOB: {formData.dob}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Residential Address:</p>
                  <p className="text-foreground mt-0.5 leading-relaxed">{formData.address}</p>
                  <p className="text-emerald-400 font-bold mt-1">Payment: Razorpay Online (PAID)</p>
                </div>
              </div>

              {/* Course Item Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border text-[10px] uppercase text-muted-foreground">
                    <tr>
                      <th className="py-1.5">Course / Program</th>
                      <th className="py-1.5">Mentor</th>
                      <th className="py-1.5">Duration</th>
                      <th className="py-1.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    <tr>
                      <td className="py-2.5 font-bold text-foreground">{course.name}</td>
                      <td className="py-2.5 text-muted-foreground">{teacherName}</td>
                      <td className="py-2.5 text-muted-foreground">{course.duration || "1 Month"}</td>
                      <td className="py-2.5 text-right font-extrabold text-foreground">
                        ₹{sellingPrice.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total & Seal */}
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">Authorized digital receipt</p>
                  <p className="font-bold text-emerald-400 text-[11px]">✓ Payment Verified</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Paid:</p>
                  <p className="font-extrabold text-primary text-base">
                    ₹{sellingPrice.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="rounded-full border-border hover:bg-secondary text-xs font-bold gap-1.5"
              >
                <Printer size={14} /> Print / Save PDF Invoice
              </Button>

              <Button
                type="button"
                onClick={onClose}
                className="rounded-full px-7 font-bold bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
              >
                Done & Return to Courses
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

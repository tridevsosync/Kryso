import type { Metadata } from "next";
import { AdminLoginClient } from "./admin-login-client";

export const metadata: Metadata = {
  title: "Admin Login | Kryso Music Academy",
  description: "Demo admin login for the Kryso Music Academy website.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminLoginClient />;
}

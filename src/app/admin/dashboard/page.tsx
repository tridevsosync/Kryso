import type { Metadata } from "next";
import { AdminDashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Admin Dashboard | Kryso Music Academy",
  description: "Demo dashboard for managing Kryso Music Academy content.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}

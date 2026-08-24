// app/employer/dashboard/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Employer Dashboard | MND Jobs",
};

export default function EmployerDashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Dashboard...</div>}>
      <DashboardClient />
    </Suspense>
  );
}

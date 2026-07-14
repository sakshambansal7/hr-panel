import { Suspense } from "react";
import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Employer Dashboard | MND Jobs",
};

export default function EmployerDashboardPage() {
  return (
    <Suspense>
      <DashboardClient />
    </Suspense>
  );
}

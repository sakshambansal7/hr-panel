
// app/employer/dashboard/interviews/page.tsx


import { Suspense } from "react";
import type { Metadata } from "next";
import InterviewsClient from "./InterviewsClient";

export const metadata: Metadata = {
  title: "Upcoming Interviews | MND Jobs",
};

export default function InterviewsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Interviews...</div>}>
      <InterviewsClient />
    </Suspense>
  );
}

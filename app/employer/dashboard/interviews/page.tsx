import { Suspense } from "react";
import type { Metadata } from "next";
import InterviewsClient from "./InterviewsClient";

export const metadata: Metadata = {
  title: "Interviews | MND Jobs",
};

export default function InterviewsPage() {
  return (
    <Suspense>
      <InterviewsClient />
    </Suspense>
  );
}

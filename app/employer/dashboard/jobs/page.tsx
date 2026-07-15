import { Suspense } from "react";
import type { Metadata } from "next";
import JobsClient from "./JobsClient";

export const metadata: Metadata = {
  title: "Manage Jobs | MND Jobs",
};

export default function JobsPage() {
  return (
    <Suspense>
      <JobsClient />
    </Suspense>
  );
}

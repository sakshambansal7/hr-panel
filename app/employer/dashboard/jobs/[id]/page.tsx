import { Suspense } from "react";
import type { Metadata } from "next";
import ApplicationsClient from "./ApplicationsClient";

export const metadata: Metadata = {
  title: "Applications | MND Jobs",
};

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <ApplicationsClient jobId={id} />
    </Suspense>
  );
}

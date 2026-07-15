import { Suspense } from "react";
import type { Metadata } from "next";
import ApplicationsListPage from "../components/ApplicationsListPage";

export const metadata: Metadata = {
  title: "Applications | MND Jobs",
};

export default function AllApplicationsPage() {
  return (
    <Suspense>
      <ApplicationsListPage
        pageTitle="Applications"
        eyebrow="Hiring Pipeline"
        heading="All Applications"
        description="Every candidate who has applied across your posted jobs."
        emptyMessage="No applications yet."
      />
    </Suspense>
  );
}

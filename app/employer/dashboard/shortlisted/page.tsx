import { Suspense } from "react";
import type { Metadata } from "next";
import ApplicationsListPage from "../components/ApplicationsListPage";

export const metadata: Metadata = {
  title: "Shortlisted | MND Jobs",
};

export default function ShortlistedPage() {
  return (
    <Suspense>
      <ApplicationsListPage
        pageTitle="Shortlisted"
        eyebrow="Hiring Pipeline"
        heading="Shortlisted Candidates"
        description="Candidates you've shortlisted across all your jobs."
        emptyMessage="No shortlisted candidates yet."
        stageFilter="shortlisted"
      />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import TalentClient from "./TalentClient";

export const metadata: Metadata = {
  title: "Maritime Talent Database | MND Jobs",
};

export default function TalentPage() {
  return (
    <Suspense>
      <TalentClient />
    </Suspense>
  );
}

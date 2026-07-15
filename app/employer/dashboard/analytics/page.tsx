import { Suspense } from "react";
import type { Metadata } from "next";
import AnalyticsClient from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Analytics | MND Jobs",
};

export default function AnalyticsPage() {
  return (
    <Suspense>
      <AnalyticsClient />
    </Suspense>
  );
}

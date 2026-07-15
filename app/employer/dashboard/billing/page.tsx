import { Suspense } from "react";
import type { Metadata } from "next";
import BillingClient from "./BillingClient";

export const metadata: Metadata = {
  title: "Billing & Plans | MND Jobs",
};

export default function BillingPage() {
  return (
    <Suspense>
      <BillingClient />
    </Suspense>
  );
}

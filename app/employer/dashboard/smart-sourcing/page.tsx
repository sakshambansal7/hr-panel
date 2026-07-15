import { Suspense } from "react";
import type { Metadata } from "next";
import SmartSourcingClient from "./SmartSourcingClient";

export const metadata: Metadata = {
  title: "Smart Sourcing | MND Jobs",
};

export default function SmartSourcingPage() {
  return (
    <Suspense>
      <SmartSourcingClient />
    </Suspense>
  );
}

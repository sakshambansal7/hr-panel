import { Suspense } from "react";
import type { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings | MND Jobs",
};

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsClient />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import CompanyProfileClient from "./CompanyProfileClient";

export const metadata: Metadata = {
  title: "Company Profile | MND Jobs",
};

export default function CompanyProfilePage() {
  return (
    <Suspense>
      <CompanyProfileClient />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import ReviewsClient from "./ReviewsClient";

export const metadata: Metadata = {
  title: "Reviews | MND Jobs",
};

export default function ReviewsPage() {
  return (
    <Suspense>
      <ReviewsClient />
    </Suspense>
  );
}

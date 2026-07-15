import { Suspense } from "react";
import type { Metadata } from "next";
import PostJobClient from "./PostJobClient";

export const metadata: Metadata = {
  title: "Post New Job | MND Jobs",
};

export default function PostJobPage() {
  return (
    <Suspense>
      <PostJobClient />
    </Suspense>
  );
}

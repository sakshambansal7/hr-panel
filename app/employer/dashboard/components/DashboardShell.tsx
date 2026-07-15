"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../../../context/auth-context";
import { getCompanyProfile } from "../../../lib/company-profile-store";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileBottomNav from "./MobileBottomNav";

function readDesignation(email: string): string {
  try {
    const raw = localStorage.getItem(`employer_meta_${email.toLowerCase()}`);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { designation?: string };
    return parsed.designation || "";
  } catch {
    return "";
  }
}

type DashboardShellProps = {
  pageTitle: string;
  children: ReactNode;
};

export default function DashboardShell({ pageTitle, children }: DashboardShellProps) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "employer") {
      router.replace("/login?next=/employer/dashboard");
    }
  }, [ready, user, router]);

  const profile = useMemo(
    () => (user ? getCompanyProfile(user.email) : null),
    [user]
  );

  if (!ready || !user || user.role !== "employer") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <p className="text-sm text-slate-400">Loading your dashboard…</p>
      </div>
    );
  }

  const displayName = user.name;
  const companyName = profile?.companyName || "Your Company";
  const designation = readDesignation(user.email) || "Recruiter";
  const isVerified = Boolean(profile?.verified);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div
      className="min-h-screen w-full bg-white font-sans antialiased"
      style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        companyName={companyName}
        isVerified={isVerified}
        planActive
        displayName={displayName}
        designation={designation}
        onLogout={handleLogout}
      />

      <div className="lg:pl-[260px]">
        <Topbar
          pageTitle={pageTitle}
          displayName={displayName}
          credits={56}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:pb-8">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}

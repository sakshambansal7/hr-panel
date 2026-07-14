"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth-context";
import { LogoutIcon } from "../../components/icons";

type EmployerProfile = {
  companyName?: string;
  companyType?: string;
  rpslNumber?: string;
  designation?: string;
};

function readEmployerProfile(email: string): EmployerProfile | null {
  try {
    const raw = localStorage.getItem(`employer_meta_${email.toLowerCase()}`);
    return raw ? (JSON.parse(raw) as EmployerProfile) : null;
  } catch {
    return null;
  }
}

const STAT_CARDS = [
  { label: "Active Job Postings", value: "0" },
  { label: "Applications Received", value: "0" },
  { label: "Talent DB Unlocks", value: "0" },
  { label: "Profile Completion", value: "40%" },
];

function QuickActionCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#FBBF24]/50 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
          <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Coming soon
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-300">
        Continue
        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </span>
    </div>
  );
}

export default function DashboardClient() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "employer") {
      router.replace("/login?next=/employer/dashboard");
      return;
    }
    setProfile(readEmployerProfile(user.email));
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "employer") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-slate-400">Loading your dashboard…</p>
      </div>
    );
  }

  const displayName = profile?.companyName || user.name;
  const isVerified = Boolean(profile?.rpslNumber);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-sans antialiased">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-[#FBBF24] to-[#FCD34D] shadow-md shadow-[#FBBF24]/20">
              <svg className="h-4.5 w-4.5 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v14m0 0l-3-3m3 3l3-3M4 14a8 8 0 0016 0" />
              </svg>
            </div>
            <span className="font-semibold text-base tracking-tight text-[#0F172A]">MND Jobs Employer Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-slate-600 sm:block">{displayName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <LogoutIcon className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        {/* Welcome */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-[#13294B] uppercase block">
            Employer Dashboard
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-slate-500">
            Here&apos;s an overview of your hiring pipeline and account status.
          </p>
        </div>

        {/* Verification banner */}
        {!isVerified && (
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Your company isn&apos;t verified yet</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Submit your RPSL certificate &amp; company authorization letter to activate job
                postings. Jobs go live after verification.
              </p>
            </div>
            <button className="shrink-0 rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#13294B]">
              Submit Verification Documents
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="block text-2xl font-bold text-[#0F172A]">{s.value}</span>
              <span className="text-xs font-medium text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Plan */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-linear-to-br from-[#0F172A] to-[#13294B] p-6 text-white sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#FBBF24] uppercase">Yearly Plan</span>
            <p className="mt-1 text-lg font-bold">₹25,000 / year — Unlimited job postings</p>
            <p className="mt-1 text-sm text-slate-300">
              Applied CV access, full hiring pipeline, company profile listing &amp; basic
              analytics included.
            </p>
          </div>
          <Link
            href="#"
            className="shrink-0 rounded-xl bg-[#FBBF24] px-4 py-2.5 text-xs font-bold text-[#0F172A] transition-colors hover:bg-[#FCD34D]"
          >
            Manage Plan
          </Link>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              title="Post a New Job"
              description="Create a maritime job vacancy and reach verified seafarers."
            />
            <QuickActionCard
              title="View Applicants"
              description="Review CVs applied to your active job postings."
            />
            <QuickActionCard
              title="Maritime Talent Database"
              description="Unlock candidates with Smart Sourcing, pay-as-you-go."
            />
            <QuickActionCard
              title="Company Profile & Verification"
              description="Complete your profile and submit RPSL / DG Shipping details."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

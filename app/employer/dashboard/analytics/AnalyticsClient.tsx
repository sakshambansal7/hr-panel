"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Briefcase, FileText, Percent, PhoneCall, BookmarkCheck, UserCheck, ChartColumn } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { useAuth } from "../../../context/auth-context";
import { getEmployerJobs } from "../../../lib/jobs-store";
import { getApplicationsForJobs } from "../../../lib/applications-store";
import CountUp from "../components/CountUp";

export default function AnalyticsClient() {
  const { user } = useAuth();
  const jobs = useMemo(() => (user ? getEmployerJobs(user.email) : []), [user]);
  const applications = useMemo(
    () => getApplicationsForJobs(jobs.map((j) => j.id)),
    [jobs]
  );

  const totalJobs = jobs.length;
  const totalApplications = applications.length;
  const shortlisted = applications.filter((a) => a.stage === "shortlisted").length;
  const contacted = applications.filter((a) => a.stage === "contacted").length;
  const joined = applications.filter((a) => a.stage === "joined").length;
  const shortlistRate = totalApplications ? Math.round((shortlisted / totalApplications) * 100) : 0;
  const contactRate = totalApplications ? Math.round((contacted / totalApplications) * 100) : 0;

  const jobRankById = useMemo(() => new Map(jobs.map((j) => [j.id, j.rank])), [jobs]);

  const byRank = useMemo(() => {
    const counts = new Map<string, number>();
    for (const app of applications) {
      const rank = jobRankById.get(app.jobId) ?? "Other";
      counts.set(rank, (counts.get(rank) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [applications, jobRankById]);

  const maxRankCount = byRank.length ? byRank[0][1] : 1;

  const topStats = [
    { label: "Total Jobs", value: totalJobs, icon: Briefcase },
    { label: "Total Applications", value: totalApplications, icon: FileText },
    { label: "Shortlist Rate", value: `${shortlistRate}%`, icon: Percent },
    { label: "Contact Rate", value: `${contactRate}%`, icon: PhoneCall },
  ];

  const secondaryStats = [
    { label: "Shortlisted", value: shortlisted, icon: BookmarkCheck },
    { label: "Contacted", value: contacted, icon: PhoneCall },
    { label: "Joined", value: joined, icon: UserCheck },
  ];

  return (
    <DashboardShell pageTitle="Analytics">
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
          Analytics
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
          Hiring Analytics
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {topStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F1E35]/5 text-[#0F1E35]">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="mt-4 text-2xl font-extrabold tracking-tight text-[#0F1E35]">
                <CountUp value={s.value} />
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {secondaryStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E8B61]/10 text-[#0E8B61]">
                <Icon className="h-4.5 w-4.5" strokeWidth={2} />
              </div>
              <p className="mt-3 text-xl font-extrabold text-[#0F1E35]">
                <CountUp value={s.value} />
              </p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)]">
        <div className="flex items-center gap-2">
          <ChartColumn className="h-4 w-4 text-[#0F1E35]" strokeWidth={2} />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Applications by Rank
          </h2>
        </div>

        {byRank.length === 0 && (
          <p className="mt-4 text-sm text-slate-400">No applications yet.</p>
        )}

        <div className="mt-5 space-y-4">
          {byRank.map(([rank, count], i) => (
            <div key={rank}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0F1E35]">{rank}</span>
                <span className="font-bold text-[#0F1E35]">{count}</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxRankCount) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                  className="h-full rounded-full bg-[#F5B61A]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

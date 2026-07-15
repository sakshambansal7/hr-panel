"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import DashboardShell from "./DashboardShell";
import { useAuth } from "../../../context/auth-context";
import { getEmployerJobs } from "../../../lib/jobs-store";
import {
  getApplicationsForJobs,
  STAGE_LABELS,
  type ApplicationStage,
  type JobApplication,
} from "../../../lib/applications-store";

const STAGE_BADGE: Record<ApplicationStage, string> = {
  applied: "bg-slate-100 text-slate-500",
  viewed: "bg-blue-50 text-blue-600",
  shortlisted: "bg-[#F5B61A]/15 text-[#946200]",
  contacted: "bg-purple-50 text-purple-600",
  interview: "bg-indigo-50 text-indigo-600",
  selected: "bg-[#0E8B61]/10 text-[#0E8B61]",
  rejected: "bg-red-50 text-red-600",
  joined: "bg-[#0E8B61]/15 text-[#0E8B61]",
};

type EnrichedApplication = JobApplication & { jobTitle: string; jobRank: string };

type ApplicationsListPageProps = {
  pageTitle: string;
  eyebrow: string;
  heading: string;
  description: string;
  emptyMessage: string;
  stageFilter?: ApplicationStage;
};

export default function ApplicationsListPage({
  pageTitle,
  eyebrow,
  heading,
  description,
  emptyMessage,
  stageFilter,
}: ApplicationsListPageProps) {
  const { user } = useAuth();
  const [rows, setRows] = useState<EnrichedApplication[]>([]);

  useEffect(() => {
    if (!user) return;
    const jobs = getEmployerJobs(user.email);
    const jobMap = new Map(jobs.map((j) => [j.id, j]));
    const apps = getApplicationsForJobs(jobs.map((j) => j.id))
      .filter((a) => !stageFilter || a.stage === stageFilter)
      .map((a) => ({
        ...a,
        jobTitle: jobMap.get(a.jobId)?.title ?? "",
        jobRank: jobMap.get(a.jobId)?.rank ?? "",
      }))
      .sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1));
    setRows(apps);
  }, [user, stageFilter]);

  return (
    <DashboardShell pageTitle={pageTitle}>
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
          {eyebrow}
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
          {heading}
        </h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm text-slate-400">
            {emptyMessage}
          </div>
        )}

        {rows.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F1E35] text-sm font-bold text-white">
                {app.candidateName.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-bold text-[#0F1E35]">{app.candidateName}</p>
                <p className="text-xs text-slate-500">
                  {app.candidateRank} · Applied for: {app.jobRank}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STAGE_BADGE[app.stage]}`}
              >
                {STAGE_LABELS[app.stage]}
              </span>
              <Link
                href={`/employer/dashboard/jobs/${app.jobId}`}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-[#0F1E35] transition-colors hover:bg-slate-200"
              >
                Open Pipeline
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardShell>
  );
}

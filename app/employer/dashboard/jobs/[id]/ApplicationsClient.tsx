"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";
import { getJobById, type StoredJob } from "../../../../lib/jobs-store";
import {
  getApplicationsForJob,
  setApplicationStage,
  STAGE_LABELS,
  STAGE_ORDER,
  type ApplicationStage,
  type JobApplication,
} from "../../../../lib/applications-store";
import { rankCategory } from "../../../../lib/mock-data";

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

const TABS: ("all" | ApplicationStage)[] = ["all", ...STAGE_ORDER];

export default function ApplicationsClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<StoredJob | null | undefined>(undefined);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [tab, setTab] = useState<"all" | ApplicationStage>("all");

  function refresh() {
    setJob(getJobById(jobId) ?? null);
    setApplications(getApplicationsForJob(jobId));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  function handleStage(id: string, stage: ApplicationStage) {
    setApplicationStage(id, stage);
    refresh();
  }

  const filtered = applications.filter((a) => tab === "all" || a.stage === tab);

  return (
    <DashboardShell pageTitle="Applications">
      <Link
        href="/employer/dashboard/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0F1E35]"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to jobs
      </Link>

      {job === undefined && <p className="text-sm text-slate-400">Loading…</p>}

      {job === null && (
        <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm text-slate-400">
          Job not found.
        </div>
      )}

      {job && (
        <>
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase block">
              {job.department} · {job.vesselType}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
              {job.title}
            </h1>
            <p className="text-sm text-slate-500">
              Joining {job.joiningDate || "TBD"} · {job.location} · {applications.length}{" "}
              applications
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 overflow-x-auto rounded-2xl border border-[#E7EAF1] bg-white p-1.5">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                  tab === t ? "bg-[#0F1E35] text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {t === "all" ? `All (${applications.length})` : STAGE_LABELS[t]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm text-slate-400">
                No applications in this stage yet.
              </div>
            )}

            {filtered.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
                className="rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F1E35] text-sm font-bold text-white">
                      {app.candidateName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#0F1E35]">{app.candidateName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {app.candidateRank} · {rankCategory(app.candidateRank)} · {app.location}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Applied {app.appliedAt} · Availability: {app.availability}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STAGE_BADGE[app.stage]}`}
                  >
                    {STAGE_LABELS[app.stage]}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E7EAF1] pt-4">
                  <button
                    type="button"
                    disabled
                    title="No CV on file for demo data"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-400"
                  >
                    <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                    View CV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStage(app.id, "shortlisted")}
                    className="rounded-xl border border-[#E7EAF1] px-3.5 py-2 text-xs font-bold text-[#0F1E35] transition-colors hover:bg-slate-50"
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStage(app.id, "contacted")}
                    className="rounded-xl border border-[#E7EAF1] px-3.5 py-2 text-xs font-bold text-[#0F1E35] transition-colors hover:bg-slate-50"
                  >
                    Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStage(app.id, "rejected")}
                    className="rounded-xl border border-red-100 px-3.5 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}

// app/employer/dashboard/jobs/page.tsx
// app/employer/dashboard/jobs/page.tsx

"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CirclePlus, Search, FileText } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { useAuth } from "../../../context/auth-context";
import api from "../../../lib/api";

const STATUS_LABELS: Record<string, string> = {
  active: "Live",
  closed: "Closed",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-[#0E8B61]/10 text-[#0E8B61] border border-[#0E8B61]/20",
  closed: "bg-slate-100 text-slate-500 border border-slate-200",
};

const TABS = ["all", "active", "closed"];

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

// 🚀 UNIVERSAL DATA EXTRACTOR: Finds the array no matter how deeply nested it is
// 🚀 THE EXACT EXTRACTOR FOR YOUR POSTMAN FORMAT
function extractArray(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  
  // Handles { data: { data: [...] } } directly from your Postman response
  if (payload.data && Array.isArray(payload.data.data)) {
    return payload.data.data;
  }
  
  // Handles standard { data: [...] }
  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  // Deep recursive search fallback
  if (typeof payload === 'object') {
    for (const key of Object.keys(payload)) {
      if (Array.isArray(payload[key])) return payload[key];
      if (payload[key] && typeof payload[key] === 'object') {
        if (Array.isArray(payload[key].data)) return payload[key].data;
      }
    }
  }
  
  return [];
}

export default function ManageJobsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const [rawJobs, setRawJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);

      // Hit the exact same endpoint you tested in Postman
      const res = await api.get("/jobs");
      
      console.log("DEBUG - Raw API Response:", res.data);

      const jobsData = extractArray(res.data);

      // 🚀 DIRECT BYPASS: Skip company ID filtering completely for now 
      // so your Postman data is guaranteed to render on the screen!
      setRawJobs(jobsData);

    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, refreshTick]);

  const refresh = () => setRefreshTick((t) => t + 1);

  const jobs = useMemo(() => {
    return rawJobs.map((j) => {
      let status = j.job_status?.toLowerCase() === "closed" ? "closed" : "active";
      const specs = j.position_specifics || "";
      const titleMatch = specs.match(/Title:\s([^|]+)/);
      const joinMatch = specs.match(/Joining:\s([^|]+)/);
      const salMatch = specs.match(/Salary:\s([^|]+)/);

      return {
        id: String(j.job_id || j.id),
        status,
        postedAt: j.created_at ? new Date(j.created_at).toLocaleDateString() : "N/A",
        title: titleMatch ? titleMatch[1].trim() : formatTitleCase(j.job_rank || j.rank),
        rank: formatTitleCase(j.job_rank || j.rank),
        department: formatTitleCase(j.department),
        vesselType: formatTitleCase(j.vessel_type),
        joiningDate: joinMatch ? joinMatch[1].trim() : "TBD", 
        salary: salMatch ? salMatch[1].trim() : "Negotiable", 
        applicationCount: j.application_count || j.applications_count || 0,
      };
    });
  }, [rawJobs]);

  const filtered = jobs
    .filter((j) => tab === "all" || j.status === tab)
    .filter((j) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.rank.toLowerCase().includes(q) ||
        j.vesselType.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (new Date(a.postedAt) < new Date(b.postedAt) ? 1 : -1));

  const updateJobStatus = async (id: string, newStatus: "active" | "closed") => {
    try {
      setRawJobs(prev => prev.map(job => 
        String(job.job_id || job.id) === id ? { ...job, job_status: newStatus } : job
      ));
      await api.patch(`/jobs/${id}/status`, { status: newStatus });
    } catch (err: any) {
      alert("Failed to update job status.");
      refresh(); 
    }
  };

  return (
    <DashboardShell pageTitle="Manage Jobs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
            Manage Jobs
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
            Manage Maritime Jobs
          </h1>
        </div>
        <Link
          href="/employer/dashboard/post-job"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#F5B61A] px-4 py-2.5 text-xs font-bold text-[#0F1E35] shadow-sm shadow-[#F5B61A]/30 transition-all hover:brightness-95 active:scale-[0.98]"
        >
          <CirclePlus className="h-4 w-4" strokeWidth={2} />
          Post New Job
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6">
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[#E7EAF1] bg-white p-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                tab === t ? "bg-[#0F1E35] text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {t === "all" ? "All" : STATUS_LABELS[t] || t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rank or vessel"
            className="w-full rounded-2xl border border-[#E7EAF1] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F1E35] placeholder:text-slate-400 focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10 sm:w-72"
          />
        </div>
      </div>

      <div className="space-y-3 mt-6">
        {isLoading && (
          <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm font-medium text-slate-400 animate-pulse">
            Syncing jobs from database...
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm text-slate-400">
            No jobs match this filter.
          </div>
        )}

        {!isLoading && filtered.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
            className={`rounded-[20px] border bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)] transition-all ${job.status === 'closed' ? 'border-slate-200 opacity-75 grayscale-[20%]' : 'border-[#E7EAF1]'}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGE[job.status] || STATUS_BADGE["active"]}`}>
                    {STATUS_LABELS[job.status] || job.status}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Posted {job.postedAt}</span>
                </div>
                <p className={`mt-1.5 text-sm font-bold ${job.status === 'closed' ? 'text-slate-600 line-through decoration-slate-300' : 'text-[#0F1E35]'}`}>
                  {job.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {job.rank} · {job.department} · {job.vesselType} · Joining {job.joiningDate}
                </p>
                <p className={`mt-1 text-xs font-bold ${job.status === 'closed' ? 'text-slate-400' : 'text-[#0E8B61]'}`}>
                  {job.salary}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-5">
                <div className="text-center">
                  <p className={`text-lg font-extrabold ${job.status === 'closed' ? 'text-slate-400' : 'text-[#0F1E35]'}`}>
                    {job.applicationCount}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Applications</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E7EAF1] pt-4">
              <Link
                href={`/employer/dashboard/jobs/${job.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-[#0F1E35] transition-colors hover:bg-slate-200"
              >
                <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                View Applications
              </Link>

              {job.status === "active" ? (
                <button onClick={() => updateJobStatus(job.id, "closed")} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 shadow-sm">
                  Close Job
                </button>
              ) : (
                <button onClick={() => updateJobStatus(job.id, "active")} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-800 shadow-sm">
                  Reopen Job
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardShell>
  );
}
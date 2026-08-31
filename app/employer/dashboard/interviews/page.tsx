
// app/employer/dashboard/interviews/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, Briefcase, Eye, Loader2, Mail, Phone, ShieldCheck } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import api from "../../../lib/api";



const STATUS_COLORS: Record<string, string> = {
  shortlisted: "bg-blue-50 text-blue-700 border-blue-200",
  interviewed: "bg-purple-50 text-purple-700 border-purple-200",
  selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const PIPELINE_STATUSES = ["shortlisted", "interviewed", "selected", "rejected"];

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractArray(resData: any): any[] {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (resData.items && Array.isArray(resData.items)) return resData.items;
  if (resData.data && Array.isArray(resData.data)) return resData.data;
  if (resData.data?.items && Array.isArray(resData.data.items)) return resData.data.items;
  if (resData.data?.data && Array.isArray(resData.data.data)) return resData.data.data;
  return [];
}

export default function InterviewsPage() {
  const [pipelineApps, setPipelineApps] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch jobs to populate the filter dropdown
      const jobsRes = await api.get("/hr/jobs?limit=100&status=active");
      setActiveJobs(extractArray(jobsRes.data));

      // Fetch ALL applications for the company
      const query = selectedJobId ? `?job_id=${selectedJobId}&limit=1000` : `?limit=1000`;
      const appsRes = await api.get(`/hr/applications${query}`);
      const allApps = extractArray(appsRes.data);

      // 🚀 FILTER: Only show candidates who are Shortlisted or Interviewed!
      const activePipeline = allApps.filter((app: any) => {
        const status = app.status?.toLowerCase();
        return status === "shortlisted" || status === "interviewed";
      });

      setPipelineApps(activePipeline);
    } catch (err) {
      console.error("Failed to load interview pipeline data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Handle Status Update (Select/Reject)
  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      // If changed to selected/rejected, remove them from this "pending" view
      if (newStatus === "selected" || newStatus === "rejected") {
        setPipelineApps(prev => prev.filter(app => app.application_id !== applicationId && app.id !== applicationId));
      } else {
        // Otherwise just update the text (e.g., Shortlisted -> Interviewed)
        setPipelineApps(prev => prev.map(app => 
          (app.application_id === applicationId || app.id === applicationId) 
            ? { ...app, status: newStatus } 
            : app
        ));
      }
      
      // Hit the backend applications update API
      await api.patch(`/hr/applications/${applicationId}/status`, { status: newStatus });
    } catch (err: any) {
      alert("Failed to update status.");
      fetchData(); // Revert on failure
    }
  };

  const pendingCount = pipelineApps.length;

  return (
    <DashboardShell pageTitle="Interview Pipeline">
      
      {/* 1. HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Hiring Pipeline</p>
          <h1 className="text-2xl font-extrabold text-[#0F1E35]">Pending Interviews</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Shortlisted candidates waiting to be interviewed or finalized.</p>
        </div>
      </div>

      {/* 2. PIPELINE CONTAINER */}
      <div className="rounded-[20px] border border-[#E7EAF1] bg-white shadow-[0_4px_24px_rgba(15,30,53,0.03)] overflow-hidden flex flex-col min-h-[400px]">
        
        {/* Table Header / Filters */}
        <div className="p-5 border-b border-[#E7EAF1] bg-white flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-[#0F1E35]">
            Action Required ({pendingCount})
          </h2>
          
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-blue-500 transition-colors">
            <Briefcase className="h-4 w-4 text-slate-400" />
            <select 
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent py-1 outline-none cursor-pointer"
            >
              <option value="">All Active Jobs</option>
              {activeJobs.map(job => (
                <option key={job.job_id || job.id} value={job.job_id || job.id}>
                  {formatTitleCase(job.rank || job.job_rank)} - {formatTitleCase(job.vessel_type)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Table Body / Empty State */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-bold text-slate-400">Loading Pipeline...</p>
          </div>
        ) : pipelineApps.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 bg-slate-50/30">
             <ShieldCheck className="h-12 w-12 text-slate-200 mb-3" />
             <p className="text-sm font-bold text-slate-500">Pipeline is clear!</p>
             <p className="text-xs font-medium text-slate-400 mt-1">No candidates are currently shortlisted or awaiting interview results.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 bg-slate-50/50">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Applied Position</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Current Stage</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {pipelineApps.map((app) => (
                  <tr key={app.application_id || app.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Candidate */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0F1E35] text-sm mb-0.5">{formatTitleCase(app.candidate_name)}</p>
                      <Link href={`/employer/dashboard/candidates/${app.candidate_id || app.user_id}`} className="text-[10px] font-bold text-blue-600 hover:underline">
                        View Profile &rarr;
                      </Link>
                    </td>

                    {/* Position */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700">{formatTitleCase(app.rank || app.job_rank)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatTitleCase(app.vessel_type)}</p>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {app.candidate_email || app.email || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {app.phone_number || "N/A"}
                      </div>
                    </td>

                    {/* Status Update */}
                    <td className="px-6 py-4">
                      <div className="inline-block relative">
                        <select 
                          value={app.status?.toLowerCase()}
                          onChange={(e) => handleStatusChange(app.application_id || app.id, e.target.value)}
                          className={`appearance-none text-xs font-black uppercase tracking-wider px-3 py-1.5 pr-7 rounded-lg border focus:outline-none cursor-pointer transition-colors shadow-sm ${STATUS_COLORS[app.status?.toLowerCase()] || STATUS_COLORS.shortlisted}`}
                        >
                          {PIPELINE_STATUSES.map(s => (
                            <option key={s} value={s} className="bg-white text-slate-800 normal-case">
                              {s === 'selected' ? '✅ Select Candidate' : s === 'rejected' ? '❌ Reject Candidate' : formatTitleCase(s)}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/employer/dashboard/candidates/${app.candidate_id || app.user_id}`} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors border border-slate-200 shadow-sm" title="View Profile">
                           <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
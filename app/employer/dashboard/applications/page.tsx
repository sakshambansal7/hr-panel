// app/employer/dashboard/applications/page.tsx


"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Mail, Phone, Filter, Briefcase } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import api from "../../../lib/api";

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-slate-100 text-slate-600 border-slate-200",
  shortlisted: "bg-blue-50 text-blue-700 border-blue-200",
  interviewed: "bg-purple-50 text-purple-700 border-purple-200",
  selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const APPLICATION_STATUSES = ["applied", "shortlisted", "interviewed", "selected", "rejected"];

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

// 🚀 BULLETPROOF ARRAY EXTRACTOR
function extractArray(resData: any): any[] {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (resData.data && Array.isArray(resData.data)) return resData.data;
  if (resData.data?.data && Array.isArray(resData.data.data)) return resData.data.data;
  if (resData.items && Array.isArray(resData.items)) return resData.items;
  if (resData.data?.items && Array.isArray(resData.data.items)) return resData.data.items;
  return [];
}

export default function GlobalApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters State
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchWorkspaceData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // 1. Fetch ALL applications for the company (bypass pagination)
      const appRes = await api.get('/hr/applications?limit=1000');
      setApplications(extractArray(appRes.data));
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }

    try {
      // 2. Fetch ALL jobs to populate the filter dropdown
      const jobsRes = await api.get('/hr/jobs?limit=1000');
      const allJobs = extractArray(jobsRes.data);
      
      // Filter out closed jobs so the dropdown stays clean (optional)
      const activeJobs = allJobs.filter((j: any) => j.job_status?.toLowerCase() !== "closed");
      setJobs(activeJobs);
    } catch (err) {
      console.error("Failed to fetch jobs for filter:", err);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      setApplications(prev => prev.map(app => 
        (app.application_id === applicationId || app.id === applicationId) 
          ? { ...app, status: newStatus } 
          : app
      ));
      await api.patch(`/hr/applications/${applicationId}/status`, { status: newStatus });
    } catch (err: any) {
      alert("Failed to update candidate status.");
      fetchWorkspaceData(); // Revert on failure
    }
  };

  // 🚀 INSTANT FRONTEND FILTERING
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchJob = selectedJobId === "all" || String(app.job_id) === selectedJobId;
      const matchStatus = statusFilter === "all" || app.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchJob && matchStatus;
    });
  }, [applications, selectedJobId, statusFilter]);

  return (
    <DashboardShell pageTitle="Global Applications">
      <div className="mb-8">
        <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block mb-1">
          Hiring Pipeline
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl mb-2">
          Global Applications
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Candidates who have applied, been shortlisted, interviewed, or selected across all your jobs.
        </p>
      </div>

      <div className="rounded-[20px] border border-[#E7EAF1] bg-white shadow-[0_1px_2px_rgba(15,30,53,0.04)] overflow-hidden">
        
        {/* 🚀 THE NEW FILTER BAR */}
        <div className="p-5 border-b border-[#E7EAF1] bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
           <h2 className="text-sm font-bold text-[#0F1E35]">Pipeline ({filteredApplications.length})</h2>
           
           <div className="flex flex-wrap items-center gap-3">
             
             {/* Job Filter Dropdown */}
             <div className="flex items-center gap-2">
               <Briefcase className="h-4 w-4 text-slate-400" />
               <select 
                 value={selectedJobId}
                 onChange={(e) => setSelectedJobId(e.target.value)}
                 className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5B61A] max-w-[200px] truncate"
               >
                 <option value="all">All Active Jobs</option>
                 {jobs.map(job => {
                   const rank = job.job_rank || job.rank || "Position";
                   return (
                     <option key={job.job_id || job.id} value={job.job_id || job.id}>
                       {formatTitleCase(rank)} · {formatTitleCase(job.vessel_type)}
                     </option>
                   );
                 })}
               </select>
             </div>

             {/* Status Filter Dropdown */}
             <div className="flex items-center gap-2">
               <Filter className="h-4 w-4 text-slate-400" />
               <select 
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5B61A]"
               >
                 <option value="all">All Statuses</option>
                 {APPLICATION_STATUSES.map(s => (
                   <option key={s} value={s}>{formatTitleCase(s)}</option>
                 ))}
               </select>
             </div>
             
           </div>
        </div>
        
        {isLoading ? (
           <div className="p-16 text-center flex flex-col items-center justify-center space-y-4">
             <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-[#0F1E35] animate-spin"></div>
             <p className="text-sm font-bold text-slate-400">Loading Pipeline...</p>
           </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-16 text-center text-sm font-medium text-slate-400">
            No candidates match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-[#E7EAF1] bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Position / Job</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Pipeline Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF1] bg-white">
                {filteredApplications.map((app) => (
                  <tr key={app.application_id || app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0F1E35]">{formatTitleCase(app.candidate_name)}</p>
                      <Link href={`/employer/dashboard/candidates/${app.candidate_id || app.user_id}`} className="text-xs font-bold text-blue-600 hover:underline mt-0.5 inline-block">
                        View Profile &rarr;
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0F1E35]">{formatTitleCase(app.rank)}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        {formatTitleCase(app.vessel_type || app.ship_type)}
                      </p>
                    </td>
                    <td className="px-6 py-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {app.candidate_email || app.email || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {app.phone_number || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={app.status?.toLowerCase()}
                        onChange={(e) => handleStatusChange(app.application_id || app.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border focus:outline-none cursor-pointer transition-colors ${STATUS_COLORS[app.status?.toLowerCase()] || STATUS_COLORS.applied}`}
                      >
                        {APPLICATION_STATUSES.map(s => (
                          <option key={s} value={s} className="bg-white text-slate-800">{formatTitleCase(s)}</option>
                        ))}
                      </select>
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

// app/employer/dashboard/shortlisted/page.tsx

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Mail, Phone, Briefcase, CalendarCheck, XCircle } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import api from "../../../lib/api";

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractArray(resData: any): any[] {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (resData.data && Array.isArray(resData.data)) return resData.data;
  if (resData.data?.data && Array.isArray(resData.data.data)) return resData.data.data;
  if (resData.items && Array.isArray(resData.items)) return resData.items;
  return [];
}

export default function ShortlistedPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");

  const fetchWorkspaceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const appRes = await api.get('/hr/applications?limit=1000');
      setApplications(extractArray(appRes.data));
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
    try {
      const jobsRes = await api.get('/hr/jobs?limit=1000');
      setJobs(extractArray(jobsRes.data).filter((j: any) => j.job_status?.toLowerCase() !== "closed"));
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const updateStatus = async (applicationId: number, newStatus: string) => {
    try {
      setApplications(prev => prev.map(app => 
        (app.application_id === applicationId || app.id === applicationId) 
          ? { ...app, status: newStatus } 
          : app
      ));
      await api.patch(`/hr/applications/${applicationId}/status`, { status: newStatus });
    } catch (err) {
      alert("Failed to update candidate status.");
      fetchWorkspaceData(); 
    }
  };

  // 🚀 HARD-FILTERED FOR 'SHORTLISTED' ONLY
  const shortlistedCandidates = useMemo(() => {
    return applications.filter(app => 
      app.status?.toLowerCase() === "shortlisted" &&
      (selectedJobId === "all" || String(app.job_id) === selectedJobId)
    );
  }, [applications, selectedJobId]);

  return (
    <DashboardShell pageTitle="Shortlisted Candidates">
      <div className="mb-8">
        <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block mb-1">
          Hiring Pipeline
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl mb-2">
          Shortlisted Candidates
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Candidates who passed the initial screening and are waiting for an interview.
        </p>
      </div>

      <div className="rounded-[20px] border border-[#E7EAF1] bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E7EAF1] bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
           <h2 className="text-sm font-bold text-[#0F1E35]">Pool ({shortlistedCandidates.length})</h2>
           <div className="flex items-center gap-2">
             <Briefcase className="h-4 w-4 text-slate-400" />
             <select 
               value={selectedJobId}
               onChange={(e) => setSelectedJobId(e.target.value)}
               className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 max-w-[200px] truncate"
             >
               <option value="all">All Active Jobs</option>
               {jobs.map(job => (
                 <option key={job.job_id || job.id} value={job.job_id || job.id}>
                   {formatTitleCase(job.job_rank || job.rank)} · {formatTitleCase(job.vessel_type)}
                 </option>
               ))}
             </select>
           </div>
        </div>
        
        {isLoading ? (
           <div className="p-16 text-center text-sm font-bold text-slate-400 animate-pulse">Loading...</div>
        ) : shortlistedCandidates.length === 0 ? (
          <div className="p-16 text-center text-sm font-medium text-slate-400">
            No candidates have been shortlisted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-[#E7EAF1] bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Position Applied</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF1] bg-white">
                {shortlistedCandidates.map((app) => (
                  <tr key={app.application_id || app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0F1E35]">{formatTitleCase(app.candidate_name)}</p>
                      <Link href={`/employer/dashboard/candidates/${app.candidate_id || app.user_id}`} className="text-[11px] font-bold text-blue-600 hover:underline">
                        View Profile &rarr;
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0F1E35]">{formatTitleCase(app.rank)}</p>
                      <p className="text-xs text-slate-500">{formatTitleCase(app.vessel_type || app.ship_type)}</p>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {app.candidate_email || app.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {app.phone_number || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => updateStatus(app.application_id || app.id, 'interviewed')}
                        className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" /> Move to Interview
                      </button>
                      <button 
                        onClick={() => updateStatus(app.application_id || app.id, 'rejected')}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
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
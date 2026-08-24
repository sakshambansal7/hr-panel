// app/employer/dashboard/jobs/[id]/page.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, Filter } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";
import api from "../../../../lib/api";

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

function extractArray(resData: any): any[] {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (resData.data && Array.isArray(resData.data)) return resData.data;
  if (resData.data?.data && Array.isArray(resData.data.data)) return resData.data.data;
  if (resData.items && Array.isArray(resData.items)) return resData.items;
  if (resData.data?.items && Array.isArray(resData.data.items)) return resData.data.items;
  return [];
}

export default function JobATSPage() {
  // 🚀 FIXED: Use Next.js hook to safely grab the ID from the URL
  const params = useParams();
  const jobId = params?.id as string;
  
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchWorkspaceData = useCallback(async () => {
    if (!jobId) return; // 🚀 Guard clause: Don't fetch if URL ID isn't ready

    setIsLoading(true);

    try {
      const jobsRes = await api.get("/jobs?limit=1000"); 
      const jobsList = extractArray(jobsRes.data);
      const currentJob = jobsList.find((j: any) => String(j.job_id || j.id) === String(jobId));
      if (currentJob) setJob(currentJob);
    } catch (err) {
      console.error("Failed to fetch job details", err);
    }

    try {
      // 🚀 Now this will cleanly hit /hr/jobs/8417/applications
      const appRes = await api.get(`/hr/jobs/${jobId}/applications`);
      let fetchedApps = extractArray(appRes.data);

      if (statusFilter) {
        fetchedApps = fetchedApps.filter((app: any) => app.status?.toLowerCase() === statusFilter.toLowerCase());
      }
      
      setApplications(fetchedApps);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    }

    setIsLoading(false);
  }, [jobId, statusFilter]);

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
      fetchWorkspaceData();
    }
  };

  const jobStatus = job?.job_status?.toLowerCase() === "closed" ? "closed" : "active";
  const specs = job?.position_specifics || "";
  const titleMatch = specs.match(/Title:\s([^|]+)/);
  const jobRank = job?.job_rank || job?.rank || "Position";
  const jobTitle = titleMatch ? titleMatch[1].trim() : formatTitleCase(jobRank);
  
  const totalApps = applications.length;
  const selectedCount = applications.filter(a => a.status === 'selected').length;

  return (
    <DashboardShell pageTitle={`ATS: ${jobTitle}`}>
      <div className="mb-6">
        <Link href="/employer/dashboard/jobs" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0F1E35] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Link>
        <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${jobStatus === 'active' ? 'bg-[#0E8B61]/10 text-[#0E8B61]' : 'bg-slate-100 text-slate-500'}`}>
                {jobStatus === 'active' ? 'Live' : 'Closed'}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Posted {job?.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F1E35]">{jobTitle}</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {formatTitleCase(job?.department)} · {formatTitleCase(job?.vessel_type)} · {formatTitleCase(job?.contract || '6 Months')}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-[#0F1E35]">{totalApps}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Applicants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-[#0E8B61]">{selectedCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#0E8B61]">Selected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-[#E7EAF1] bg-white shadow-[0_1px_2px_rgba(15,30,53,0.04)] overflow-hidden">
        <div className="p-5 border-b border-[#E7EAF1] bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
           <h2 className="text-sm font-bold text-[#0F1E35]">Candidate Applications</h2>
           <div className="flex items-center gap-2">
             <Filter className="h-4 w-4 text-slate-400" />
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5B61A]"
             >
               <option value="">All Statuses</option>
               {APPLICATION_STATUSES.map(s => (
                 <option key={s} value={s}>{formatTitleCase(s)}</option>
               ))}
             </select>
           </div>
        </div>
        
        {isLoading ? (
           <div className="p-12 text-center text-sm font-bold text-slate-400 animate-pulse">Loading Candidates...</div>
        ) : applications.length === 0 ? (
          <div className="p-16 text-center text-sm font-medium text-slate-400">
            {statusFilter ? `No candidates found with status "${formatTitleCase(statusFilter)}".` : "No candidates have applied for this position yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-[#E7EAF1] bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF1] bg-white">
                {applications.map((app) => (
                  <tr key={app.application_id || app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0F1E35]">{formatTitleCase(app.candidate_name)}</p>
                      <Link href={`/employer/dashboard/candidates/${app.candidate_id || app.user_id}`} className="text-xs font-bold text-blue-600 hover:underline mt-0.5 inline-block">
                        View Profile &rarr;
                      </Link>
                    </td>
                    <td className="px-6 py-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {app.candidate_email || app.email || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {app.phone_number || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {new Date(app.applied_at || app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={app.status?.toLowerCase()}
                        onChange={(e) => handleStatusChange(app.application_id || app.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border focus:outline-none cursor-pointer ${STATUS_COLORS[app.status?.toLowerCase()] || STATUS_COLORS.applied}`}
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
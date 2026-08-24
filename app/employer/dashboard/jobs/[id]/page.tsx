// app/employer/dashboard/jobs/[id]/page.tsx

"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, Filter } from "lucide-react";
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

export default function JobATSPage({ params }: { params: Promise<{ id: string }> }) {
  // 🚀 Next.js App Router best practice for dynamic routes
  const { id: jobId } = use(params);
  const router = useRouter();
  
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // 🚀 Bulletproof Fetch logic mapped to your HR Repository
  const fetchWorkspaceData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch ALL Jobs to find the specific one for the header
      const jobsRes = await api.get("/jobs"); 
      let jobsData = jobsRes.data;
      
      // Aggressive extraction
      let extractedJobs = [];
      if (Array.isArray(jobsData)) extractedJobs = jobsData;
      else if (jobsData?.data && Array.isArray(jobsData.data)) extractedJobs = jobsData.data;
      else if (jobsData?.data?.data && Array.isArray(jobsData.data.data)) extractedJobs = jobsData.data.data;
      
      const currentJob = extractedJobs.find((j: any) => String(j.job_id || j.id) === jobId);
      setJob(currentJob || null);

      // 2. Fetch Applications for this specific Job
      // Assuming your route is /hr/applications. If it's just /applications, remove the /hr
      const appRes = await api.get(`/hr/applications`, {
        params: {
          job_id: jobId,
          status: statusFilter || undefined // Send filter directly to backend!
        }
      });
      
      let appsData = appRes.data;
      let extractedApps = [];
      
      // Aggressive extraction
      if (Array.isArray(appsData)) extractedApps = appsData;
      else if (appsData?.data && Array.isArray(appsData.data)) extractedApps = appsData.data;
      else if (appsData?.data?.data && Array.isArray(appsData.data.data)) extractedApps = appsData.data.data;

      setApplications(extractedApps);

    } catch (err) {
      console.error("Failed to fetch ATS data", err);
    } finally {
      setIsLoading(false);
    }
  }, [jobId, statusFilter]); 

  // Single clean trigger
  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  // Handle Dropdown Status Change
  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      // Optimistic update so it feels instant
      setApplications(prev => prev.map(app => 
        app.application_id === applicationId || app.id === applicationId 
          ? { ...app, status: newStatus } 
          : app
      ));
      
      // Make sure this matches your Express route! 
      await api.patch(`/hr/applications/${applicationId}/status`, { status: newStatus });
    } catch (err: any) {
      alert("Failed to update candidate status.");
      fetchWorkspaceData(); // refresh on fail
    }
  };

  // Unpack job data for the header safely
  const jobStatus = job?.job_status?.toLowerCase() === "closed" ? "closed" : "active";
  const specs = job?.position_specifics || "";
  const titleMatch = specs.match(/Title:\s([^|]+)/);
  const jobTitle = titleMatch ? titleMatch[1].trim() : formatTitleCase(job?.job_rank || job?.rank);
  const selectedCount = applications.filter(a => a.status === 'selected').length;

  return (
    <DashboardShell pageTitle={`ATS: ${jobTitle}`}>
      
      {/* HEADER & BACK BUTTON */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0F1E35] transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </button>
        
        {/* Job Header Card */}
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
            <h1 className="text-2xl font-extrabold text-[#0F1E35]">{jobTitle || 'Loading...'}</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {formatTitleCase(job?.department)} · {formatTitleCase(job?.vessel_type)} · {formatTitleCase(job?.contract || '6 Months')}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-[#0F1E35]">{applications.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Applicants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-[#0E8B61]">{selectedCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#0E8B61]">Selected</p>
            </div>
          </div>
        </div>
      </div>

      {/* APPLICATIONS TABLE */}
      <div className="rounded-[20px] border border-[#E7EAF1] bg-white shadow-[0_1px_2px_rgba(15,30,53,0.04)] overflow-hidden">
        
        {/* Table Header & Filter Dropdown */}
        <div className="p-5 border-b border-[#E7EAF1] bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
           <h2 className="text-sm font-bold text-[#0F1E35]">Candidate Applications</h2>
           
           <div className="flex items-center gap-2">
             <Filter className="h-4 w-4 text-slate-400" />
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5B61A] focus:ring-2 focus:ring-[#F5B61A]/20 cursor-pointer"
             >
               <option value="">All Statuses</option>
               {APPLICATION_STATUSES.map(s => (
                 <option key={s} value={s}>{formatTitleCase(s)}</option>
               ))}
             </select>
           </div>
        </div>
        
        {isLoading ? (
           <div className="p-12 text-center text-sm font-bold text-slate-400 animate-pulse">
             Loading Candidates...
           </div>
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
                  <th className="px-6 py-4">Pipeline Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF1] bg-white">
                {applications.map((app) => (
                  <tr key={app.application_id || app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0F1E35]">{formatTitleCase(app.candidate_name)}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">ID: #{app.candidate_id}</p>
                    </td>
                    <td className="px-6 py-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {app.candidate_email}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {app.phone_number || "Not provided"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
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
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/employer/dashboard/candidates/${app.candidate_id}`}
                        className="inline-block rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#0F1E35] hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        View Full CV &rarr;
                      </Link>
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
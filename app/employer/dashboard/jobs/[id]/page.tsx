// app/employer/dashboard/jobs/[id]/page.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, Filter, Zap, Users, ShieldCheck, MapPin, Briefcase, FileText, Calendar, Loader2, X } from "lucide-react";
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
  const params = useParams();
  const jobId = params?.id as string;
  
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // --- Scheduling Modal State ---
  const [schedulingApp, setSchedulingApp] = useState<any>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const fetchWorkspaceData = useCallback(async () => {
    if (!jobId) return;

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
    // 🚀 INTERCEPT: If they select "interviewed", open the modal instead of just updating!
    if (newStatus.toLowerCase() === "interviewed") {
      const appToSchedule = applications.find(a => a.application_id === applicationId || a.id === applicationId);
      if (appToSchedule) {
        setSchedulingApp(appToSchedule);
        return; 
      }
    }

    // Otherwise, normal status update
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

  const handleConfirmSchedule = async () => {
    if (!scheduleDate || !scheduleTime || !schedulingApp) return;
    setIsScheduling(true);

    try {
      // Create the ISO datetime string your backend expects
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      const appId = schedulingApp.application_id || schedulingApp.id;

      // 1. Hit your Interview creation API!
      await api.post('/hr/interviews', { 
        application_id: appId, 
        scheduled_at: scheduledAt 
      });

      // 2. Update Application Status to 'interviewed'
      await api.patch(`/hr/applications/${appId}/status`, { status: "interviewed" });
      
      // Update UI state
      setApplications(prev => prev.map(app => 
        (app.application_id === appId || app.id === appId) ? { ...app, status: "interviewed" } : app
      ));

      // Close modal
      setSchedulingApp(null);
      setScheduleDate("");
      setScheduleTime("");
    } catch (error: any) {
      console.error("Failed to schedule:", error);
      alert(error.response?.data?.message || "Failed to schedule the interview. Make sure the date is in the future.");
    } finally {
      setIsScheduling(false);
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
      
      {/* --- SCHEDULING MODAL OVERLAY --- */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Schedule Interview</h3>
              <button onClick={() => setSchedulingApp(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-6">
                Set a date and time to interview <span className="font-bold text-slate-900">{formatTitleCase(schedulingApp.candidate_name)}</span>. This will add them to your Interview Pipeline.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</label>
                  <input 
                    type="date" 
                    value={scheduleDate} 
                    onChange={e => setScheduleDate(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold text-slate-800" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Time</label>
                  <input 
                    type="time" 
                    value={scheduleTime} 
                    onChange={e => setScheduleTime(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold text-slate-800" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                <button 
                  onClick={() => setSchedulingApp(null)} 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmSchedule} 
                  disabled={!scheduleDate || !scheduleTime || isScheduling} 
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  {isScheduling && <Loader2 className="h-4 w-4 animate-spin"/>}
                  Confirm & Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NORMAL PAGE CONTENT --- */}
      <div className="mb-6">
        <Link href="/employer/dashboard/jobs" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0F1E35] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Link>
        
        <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${jobStatus === 'active' ? 'bg-[#0E8B61]/10 text-[#0E8B61] border border-[#0E8B61]/20' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {jobStatus === 'active' ? <div className="h-1.5 w-1.5 rounded-full bg-[#0E8B61]" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
                  {jobStatus === 'active' ? 'Accepting Applications' : 'Position Closed'}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Posted {job?.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
                </span>
              </div>

              <h1 className="text-3xl font-black text-[#0F1E35]">{jobTitle}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><Briefcase className="h-4 w-4 text-blue-500" /> {formatTitleCase(job?.department)} Dept</span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><MapPin className="h-4 w-4 text-amber-500" /> {formatTitleCase(job?.vessel_type)}</span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><FileText className="h-4 w-4 text-purple-500" /> {formatTitleCase(job?.contract || 'Contract Length N/A')}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8 shrink-0">
              <div className="text-center bg-slate-50 rounded-2xl p-4 min-w-[120px] border border-slate-100">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-slate-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Applicants</p>
                </div>
                <p className="text-3xl font-black text-[#0F1E35]">{totalApps}</p>
              </div>
              <div className="text-center bg-[#0E8B61]/5 rounded-2xl p-4 min-w-[120px] border border-[#0E8B61]/10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-[#0E8B61]" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#0E8B61]">Selected</p>
                </div>
                <p className="text-3xl font-black text-[#0E8B61]">{selectedCount}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-[#E7EAF1] bg-white shadow-[0_4px_24px_rgba(15,30,53,0.03)] overflow-hidden">
        
        <div className="p-5 border-b border-[#E7EAF1] bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black text-[#0F1E35] uppercase tracking-wide">Candidate Pipeline</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 shadow-sm focus-within:border-blue-500 transition-colors">
               <Filter className="h-4 w-4 text-slate-400" />
               <select 
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="text-xs font-bold text-slate-700 bg-transparent py-2.5 outline-none cursor-pointer"
               >
                 <option value="">All Statuses</option>
                 {APPLICATION_STATUSES.map(s => (
                   <option key={s} value={s}>{formatTitleCase(s)}</option>
                 ))}
               </select>
             </div>

             <Link href={`/employer/dashboard/jobs/${jobId}/review`}>
               <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0">
                 <Zap className="h-4 w-4 fill-white" />
                 Speed Review
               </button>
             </Link>
          </div>
        </div>
        
        {isLoading ? (
           <div className="p-16 flex flex-col items-center justify-center space-y-4">
             <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
             <p className="text-sm font-bold text-slate-400 animate-pulse">Loading Candidate Pipeline...</p>
           </div>
        ) : applications.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No candidates found</h3>
            <p className="text-sm font-medium text-slate-500">
              {statusFilter ? `Try changing your status filter from "${formatTitleCase(statusFilter)}".` : "Share this job post to start receiving applications."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-[#E7EAF1] bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Candidate Name</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Pipeline Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF1] bg-white">
                {applications.map((app) => (
                  <tr key={app.application_id || app.id} className="group transition-colors hover:bg-blue-50/30">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0F1E35] text-base mb-1">{formatTitleCase(app.candidate_name)}</p>
                      <Link href={`/employer/dashboard/candidates/${app.candidate_id || app.user_id}`} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        View Profile &rarr;
                      </Link>
                    </td>
                    <td className="px-6 py-4 space-y-2">
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                        <div className="bg-slate-100 p-1.5 rounded-md"><Mail className="h-3.5 w-3.5 text-slate-500" /></div>
                        {app.candidate_email || app.email || "N/A"}
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                        <div className="bg-slate-100 p-1.5 rounded-md"><Phone className="h-3.5 w-3.5 text-slate-500" /></div>
                        {app.phone_number || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {new Date(app.applied_at || app.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-block relative">
                        <select 
                          value={app.status?.toLowerCase()}
                          onChange={(e) => handleStatusChange(app.application_id || app.id, e.target.value)}
                          className={`appearance-none text-xs font-black uppercase tracking-wider px-4 py-2 pr-8 rounded-xl border focus:outline-none cursor-pointer transition-colors ${STATUS_COLORS[app.status?.toLowerCase()] || STATUS_COLORS.applied} shadow-sm`}
                        >
                          {APPLICATION_STATUSES.map(s => (
                            <option key={s} value={s} className="bg-white text-slate-800 normal-case">{formatTitleCase(s)}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
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
// app/employer/dashboard/DashboardClient.tsx

// app/employer/dashboard/DashboardClient.tsx

// app/employer/dashboard/DashboardClient.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Briefcase, FileText, CheckCircle, Users, Calendar, 
  TrendingUp, XCircle, Download, Eye, ChevronRight
} from "lucide-react";
import DashboardShell from "./components/DashboardShell";
import api from "../../lib/api";

export default function DashboardClient() {
  const router = useRouter();
  
  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  
  // Applications Table State
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isAppsLoading, setIsAppsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppsForJob, setTotalAppsForJob] = useState(0);

  // 1. Fetch Dashboard Overview & Jobs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch Overview Stats
        const overviewRes = await api.get("/hr/dashboard/overview");
        const statsData = overviewRes.data?.data || overviewRes.data || {};
        setStats(statsData);

        // Fetch Recent Jobs
        const jobsRes = await api.get("/hr/jobs?limit=5");
        
        // Safely extract the array
        const jobsPayload = jobsRes.data?.data || jobsRes.data;
        let jobsArray = [];
        if (jobsPayload?.items && Array.isArray(jobsPayload.items)) {
            jobsArray = jobsPayload.items;
        } else if (Array.isArray(jobsPayload?.data)) {
            jobsArray = jobsPayload.data;
        } else if (Array.isArray(jobsPayload)) {
            jobsArray = jobsPayload;
        }
        
        setRecentJobs(jobsArray);

        if (jobsArray.length > 0) {
          setSelectedJobId(jobsArray[0].job_id); 
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 2. Fetch Applications dynamically when a Job is selected
  useEffect(() => {
    if (!selectedJobId) return;

    const fetchApplications = async () => {
      try {
        setIsAppsLoading(true);
        const res = await api.get(`/hr/applications?job_id=${selectedJobId}&page=${page}&limit=5`);
        
        // Safely extract applications array
        const appsPayload = res.data?.data || res.data;
        let appsArray = [];
        if (appsPayload?.items && Array.isArray(appsPayload.items)) {
            appsArray = appsPayload.items;
        } else if (Array.isArray(appsPayload?.data)) {
            appsArray = appsPayload.data;
        } else if (Array.isArray(appsPayload)) {
            appsArray = appsPayload;
        }

        const total = appsPayload?.pagination?.total || appsPayload?.total || 0;
        const fetchedTotalPages = appsPayload?.pagination?.totalPages || 1;

        setApplications(appsArray);
        setTotalAppsForJob(total);
        setTotalPages(fetchedTotalPages);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setIsAppsLoading(false);
      }
    };
    fetchApplications();
  }, [selectedJobId, page]);

  // 3. Handle Status Update from Dropdown
  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      setApplications(prev => prev.map(app => app.application_id === appId ? { ...app, status: newStatus } : app));
      await api.patch(`/hr/applications/${appId}/status`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Helper to format snake_case text to Title Case (e.g. chief_engineer -> Chief Engineer)
  const formatText = (str: string) => {
    if (!str) return 'N/A';
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  if (isLoading) {
    return (
      <DashboardShell pageTitle="Dashboard">
        <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400 animate-pulse">
          Loading Dashboard Analytics...
        </div>
      </DashboardShell>
    );
  }

  const activeJobDetails = recentJobs.find(j => j.job_id === selectedJobId) || {};

  return (
    <DashboardShell pageTitle="Dashboard">
      
      {/* 1. HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, HR! 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening with your recruitment today.</p>
        </div>
      </div>

      {/* 2. TOP STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Total Jobs", val: stats.total_jobs || 0, sub: "All Jobs", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50", link: "/employer/dashboard/jobs" },
          { label: "Active Vacancies", val: stats.active_jobs || 0, sub: "Open Positions", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", link: "/employer/dashboard/jobs?status=active" },
          { label: "Total Applications", val: stats.total_applications || 0, sub: "All Time", icon: FileText, color: "text-blue-600", bg: "bg-blue-50", link: "/employer/dashboard/applications" },
          { label: "Apps This Week", val: stats.applications_this_week || 0, sub: "Recent", icon: Users, color: "text-purple-600", bg: "bg-purple-50", link: "/employer/dashboard/applications" },
          { label: "Interviews", val: stats.upcoming_interviews || 0, sub: "Upcoming", icon: Calendar, color: "text-orange-500", bg: "bg-orange-50", link: "/employer/dashboard/interviews" },
          { label: "Hires", val: stats.selected || 0, sub: "Total Selected", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", link: "/employer/dashboard/candidates?status=selected" },
        ].map((stat, i) => (
          <Link href={stat.link} key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-600">{stat.label}</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900">{stat.val}</h3>
              <p className="text-xs mt-1 font-medium text-slate-400">{stat.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 3. MY POSTED JOBS (Full-Width Table) */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">My Posted Jobs</h2>
          <Link href="/employer/dashboard/jobs" className="text-xs font-semibold text-blue-600 hover:underline">
            Manage Jobs
          </Link>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Rank / Position</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-center">Total Applications</th>
                <th className="px-6 py-4 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentJobs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-slate-500">No jobs posted yet.</td></tr>
              ) : (
                recentJobs.map((job) => (
                  <tr 
                    key={job.job_id} 
                    onClick={() => router.push(`/employer/dashboard/jobs/${job.job_id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-5 font-bold text-blue-600 hover:underline">
                      {formatText(job.rank)}
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-medium">
                      {formatText(job.department)}
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-slate-700">
                      {job.application_count || 0}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${job.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {formatText(job.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50 rounded-b-2xl">
          <Link href="/employer/dashboard/jobs" className="text-sm font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1">
            View All Jobs <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4. MASTER-DETAIL VIEW (Filter Sidebar + Main Applications Table) */}
      <div className="grid lg:grid-cols-4 gap-6">
        
        {/* Sidebar: All Jobs Filter */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 col-span-1 h-fit">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Filter Applications by Job</h2>
          <div className="space-y-2.5">
            {recentJobs.length === 0 && <p className="text-xs text-slate-500">No jobs available.</p>}
            {recentJobs.map((job) => {
              const isActive = job.job_id === selectedJobId;
              return (
                <button 
                  key={job.job_id} 
                  onClick={() => {
                    setSelectedJobId(job.job_id);
                    setPage(1);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl transition-all border ${isActive ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-bold truncate pr-2 ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                      {formatText(job.rank)}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {job.application_count || 0}
                    </span>
                  </div>
                  <div className={`text-xs font-medium truncate ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                    {formatText(job.department)}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Applications Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm col-span-3 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-900">
                Applications – {formatText(activeJobDetails?.rank)}
              </h2>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                {totalAppsForJob} Total
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[300px]">
            {isAppsLoading ? (
              <div className="flex justify-center items-center h-64 text-slate-400 font-bold text-sm animate-pulse">Loading candidates...</div>
            ) : applications.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-slate-500 font-medium text-sm">No applications found for this position.</div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Applied On</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.application_id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* Candidate Column */}
                      <td className="px-6 py-4 cursor-pointer" onClick={() => router.push(`/employer/dashboard/candidates/${app.candidate_id}`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-300">
                             <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${app.candidate_name}&backgroundColor=0F1E35&textColor=ffffff`} alt="avatar" />
                          </div>
                          <div>
                            <div className="font-bold text-blue-600 hover:underline">{app.candidate_name || 'Unknown Candidate'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Column */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{app.candidate_email}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{app.phone_number}</div>
                      </td>

                      {/* Interactive Status Column */}
                      <td className="px-6 py-4">
                        <select 
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer
                          ${app.status === 'shortlisted' ? 'bg-purple-50 border-purple-200 text-purple-700 focus:border-purple-500' :
                            app.status === 'interviewed' ? 'bg-orange-50 border-orange-200 text-orange-700 focus:border-orange-500' :
                            app.status === 'selected' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:border-emerald-500' :
                            app.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700 focus:border-red-500' :
                            'bg-blue-50 border-blue-200 text-blue-700 focus:border-blue-500'}`}
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interviewed">Interviewed</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Date Column */}
                      <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                        {new Date(app.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button onClick={() => router.push(`/employer/dashboard/applications/${app.application_id}`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 shadow-sm hover:shadow" title="View Candidate Profile">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          <div className="p-5 border-t border-slate-100 mt-auto flex items-center justify-between text-sm bg-slate-50/50 rounded-b-2xl">
            <span className="text-slate-500 font-medium">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl disabled:opacity-50 hover:bg-slate-50 font-bold shadow-sm transition-all"
              >
                Prev
              </button>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl disabled:opacity-50 hover:bg-slate-50 font-bold shadow-sm transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
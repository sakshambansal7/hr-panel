// app/employer/dashboard/applications/page.tsx

// app/employer/dashboard/applications/ApplicationsClient.tsx

// app/employer/dashboard/applications/ApplicationsClient.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, Filter, Eye, MoreVertical, 
  Mail, Phone, Clock, Ship, Anchor, CheckCircle, AlertCircle 
} from "lucide-react";
import DashboardShell from "../components/DashboardShell"; // Adjust path if necessary
import api from "../../../lib/api";

export default function ApplicationsClient() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10; // Set to 5 for testing pagination easily

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/hr/applications?page=${page}&limit=${limit}`);
        
        // Extract data based on your HrService format { items: [], pagination: {} }
        const payload = res.data?.data || res.data;
        let appsArray = [];
        
        if (payload?.items && Array.isArray(payload.items)) {
            appsArray = payload.items;
        } else if (Array.isArray(payload?.data)) {
            appsArray = payload.data;
        } else if (Array.isArray(payload)) {
            appsArray = payload;
        }

        setApplications(appsArray);
        setTotalItems(payload?.pagination?.total || payload?.total || appsArray.length);
        setTotalPages(payload?.pagination?.totalPages || Math.ceil((payload?.total || appsArray.length) / limit) || 1);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [page]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      // Optimistic UI Update
      setApplications(prev => prev.map(app => 
        app.application_id === appId ? { ...app, status: newStatus } : app
      ));
      await api.patch(`/hr/applications/${appId}/status`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Temporary helper to generate a visually consistent mock match score 
  const getMockMatchScore = (id: string | number) => {
    const num = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, '')) || 85;
    const score = (num % 40) + 60; // Keeps it between 60 and 99
    
    let label = 'Fair';
    if (score >= 90) label = 'Excellent';
    else if (score >= 70) label = 'Good';
    else if (score < 65) label = 'Low Match';

    return { score, label };
  };

  // 🚀 Helper to generate smart pagination numbers (e.g., 1 ... 8 9 10 ... 100)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <DashboardShell pageTitle="Applications">
      {/* Force a light background wrapper to prevent the black void issue */}
      <div className="bg-[#F4F7F9] min-h-screen -m-6 p-6">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* HEADER & FILTERS */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-[#0F1E35]">Applications</h1>
              <p className="text-sm text-slate-500 mt-1">Review, filter, and manage maritime candidate applications.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search candidate..." 
                  className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-64 shadow-sm transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>

          {/* LOADING STATE */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 font-bold animate-pulse">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white border border-slate-200 rounded-[20px] shadow-sm">
              <p className="font-bold text-lg text-slate-700">No applications found.</p>
              <p className="text-sm">When seafarers apply to your jobs, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* HORIZONTAL CARDS LIST */}
              {applications.map((app) => {
                const match = getMockMatchScore(app.application_id);
                
                return (
                  <div key={app.application_id} className="group bg-white border border-slate-200 rounded-[20px] p-5 md:p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col xl:flex-row items-start xl:items-center gap-6 relative overflow-hidden">
                    
                    {/* Left Accent Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      app.status === 'shortlisted' ? 'bg-purple-500' :
                      app.status === 'interviewed' ? 'bg-orange-500' :
                      app.status === 'selected' ? 'bg-emerald-500' :
                      app.status === 'rejected' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />

                    {/* 1. CANDIDATE PROFILE (Left - AVATARS REMOVED) */}
                    <div className="flex flex-col w-full xl:w-[30%] xl:pl-2">
                      <div className="flex items-center gap-2">
                        <Link href={`/employer/dashboard/candidates/${app.candidate_id}`} className="text-lg font-bold text-[#0F1E35] hover:text-blue-600 transition-colors">
                          {app.candidate_name || "Unknown Candidate"}
                        </Link>
                        {match.score >= 90 && (
                          <span title="Top Candidate" className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">ID: {app.candidate_id}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <a href={`mailto:${app.candidate_email}`} className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors"><Mail className="w-3 h-3"/> Email</a>
                        {app.phone_number && <a href={`tel:${app.phone_number}`} className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors"><Phone className="w-3 h-3"/> Call</a>}
                      </div>
                    </div>

                    {/* 2. JOB DETAILS (Middle-Left) */}
                    <div className="w-full xl:w-[25%] flex flex-col justify-center border-l-0 xl:border-l border-slate-100 xl:pl-6">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">Applied Position</p>
                      <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                        <Anchor className="w-4 h-4 text-blue-500" />
                        {app.rank || app.job_type || 'Unspecified Role'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Ship className="w-3.5 h-3.5" />
                        {app.department || app.ship_type || 'Unspecified Dept'}
                      </div>
                    </div>

                    {/* 3. READINESS MATCH (Middle-Right) */}
                    <div className="w-full xl:w-[25%] flex flex-col justify-center border-l-0 xl:border-l border-slate-100 xl:pl-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Readiness Match</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold 
                          ${match.score >= 90 ? 'bg-emerald-50 text-emerald-700' : 
                            match.score >= 70 ? 'bg-blue-50 text-blue-700' : 
                            'bg-red-50 text-red-700'}`}>
                          {match.label}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${match.score >= 90 ? 'bg-emerald-500' : match.score >= 70 ? 'bg-blue-500' : 'bg-red-500'}`}
                            style={{ width: `${match.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-black text-slate-900">{match.score}%</span>
                      </div>

                      {/* Mock Warning for Low Match */}
                      {match.score < 70 && (
                        <div className="flex items-start gap-1.5 mt-2 text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-100">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span className="text-[10px] font-semibold leading-tight">Missing documentation</span>
                        </div>
                      )}
                    </div>

                    {/* 4. STATUS & ACTIONS (Right) */}
                    <div className="w-full xl:w-[20%] flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0 gap-3 ml-auto">
                      
                      <select 
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                        className={`w-full xl:w-40 px-3 py-2 rounded-xl text-sm font-bold border-2 outline-none cursor-pointer transition-colors shadow-sm
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

                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-medium text-slate-400 hidden xl:block">
                          Applied: {new Date(app.created_at).toLocaleDateString()}
                        </p>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="View Application">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-[#0F1E35] hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* REAL PAGINATION CONTROL */}
          {!isLoading && applications.length > 0 && (
            <div className="flex items-center justify-between mt-8 p-4 bg-white border border-slate-200 rounded-[20px] shadow-sm flex-wrap gap-4">
              <span className="text-sm text-slate-500 font-medium">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} applications
              </span>
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                
                {/* Smart Page Numbers (Hidden on tiny mobile screens to prevent overflow, visible on sm+) */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {getPageNumbers().map((num, idx) => (
                    num === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-2 text-slate-400 font-bold tracking-widest">
                        ...
                      </span>
                    ) : (
                      <button 
                        key={`page-${num}`}
                        onClick={() => setPage(num as number)}
                        className={`min-w-[40px] px-3 py-2 border rounded-xl text-sm font-semibold transition-colors
                          ${num === page 
                            ? 'border-[#0F1E35] bg-[#0F1E35] text-white shadow-sm' 
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {num}
                      </button>
                    )
                  ))}
                </div>

                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardShell>
  );
}
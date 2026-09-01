

// app/employer/dashboard/applications/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, Filter, Eye, MoreVertical, Mail, Phone, Clock, 
  Ship, Anchor, CheckCircle, AlertCircle, Briefcase, FilterX 
} from "lucide-react";
import DashboardShell from "../components/DashboardShell"; 
import api from "../../../lib/api";

export default function ApplicationsClient() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // -----------------------------------------------------------------------------
  // FILTER STATES
  // -----------------------------------------------------------------------------
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [rankFilter, setRankFilter] = useState<string>("all");
  const [vesselFilter, setVesselFilter] = useState<string>("all");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10; 
  
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/hr/applications?page=${page}&limit=${limit}`);
        
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
      alert("Failed to update status. Please try again.");
    }
  };

  const getMockMatchScore = (id: string | number) => {
    const num = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, '')) || 85;
    const score = (num % 40) + 60; 
    let label = 'Fair';
    if (score >= 90) label = 'Excellent';
    else if (score >= 70) label = 'Good';
    else if (score < 65) label = 'Low Match';
    return { score, label };
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
      else if (page >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }
    return pages;
  };

  // -----------------------------------------------------------------------------
  // UNIQUE FILTER OPTIONS
  // -----------------------------------------------------------------------------
  const uniqueDepartments = Array.from(
    new Set(applications.map((app) => app.department).filter(Boolean).map(String))
  ).sort();

  const uniqueRanks = Array.from(
    new Set(applications.map((app) => app.rank || app.job_type).filter(Boolean).map(String))
  ).sort();

  const uniqueVessels = Array.from(
    new Set(applications.map((app) => app.vessel_type || app.ship_type).filter(Boolean).map(String))
  ).sort();

  // -----------------------------------------------------------------------------
  // FILTERED APPLICATIONS
  // -----------------------------------------------------------------------------
  const filteredApplications = applications
    .filter((app) => departmentFilter === "all" || app.department === departmentFilter)
    .filter((app) => rankFilter === "all" || (app.rank || app.job_type) === rankFilter)
    .filter((app) => vesselFilter === "all" || (app.vessel_type || app.ship_type) === vesselFilter)
    .filter((app) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        app.candidate_name?.toLowerCase().includes(q) ||
        app.candidate_email?.toLowerCase().includes(q) ||
        app.rank?.toLowerCase().includes(q) ||
        app.job_type?.toLowerCase().includes(q) ||
        app.department?.toLowerCase().includes(q) ||
        app.vessel_type?.toLowerCase().includes(q) ||
        app.ship_type?.toLowerCase().includes(q) ||
        String(app.candidate_id).toLowerCase().includes(q)
      );
    });

  const hasActiveFilters = departmentFilter !== "all" || rankFilter !== "all" || vesselFilter !== "all";

  return (
    <DashboardShell pageTitle="Applications">
      <div className="bg-[#F4F7F9] min-h-screen -m-6 p-6">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* HEADER & SEARCH BAR */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-black text-[#0F1E35]">Applications</h1>
              <p className="text-sm text-slate-500 mt-1">Review, filter, and manage maritime candidate applications.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search candidate..." 
                  
                  className="w-64 h-11 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm transition-all leading-normal"
                />
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------------- */}
          {/* FILTER CONTROLS */}
          {/* ----------------------------------------------------------------------------- */}
          <div className="flex flex-wrap items-center gap-3 mt-4 mb-8">
            
            <div className="relative">
              <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="appearance-none rounded-xl border border-[#E7EAF1] bg-white py-2 pl-9 pr-8 text-xs font-bold text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm"
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
              </select>
            </div>

            <div className="relative">
              <Anchor className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
                className="appearance-none rounded-xl border border-[#E7EAF1] bg-white py-2 pl-9 pr-8 text-xs font-bold text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm max-w-[200px] truncate"
              >
                <option value="all">All Ranks</option>
                {uniqueRanks.map((rank) => (<option key={rank} value={rank}>{rank}</option>))}
              </select>
            </div>

            <div className="relative">
              <Ship className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                value={vesselFilter}
                onChange={(e) => setVesselFilter(e.target.value)}
                className="appearance-none rounded-xl border border-[#E7EAF1] bg-white py-2 pl-9 pr-8 text-xs font-bold text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm max-w-[200px] truncate"
              >
                <option value="all">All Vessel Types</option>
                {uniqueVessels.map((vessel) => (<option key={vessel} value={vessel}>{vessel}</option>))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setDepartmentFilter("all");
                  setRankFilter("all");
                  setVesselFilter("all");
                }}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors ml-auto sm:ml-0"
              >
                <FilterX className="h-3.5 w-3.5" /> Clear Filters
              </button>
            )}
          </div>

          {/* LOADING & EMPTY STATES */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 font-bold animate-pulse">
              Loading applications...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white border border-slate-200 rounded-[20px] shadow-sm">
              <p className="font-bold text-lg text-slate-700">No applications found.</p>
              <p className="text-sm">Try adjusting your filters or wait for new applications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* HORIZONTAL CARDS LIST */}
              {filteredApplications.map((app) => {
                const match = getMockMatchScore(app.application_id);
                const isProcessed = app.status && app.status.toLowerCase() !== 'applied';
                
                return (
                  <div key={app.application_id} className="group bg-white border border-slate-200 rounded-[20px] p-5 md:p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col xl:flex-row items-start xl:items-center gap-6 relative overflow-hidden">
                    
                    {/* Left Accent Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      app.status === 'shortlisted' ? 'bg-purple-500' :
                      app.status === 'selected' ? 'bg-emerald-500' :
                      app.status === 'rejected' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />

                    {/* 1. CANDIDATE PROFILE (Left) */}
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
                      <div className="flex items-center gap-3">
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${match.score >= 90 ? 'bg-emerald-500' : match.score >= 70 ? 'bg-blue-500' : 'bg-red-500'}`}
                            style={{ width: `${match.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-black text-slate-900">{match.score}%</span>
                      </div>
                    </div>

                    {/* 4. ACTIONS & STATUS BADGE (Right) */}
                    <div className="w-full xl:w-[20%] flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0 gap-3 ml-auto">
                      
                      {!isProcessed ? (
                        <div className="flex gap-2 w-full xl:w-auto">
                          <button
                            onClick={() => handleStatusChange(app.application_id, 'shortlisted')}
                            className="flex-1 xl:flex-none px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition-colors shadow-sm text-center"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleStatusChange(app.application_id, 'rejected')}
                            className="flex-1 xl:flex-none px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200 transition-colors shadow-sm text-center"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                            app.status === 'shortlisted' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            app.status === 'selected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              app.status === 'shortlisted' ? 'bg-purple-500' :
                              app.status === 'selected' ? 'bg-emerald-500' :
                              'bg-red-500'
                            }`} />
                            {app.status}
                          </span>
                          {/* HR Undo safety net */}
                          <button onClick={() => handleStatusChange(app.application_id, 'applied')} className="text-[10px] text-slate-400 hover:text-blue-600 underline px-1">
                            Undo Action
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-medium text-slate-400 hidden xl:block">
                          Applied: {new Date(app.created_at).toLocaleDateString()}
                        </p>
                        <Link href={`/employer/dashboard/candidates/${app.candidate_id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="View Application">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* REAL PAGINATION CONTROL */}
          {!isLoading && filteredApplications.length > 0 && (
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
                
                <div className="hidden sm:flex items-center gap-1.5">
                  {getPageNumbers().map((num, idx) => (
                    num === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-2 text-slate-400 font-bold tracking-widest">...</span>
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
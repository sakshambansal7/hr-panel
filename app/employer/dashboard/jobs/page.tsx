// app/employer/dashboard/jobs/page.tsx

"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  CirclePlus, Search, FileText, Calendar, 
  DollarSign, Clock, Ship, Briefcase, 
  Users, CheckCircle2, XCircle, Anchor, FilterX
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
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
  if (!str || str.toLowerCase() === 'n/a') return "Unspecified";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractArray(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.items && Array.isArray(payload.items)) return payload.items; 
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  if (payload.data?.data && Array.isArray(payload.data.data)) return payload.data.data;
  if (payload.data?.items && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
}

// 🚀 SEARCHABLE SELECT COMPONENT TO PREVENT MISSPELLINGS
function SearchableSelect({
  options, value, onChange, placeholder, icon: Icon
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-auto min-w-[200px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left rounded-xl border border-[#E7EAF1] bg-white px-4 py-2 pl-9 pr-8 text-xs font-bold flex items-center justify-between focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
      >
        {Icon && <Icon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />}
        <span className={`truncate ${selectedOption ? "text-slate-600" : "text-slate-500 font-medium"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col max-h-64">
          <div className="p-2 border-b border-slate-100 bg-slate-50 shrink-0">
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Type to search..." 
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm" 
              autoFocus 
            />
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            <button 
              type="button" 
              onClick={() => { onChange("all"); setIsOpen(false); setSearch(""); }} 
              className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-blue-50 ${value === "all" ? "bg-blue-50 font-bold text-blue-900" : "font-semibold text-slate-700"}`}
            >
              All Options
            </button>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button 
                  key={opt.value} 
                  type="button" 
                  onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(""); }} 
                  className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-blue-50 ${value === opt.value ? "bg-blue-50 font-bold text-blue-900" : "font-semibold text-slate-700"}`}
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <div className="p-4 text-xs text-center text-slate-400 font-medium">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default function JobsClient() {
  const [tab, setTab] = useState<string>("all");
  const [query, setQuery] = useState("");
  
  // Filter States
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [rankFilter, setRankFilter] = useState<string>("all");
  const [vesselFilter, setVesselFilter] = useState<string>("all");

  const [refreshTick, setRefreshTick] = useState(0);
  const [rawJobs, setRawJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 PAGINATION STATES
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 30; // Max 30 jobs per fetch to maintain high performance

  // 🚀 SMART SERVER-SIDE FETCH
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const res = await api.get(`/hr/jobs`, {
        params: {
          page: page,
          limit: limit,
          status: tab !== "all" ? tab : undefined,
          department: departmentFilter !== "all" ? departmentFilter : undefined,
          rank: rankFilter !== "all" ? rankFilter : undefined,
          vessel_type: vesselFilter !== "all" ? vesselFilter : undefined,
          search: query.trim() || undefined 
        }
      });
      
      const payload = res.data?.data || res.data;
      const jobsData = extractArray(payload);
      setRawJobs(jobsData);
      
      if (payload?.pagination) {
        setTotalPages(payload.pagination.totalPages || 1);
        setTotalItems(payload.pagination.total || jobsData.length);
      } else {
        setTotalPages(1);
        setTotalItems(jobsData.length);
      }
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, tab, departmentFilter, rankFilter, vesselFilter, query, refreshTick]);

  // 🚀 DEBOUNCED EFFECT (Waits 400ms after user stops typing before making API call)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 400); 
    
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const refresh = () => setRefreshTick((t) => t + 1);

  const jobs = useMemo(() => {
    return rawJobs.map((j) => {
      let status = j.job_status?.toLowerCase() === "closed" ? "closed" : "active";
      const specs = j.position_specifics || "";
      const titleMatch = specs.match(/Title:\s([^|]+)/);
      const joinMatch = specs.match(/Joining:\s([^|]+)/);
      const salMatch = specs.match(/Salary:\s([^|]+)/);

      const safeRank = j.job_rank || j.rank || j.position || "Unspecified Rank";

      return {
        id: String(j.job_id || j.id),
        status,
        postedAt: j.created_at ? new Date(j.created_at).toLocaleDateString() : "N/A",
        title: titleMatch ? titleMatch[1].trim() : formatTitleCase(safeRank),
        rank: formatTitleCase(safeRank),
        department: formatTitleCase(j.department),
        vesselType: formatTitleCase(j.vessel_type || j.ship_type),
        joiningDate: joinMatch ? joinMatch[1].trim() : "TBD", 
        salary: salMatch ? salMatch[1].trim() : "Negotiable",
        contract: j.contract || "Standard Terms",
        applicationCount: Number(j.application_count) || 0,
        newCount: Number(j.applied_count) || 0,
      };
    });
  }, [rawJobs]);

  // Dynamic Options Extracted from current dataset
  const uniqueDepartments = useMemo(() => Array.from(new Set(jobs.map(j => j.department))).sort(), [jobs]);
  const uniqueRanks = useMemo(() => Array.from(new Set(jobs.map(j => j.rank))).sort(), [jobs]);
  const uniqueVessels = useMemo(() => Array.from(new Set(jobs.map(j => j.vesselType))).sort(), [jobs]);

  const updateJobStatus = async (id: string, newStatus: "active" | "closed") => {
    try {
      setRawJobs(prev => prev.map(job => 
        String(job.job_id || job.id) === id ? { ...job, job_status: newStatus } : job
      ));
      await api.patch(`/jobs/${id}/status`, { status: newStatus });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update job status.");
      refresh();
    }
  };

  const hasActiveFilters = departmentFilter !== "all" || rankFilter !== "all" || vesselFilter !== "all";

  // PAGINATION UI LOGIC
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
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

      {/* --- TOP CONTROLS: Tabs & Search --- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6">
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[#E7EAF1] bg-white p-1.5 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setPage(1); }} 
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
            onChange={(e) => { setQuery(e.target.value); setPage(1); }} 
            placeholder="Search across all pages..."
            className="w-full rounded-2xl border border-[#E7EAF1] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F1E35] placeholder:text-slate-400 focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10 sm:w-72 shadow-sm"
          />
        </div>
      </div>

      {/* --- SECONDARY CONTROLS: Smart Searchable Dropdown Filters --- */}
      <div className="flex flex-wrap items-center gap-3 mt-4 z-10">
        
        <SearchableSelect 
          placeholder="All Departments" 
          icon={Briefcase}
          options={uniqueDepartments.map(d => ({ label: d, value: d }))} 
          value={departmentFilter} 
          onChange={(val) => { setDepartmentFilter(val); setPage(1); }} 
        />

        <SearchableSelect 
          placeholder="All Ranks" 
          icon={Anchor}
          options={uniqueRanks.map(r => ({ label: r, value: r }))} 
          value={rankFilter} 
          onChange={(val) => { setRankFilter(val); setPage(1); }} 
        />

        <SearchableSelect 
          placeholder="All Vessel Types" 
          icon={Ship}
          options={uniqueVessels.map(v => ({ label: v, value: v }))} 
          value={vesselFilter} 
          onChange={(val) => { setVesselFilter(val); setPage(1); }} 
        />

        {hasActiveFilters && (
          <button
            onClick={() => {
              setDepartmentFilter("all");
              setRankFilter("all");
              setVesselFilter("all");
              setPage(1);
            }}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors ml-auto sm:ml-0 shadow-sm"
          >
            <FilterX className="h-3.5 w-3.5" /> Clear Filters
          </button>
        )}
      </div>

      <div className="space-y-4 mt-6">
        {isLoading && (
          <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm font-medium text-slate-400 animate-pulse">
            Syncing jobs from database...
          </div>
        )}

        {!isLoading && jobs.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm text-slate-400">
            No jobs match your current filters. Try searching with different keywords.
          </div>
        )}

        {!isLoading && jobs.map((job, i) => {
          const isClosed = job.status === 'closed';

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              className={`rounded-[20px] border bg-white p-5 lg:p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)] transition-all ${isClosed ? 'border-slate-200 opacity-80 bg-slate-50/50' : 'border-[#E7EAF1] hover:border-slate-300 hover:shadow-md'}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* LEFT: Job Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${STATUS_BADGE[job.status] || STATUS_BADGE["active"]}`}>
                      {isClosed ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {STATUS_LABELS[job.status] || job.status}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <Calendar className="w-3.5 h-3.5" /> Posted {job.postedAt}
                    </span>
                  </div>
                  
                  <h3 className={`text-lg font-extrabold truncate mb-3 ${isClosed ? 'text-slate-500 line-through decoration-slate-300' : 'text-[#0F1E35]'}`}>
                    {job.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 border border-slate-200/60">
                      <Anchor className="w-3.5 h-3.5 text-slate-400" /> {job.rank}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 border border-slate-200/60">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.department}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 border border-slate-200/60">
                      <Ship className="w-3.5 h-3.5 text-slate-400" /> {job.vesselType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#F5B61A]" /> {job.contract}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" /> Joining: {job.joiningDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#0E8B61]" /> {job.salary}
                    </span>
                  </div>
                </div>

                {/* CENTER: Applicant Stats Widget */}
                <div className="flex items-center justify-center shrink-0 lg:px-6 lg:border-x lg:border-[#E7EAF1] lg:border-dashed py-2">
                  <Link 
                    href={`/employer/dashboard/jobs/${job.id}`}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all w-full sm:w-auto min-w-[140px] ${isClosed ? 'bg-slate-100 border-slate-200' : 'bg-[#F8FAFC] border-[#E7EAF1] hover:bg-blue-50 hover:border-blue-200'}`}
                  >
                    <div className="flex items-end gap-2">
                      <span className={`text-3xl font-black leading-none ${isClosed ? 'text-slate-400' : 'text-[#0F1E35]'}`}>
                        {job.applicationCount}
                      </span>
                      {job.newCount > 0 && !isClosed && (
                        <span className="flex items-center justify-center h-5 px-1.5 rounded-md bg-[#F5B61A] text-[10px] font-black text-[#0F1E35] mb-1 animate-pulse">
                          +{job.newCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">
                      Applicants
                    </span>
                  </Link>
                </div>

                {/* RIGHT: Actions */}
                <div className="flex flex-row items-center gap-3 w-full lg:flex-1 lg:justify-end shrink-0 mt-4 lg:mt-0">
                  <Link
                    href={`/employer/dashboard/jobs/${job.id}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0F1E35] px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 shadow-sm"
                  >
                    <Users className="h-4 w-4" /> Manage
                  </Link>

                  {job.status === "active" ? (
                    <button 
                      onClick={() => {
                        if (window.confirm("Are you sure you want to close this job? New candidates will no longer be able to apply.")) {
                          updateJobStatus(job.id, "closed");
                        }
                      }} 
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 shadow-sm"
                    >
                      <XCircle className="h-4 w-4" /> Close Job
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateJobStatus(job.id, "active")} 
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-800 shadow-sm"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Reopen Job
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 🚀 PAGINATION UI COMPONENT */}
      {!isLoading && jobs.length > 0 && (
        <div className="flex items-center justify-between mt-8 p-4 bg-white border border-[#E7EAF1] rounded-[20px] shadow-sm flex-wrap gap-4">
          <span className="text-sm text-slate-500 font-medium">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} jobs
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

    </DashboardShell>
  );
}
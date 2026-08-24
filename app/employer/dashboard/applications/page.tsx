// app/employer/dashboard/applications/page.tsx


"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import api from "../../../lib/api";

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-zinc-100 text-zinc-700 border-zinc-200",
  shortlisted: "bg-blue-50 text-blue-700 border-blue-200",
  interviewed: "bg-purple-50 text-purple-700 border-purple-200",
  selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const PIPELINE_STATUSES = ["applied", "shortlisted", "interviewed", "selected", "rejected"];

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}


// 🚀 UNIVERSAL DATA EXTRACTOR (Updated to catch "items")
function extractArray(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  if (payload.data?.data && Array.isArray(payload.data.data)) return payload.data.data;
  if (payload.data?.items && Array.isArray(payload.data.items)) return payload.data.items; // 🚀 FIXED: Now catches the Postman structure!
  
  if (typeof payload === 'object') {
    for (const key of Object.keys(payload)) {
      if (Array.isArray(payload[key])) return payload[key];
      if (payload[key]?.data && Array.isArray(payload[key].data)) return payload[key].data;
      if (payload[key]?.items && Array.isArray(payload[key].items)) return payload[key].items;
    }
  }
  return [];
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const appRes = await api.get(`/hr/applications`);
      const extractedApps = extractArray(appRes.data);

      // Keep candidates in the pipeline (INCLUDING 'applied' to see new ones)
      const activePipeline = extractedApps.filter((app: any) => 
        ["applied", "shortlisted", "interviewed", "selected"].includes(app.status?.toLowerCase())
      );

      setApplications(activePipeline);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      setApplications(prev => prev.map(app => 
        (app.application_id === applicationId || app.id === applicationId) 
          ? { ...app, status: newStatus } 
          : app
      ).filter(app => ["applied", "shortlisted", "interviewed", "selected"].includes(app.status?.toLowerCase())));
      
      await api.patch(`/hr/applications/${applicationId}/status`, { status: newStatus });
    } catch (err: any) {
      alert("Failed to update candidate status.");
      fetchApplications(); 
    }
  };

  return (
    <DashboardShell pageTitle="Global Applications">
      <div className="mb-6 space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
          Hiring Pipeline
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
          Global Applications
        </h1>
        <p className="text-sm text-slate-500">
          Candidates who have applied, been shortlisted, interviewed, or selected across all your jobs.
        </p>
      </div>

      <div className="rounded-[20px] border border-[#E7EAF1] bg-white shadow-[0_1px_2px_rgba(15,30,53,0.04)] overflow-hidden">
        {isLoading ? (
           <div className="p-12 text-center text-sm font-bold text-slate-400 animate-pulse">
             Loading Candidates...
           </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-sm font-medium text-slate-400">
            No active candidates found. When seafarers apply to your jobs, they will appear here!
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
                {applications.map((app) => (
                  <tr key={app.application_id || app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0F1E35]">{formatTitleCase(app.candidate_name)}</p>
                      <Link href={`/employer/dashboard/candidates/${app.candidate_id}`} className="text-xs font-bold text-blue-600 hover:underline mt-0.5 inline-block">
                        View Profile &rarr;
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700">{formatTitleCase(app.rank)}</p>
                      <p className="text-xs text-slate-500">{formatTitleCase(app.vessel_type)}</p>
                    </td>
                    <td className="px-6 py-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {app.candidate_email}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {app.phone_number || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={app.status?.toLowerCase()}
                        onChange={(e) => handleStatusChange(app.application_id || app.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border focus:outline-none cursor-pointer ${STATUS_COLORS[app.status?.toLowerCase()] || STATUS_COLORS.applied}`}
                      >
                        {PIPELINE_STATUSES.map(s => (
                          <option key={s} value={s} className="bg-white text-slate-800 font-medium">
                            {formatTitleCase(s)}
                          </option>
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
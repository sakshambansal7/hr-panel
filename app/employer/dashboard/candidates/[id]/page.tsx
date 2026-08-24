//   app/employer/dashboard/candidates/[id]/page.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, ShieldCheck, Anchor } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";
import api from "../../../../lib/api";

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(name: string = "") {
  if (name) return name.charAt(0).toUpperCase();
  return "U";
}

export default function CandidateProfilePage() {
  // 🚀 FIXED: Using Next.js hook to safely extract the ID
  const params = useParams();
  const candidateId = params?.id as string;
  
  const [candidate, setCandidate] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidate = useCallback(async () => {
    // 🚀 FIXED: Guard clause prevents the API call if the ID isn't ready yet!
    if (!candidateId) return; 

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/hr/candidates/${candidateId}`);
      
      const payload = res.data?.data;
      
      if (!payload || !payload.profile) {
         throw new Error("Profile data is empty.");
      }

      setCandidate(payload.profile);
      setApplications(payload.applications || []);
      
    } catch (err: any) {
      console.error("Failed to fetch candidate profile:", err);
      setError(err.response?.data?.message || "Candidate profile not found or restricted.");
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  if (isLoading) {
    return (
      <DashboardShell pageTitle="Loading Profile...">
        <div className="flex h-64 flex-col items-center justify-center font-bold text-slate-400 animate-pulse">
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-[#0F1E35] animate-spin mb-4"></div>
          Loading Candidate Profile...
        </div>
      </DashboardShell>
    );
  }

  if (error || !candidate) {
    return (
      <DashboardShell pageTitle="Profile Not Found">
         <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
           <div className="rounded-full bg-red-50 p-4">
             <ShieldCheck className="h-8 w-8 text-red-500" />
           </div>
           <p className="text-lg font-bold text-[#0F1E35]">{error || "Candidate profile not found or restricted."}</p>
           <Link href="/employer/dashboard/applications" className="text-sm font-bold text-blue-600 hover:underline">
             &larr; Go Back to Applications
           </Link>
         </div>
      </DashboardShell>
    );
  }

  const fullName = candidate.name || "Unknown Seafarer";
  const latestApp = applications.length > 0 ? applications[0] : null;

  return (
    <DashboardShell pageTitle={`Profile: ${formatTitleCase(fullName)}`}>
      <div className="mb-6">
        <Link href="/employer/dashboard/applications" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0F1E35] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Basic Info (From users table) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#0F1E35] text-3xl font-black text-white shadow-inner">
              {getInitials(fullName)}
            </div>
            <h1 className="text-xl font-extrabold text-[#0F1E35]">{formatTitleCase(fullName)}</h1>
            
            {latestApp && (
               <>
                 <p className="text-sm font-bold text-[#0E8B61] mt-1">{formatTitleCase(latestApp.rank)}</p>
                 <p className="text-xs font-medium text-slate-500 mt-1">
                   {formatTitleCase(latestApp.vessel_type)} · {formatTitleCase(latestApp.department)}
                 </p>
               </>
            )}

            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600 break-all">{candidate.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">{candidate.phone_number || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">Joined {new Date(candidate.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Applications & Future Profile Data */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Applications to Your Company */}
          <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0F1E35]">
              <Anchor className="h-4 w-4 text-[#F5B61A]" /> Applications to Your Company
            </h2>
            
            {applications.length === 0 ? (
               <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs font-medium text-slate-400">
                 No application records found.
               </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-[#0F1E35]">Applied for: {formatTitleCase(app.rank)}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        {formatTitleCase(app.job_type)} · {formatTitleCase(app.ship_type)}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1 ${app.status === 'selected' ? 'bg-[#0E8B61]/10 text-[#0E8B61]' : 'bg-slate-100 text-slate-600'}`}>
                        {app.status}
                      </span>
                      <p className="text-xs font-bold text-slate-400">{new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Placeholder for when we build Candidate Profile System */}
          <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-400">
              Detailed CV, Sea Service, and Certificates will appear here once the Candidate Profile system is built!
            </p>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}
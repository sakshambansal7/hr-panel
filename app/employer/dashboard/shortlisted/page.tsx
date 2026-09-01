
// app/employer/dashboard/shortlisted/page.tsx

// app/employer/dashboard/shortlisted/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  MoreVertical,
  Mail,
  Phone,
  Ship,
  Anchor,
  CheckCircle,
  AlertCircle,
  CalendarCheck,
  XCircle,
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import api from "../../../lib/api";

type Application = {
  application_id: string;
  candidate_id: string | number;
  candidate_name?: string;
  candidate_email?: string;
  phone_number?: string;
  rank?: string;
  job_type?: string;
  department?: string;
  ship_type?: string;
  vessel_type?: string;
  status: string;
  created_at: string;
};

export default function ShortlistedApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchShortlistedApplications = useCallback(async () => {
    try {
      setIsLoading(true);

      // Backend filters only shortlisted applications
      const res = await api.get(
        "/hr/applications?status=shortlisted&limit=1000"
      );

      const payload = res.data?.data || res.data;

      let appsArray: Application[] = [];

      if (payload?.items && Array.isArray(payload.items)) {
        appsArray = payload.items;
      } else if (Array.isArray(payload?.data)) {
        appsArray = payload.data;
      } else if (Array.isArray(payload)) {
        appsArray = payload;
      }

      // Extra frontend safety
      appsArray = appsArray.filter(
        (app) => app.status?.toLowerCase() === "shortlisted"
      );

      setApplications(appsArray);
    } catch (err) {
      console.error("Failed to fetch shortlisted applications", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRejectCandidate = async (applicationId: string) => {
  try {
    setUpdatingId(applicationId);

    await api.patch(
      `/hr/applications/${applicationId}/status`,
      {
        status: "rejected",
      }
    );

    // Remove from shortlisted list
    setApplications((prev) =>
      prev.filter(
        (app) => app.application_id !== applicationId
      )
    );
  } catch (err) {
    console.error("Failed to reject candidate", err);
    alert("Failed to reject candidate. Please try again.");
  } finally {
    setUpdatingId(null);
  }
};

  useEffect(() => {
    fetchShortlistedApplications();
  }, [fetchShortlistedApplications]);

  /**
   * HR is allowed to perform only:
   *
   * shortlisted -> selected
   */
  const handleSelectCandidate = async (applicationId: string) => {
    try {
      setUpdatingId(applicationId);

      await api.patch(`/hr/applications/${applicationId}/status`, {
        status: "selected",
      });

      // Remove from shortlisted list immediately
      setApplications((prev) =>
        prev.filter((app) => app.application_id !== applicationId)
      );
    } catch (err) {
      console.error("Failed to select candidate", err);
      alert("Failed to select candidate. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  /**
   * NOTE:
   * There is intentionally no "Reject" action here.
   *
   * Requirement:
   * HR cannot change shortlisted status except to selected.
   */

  const getMockMatchScore = (id: string | number) => {
    const num =
      typeof id === "number"
        ? id
        : parseInt(String(id).replace(/\D/g, "")) || 85;

    const score = (num % 40) + 60;

    let label = "Fair";

    if (score >= 90) label = "Excellent";
    else if (score >= 70) label = "Good";
    else if (score < 65) label = "Low Match";

    return { score, label };
  };

  const filteredApplications = applications.filter((app) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      app.candidate_name?.toLowerCase().includes(query) ||
      app.candidate_email?.toLowerCase().includes(query) ||
      app.rank?.toLowerCase().includes(query) ||
      app.vessel_type?.toLowerCase().includes(query) ||
      app.ship_type?.toLowerCase().includes(query) ||
      String(app.candidate_id).toLowerCase().includes(query)
    );
  });

  return (
    <DashboardShell pageTitle="Shortlisted Candidates">
      
      <div className="bg-[#F4F7F9] min-h-screen -m-6 p-6">
        
        <div className="max-w-7xl mx-auto w-full">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-[#0F1E35]">
                  Shortlisted Candidates
                </h1>

                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                  {applications.length}
                </span>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Candidates who cleared the initial screening and are ready for
                final selection.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate..."
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-64 shadow-sm transition-all"
              />
            </div>
          </div>

          {/* LOADING */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 font-bold animate-pulse">
              Loading shortlisted candidates...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white border border-slate-200 rounded-[20px] shadow-sm">
              <CheckCircle className="w-10 h-10 text-slate-300 mb-3" />

              <p className="font-bold text-lg text-slate-700">
                No shortlisted candidates
              </p>

              <p className="text-sm text-slate-400">
                Candidates shortlisted during screening will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {filteredApplications.map((app) => {
                const match = getMockMatchScore(app.application_id);

                return (
                  <div
                    key={app.application_id}
                    className="group bg-white border border-slate-200 rounded-[20px] p-5 md:p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 flex flex-col xl:flex-row items-start xl:items-center gap-6 relative overflow-hidden"
                  >

                    {/* LEFT ACCENT */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500" />

                    {/* ================================================= */}
                    {/* 1. CANDIDATE */}
                    {/* ================================================= */}

                    <div className="flex flex-col w-full xl:w-[30%] xl:pl-2">

                      <div className="flex items-center gap-2">

                        <Link
                          href={`/employer/dashboard/candidates/${app.candidate_id}`}
                          className="text-lg font-bold text-[#0F1E35] hover:text-blue-600 transition-colors"
                        >
                          {app.candidate_name || "Unknown Candidate"}
                        </Link>

                        {match.score >= 90 && (
                          <span title="Top Candidate">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                          ID: {app.candidate_id}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">

                        {app.candidate_email && (
                          <a
                            href={`mailto:${app.candidate_email}`}
                            className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            Email
                          </a>
                        )}

                        {app.phone_number && (
                          <a
                            href={`tel:${app.phone_number}`}
                            className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            Call
                          </a>
                        )}
                      </div>
                    </div>

                    {/* ================================================= */}
                    {/* 2. JOB DETAILS */}
                    {/* ================================================= */}

                    <div className="w-full xl:w-[25%] flex flex-col justify-center border-l-0 xl:border-l border-slate-100 xl:pl-6">

                      <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                        Applied Position
                      </p>

                      <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                        <Anchor className="w-4 h-4 text-blue-500" />

                        {app.rank ||
                          app.job_type ||
                          "Unspecified Role"}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Ship className="w-3.5 h-3.5" />

                        {app.department ||
                          app.vessel_type ||
                          app.ship_type ||
                          "Unspecified Dept"}
                      </div>
                    </div>

                    {/* ================================================= */}
                    {/* 3. READINESS MATCH */}
                    {/* ================================================= */}

                    <div className="w-full xl:w-[25%] flex flex-col justify-center border-l-0 xl:border-l border-slate-100 xl:pl-6">

                      <div className="flex items-center justify-between mb-2">

                        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                          Readiness Match
                        </p>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold
                          ${
                            match.score >= 90
                              ? "bg-emerald-50 text-emerald-700"
                              : match.score >= 70
                              ? "bg-blue-50 text-blue-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {match.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">

                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">

                          <div
                            className={`h-full rounded-full
                            ${
                              match.score >= 90
                                ? "bg-emerald-500"
                                : match.score >= 70
                                ? "bg-blue-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${match.score}%`,
                            }}
                          />

                        </div>

                        <span className="text-sm font-black text-slate-900">
                          {match.score}%
                        </span>
                      </div>

                      {match.score < 70 && (
                        <div className="flex items-start gap-1.5 mt-2 text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-100">

                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />

                          <span className="text-[10px] font-semibold leading-tight">
                            Missing documentation
                          </span>

                        </div>
                      )}
                    </div>

                    {/* ================================================= */}
                    {/* 4. STATUS + ACTIONS */}
                    {/* ================================================= */}

                   {/* ================================================= */}
{/* 4. STATUS + ACTIONS */}
{/* ================================================= */}

<div className="w-full xl:w-[20%] flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0 gap-3 ml-auto">

  <div className="flex items-center gap-2">

    {/* Current Status */}
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold uppercase tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
      Shortlisted
    </span>

    {/* Applied Date */}
    <p className="text-[10px] font-medium text-slate-400 hidden xl:block">
      Applied: {new Date(app.created_at).toLocaleDateString()}
    </p>

  </div>


  <div className="flex items-center gap-2">

    {/* VIEW PROFILE */}
    
     
   

    {/* SELECT */}
    <button
      onClick={() =>
        handleSelectCandidate(app.application_id)
      }
      disabled={updatingId === app.application_id}
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <CheckCircle className="w-3.5 h-3.5" />

      {updatingId === app.application_id
        ? "Selecting..."
        : "Select"}
    </button>

    {/* REJECT */}
    <button
      onClick={() =>
        handleRejectCandidate(app.application_id)
      }
      disabled={updatingId === app.application_id}
      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 hover:border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <XCircle className="w-3.5 h-3.5" />
      Reject
    </button>

    {/* MORE */}
    <button
      className="p-2 text-slate-400 hover:text-[#0F1E35] hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
      title="More options"
    >
      <MoreVertical className="w-4 h-4" />
    </button>

  </div>
  
</div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
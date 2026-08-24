
// app/employer/dashboard/interviews/InterviewsClient.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Video } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import api from "../../../lib/api";

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(name: string) {
  if (!name) return "U";
  return name.substring(0, 1).toUpperCase();
}

export default function InterviewsClient() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get("/hr/interviews");
        
        let data = res.data?.data;
        if (data && Array.isArray(data.data)) data = data.data;
        else if (!Array.isArray(data)) data = [];

        setInterviews(data);
      } catch (err) {
        console.error("Failed to fetch interviews", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <DashboardShell pageTitle="Interviews">
      <div className="mb-6 space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
          Hiring Pipeline
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
          Upcoming Interviews
        </h1>
        <p className="text-sm text-slate-500">Interviews scheduled with candidates across your job postings.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-12 text-center text-sm font-bold text-slate-400 animate-pulse">
            Loading scheduled interviews...
          </div>
        ) : interviews.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-12 text-center text-sm font-medium text-slate-400">
            You have no upcoming interviews scheduled.
          </div>
        ) : (
          interviews.map((interview) => {
            const dateObj = new Date(interview.scheduled_at);
            const isToday = dateObj.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={interview.interview_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0F1E35] text-lg font-bold text-white shadow-inner">
                    {getInitials(interview.candidate_name)}
                  </div>
                  <div>
                    <Link href={`/employer/dashboard/candidates/${interview.candidate_id}`} className="text-sm font-bold text-[#0F1E35] hover:underline">
                      {formatTitleCase(interview.candidate_name)}
                    </Link>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {formatTitleCase(interview.rank)} · {formatTitleCase(interview.job_type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:justify-end">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {isToday ? <span className="text-[#0E8B61]">Today</span> : dateObj.toLocaleDateString()} 
                    <span className="text-slate-300">|</span> 
                    {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-100">
                    <Video className="h-3.5 w-3.5" /> Online
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardShell>
  );
}
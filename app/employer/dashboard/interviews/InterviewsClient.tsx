"use client";

import { motion } from "framer-motion";
import { Calendar, Video, Phone, MapPin } from "lucide-react";
import DashboardShell from "../components/DashboardShell";

type Interview = {
  id: string;
  candidateName: string;
  jobRank: string;
  date: string;
  time: string;
  mode: "Zoom" | "Phone" | "In-person";
};

const INTERVIEWS: Interview[] = [
  {
    id: "iv-1",
    candidateName: "Captain John",
    jobRank: "Chief Officer",
    date: "Today",
    time: "10:00 AM",
    mode: "Zoom",
  },
  {
    id: "iv-2",
    candidateName: "Rajesh Kumar",
    jobRank: "AB",
    date: "18 Jul 2026",
    time: "3:30 PM",
    mode: "Phone",
  },
];

const MODE_ICON = { Zoom: Video, Phone: Phone, "In-person": MapPin };

export default function InterviewsClient() {
  return (
    <DashboardShell pageTitle="Interviews">
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
          Hiring Pipeline
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
          Upcoming Interviews
        </h1>
        <p className="text-sm text-slate-500">
          Interviews scheduled with candidates across your job postings.
        </p>
      </div>

      <div className="space-y-3">
        {INTERVIEWS.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm text-slate-400">
            No interviews scheduled yet.
          </div>
        )}

        {INTERVIEWS.map((iv, i) => {
          const ModeIcon = MODE_ICON[iv.mode];
          return (
            <motion.div
              key={iv.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F1E35] text-sm font-bold text-white">
                  {iv.candidateName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-bold text-[#0F1E35]">{iv.candidateName}</p>
                  <p className="text-xs text-slate-500">{iv.jobRank}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                  {iv.date} · {iv.time}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                  <ModeIcon className="h-3 w-3" strokeWidth={2.5} />
                  {iv.mode}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}

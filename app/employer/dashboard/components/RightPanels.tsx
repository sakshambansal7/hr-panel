"use client";

import { motion } from "framer-motion";
import { ChevronDown, Video, Sparkles, ArrowRight } from "lucide-react";

const PIPELINE = [
  { label: "Applications", value: 20 },
  { label: "Reviewed", value: 15 },
  { label: "Interview", value: 8 },
  { label: "Selected", value: 3 },
  { label: "Joined", value: 1 },
];

const NOTIFICATIONS = [
  "New application received.",
  "ETO Candidate accepted interview.",
  "Subscription renewed.",
  "3 profiles matched.",
  "Company verification approved.",
];

const ACTIVITY = [
  { title: "Job Posted", detail: "Chief Officer", time: "2 mins ago" },
  { title: "Application Received", detail: "AB Candidate", time: "15 mins ago" },
  { title: "Interview Scheduled", detail: "Second Engineer", time: "1 hour ago" },
];

const AI_SUGGESTIONS = [
  "12 matching candidates",
  "3 inactive jobs",
  "Renew subscription",
  "Complete company profile",
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)]">
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function HiringPipeline() {
  const max = PIPELINE[0].value;
  return (
    <Panel title="Hiring Pipeline">
      <div className="space-y-3">
        {PIPELINE.map((step, i) => (
          <div key={step.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0F1E35]">{step.label}</span>
              <span className="font-bold text-[#0F1E35]">{step.value}</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step.value / max) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                className="h-full rounded-full bg-[#F5B61A]"
              />
            </div>
            {i < PIPELINE.length - 1 && (
              <div className="flex justify-center py-0.5">
                <ChevronDown className="h-3 w-3 text-slate-300" strokeWidth={2} />
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function UpcomingInterviews() {
  return (
    <Panel title="Upcoming Interviews">
      <div className="rounded-2xl border border-[#E7EAF1] bg-[#F8FAFC] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#0E8B61]">
            Today
          </span>
          <span className="text-xs font-bold text-[#0F1E35]">10:00 AM</span>
        </div>
        <p className="mt-2 text-sm font-bold text-[#0F1E35]">Captain John</p>
        <p className="text-xs text-slate-500">Chief Officer</p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
          <Video className="h-3 w-3" strokeWidth={2.5} />
          Zoom
        </span>
      </div>
    </Panel>
  );
}

function Notifications() {
  return (
    <Panel title="Notifications">
      <ul className="space-y-3">
        {NOTIFICATIONS.map((n) => (
          <li key={n} className="flex items-start gap-2.5 text-xs text-slate-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5B61A]" />
            {n}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function RecentActivity() {
  return (
    <Panel title="Recent Activity">
      <ol className="relative space-y-5 border-l border-[#E7EAF1] pl-4">
        {ACTIVITY.map((a) => (
          <li key={a.title} className="relative">
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#0F1E35] ring-2 ring-[#E7EAF1]" />
            <p className="text-xs font-bold text-[#0F1E35]">{a.title}</p>
            <p className="text-xs text-slate-500">{a.detail}</p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-400">{a.time}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function AIAssistant() {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-[20px] border border-[#E7EAF1] bg-linear-to-br from-[#0F1E35] to-[#16294A] p-5 text-white shadow-[0_12px_24px_rgba(15,30,53,0.15)]"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#F5B61A]" strokeWidth={2} />
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-200">
          AI Hiring Assistant
        </h3>
      </div>
      <ul className="mt-3 space-y-1.5">
        {AI_SUGGESTIONS.map((s) => (
          <li key={s} className="flex items-center gap-2 text-xs text-slate-300">
            <span className="h-1 w-1 rounded-full bg-[#F5B61A]" />
            {s}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#F5B61A] px-3.5 py-2 text-xs font-bold text-[#0F1E35] transition-all hover:brightness-95 active:scale-[0.98]"
      >
        View Suggestions
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

export default function RightPanels() {
  return (
    <div className="space-y-4">
      <HiringPipeline />
      <UpcomingInterviews />
      <Notifications />
      <RecentActivity />
      <AIAssistant />
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  FilePlus2,
  BookmarkCheck,
  PhoneCall,
  UserCheck,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import CountUp from "./CountUp";

type StatCard = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "gold" | "green";
};

const STATS: StatCard[] = [
  { label: "Active Jobs", value: 10, icon: Briefcase },
  { label: "Applications", value: 10, icon: FileText },
  { label: "New Applications", value: 9, icon: FilePlus2 },
  { label: "Shortlisted", value: 1, icon: BookmarkCheck },
  { label: "Contacted", value: 0, icon: PhoneCall },
  { label: "Joined", value: 0, icon: UserCheck },
  { label: "Company Verification", value: "Verified", icon: ShieldCheck, accent: "gold" },
  { label: "Smart Credits", value: 16, icon: Zap, accent: "green" },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {STATS.map((stat, i) => {
        const Icon = stat.icon;
        const iconWrapClass =
          stat.accent === "gold"
            ? "bg-[#F5B61A]/15 text-[#946200]"
            : stat.accent === "green"
              ? "bg-[#0E8B61]/10 text-[#0E8B61]"
              : "bg-[#0F1E35]/5 text-[#0F1E35]";

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            whileHover={{ y: -4 }}
            className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_24px_rgba(15,30,53,0.08)]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconWrapClass}`}>
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <p className="mt-4 text-2xl font-extrabold tracking-tight text-[#0F1E35]">
              <CountUp value={stat.value} />
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

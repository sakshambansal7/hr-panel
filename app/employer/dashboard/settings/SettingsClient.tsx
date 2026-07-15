"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Users, Bell, CreditCard, ChevronRight, type LucideIcon } from "lucide-react";
import DashboardShell from "../components/DashboardShell";

type SettingRow = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  comingSoon?: boolean;
};

const ROWS: SettingRow[] = [
  {
    title: "Company Account",
    description: "Manage your organisation profile and verification details.",
    icon: Building2,
  },
  {
    title: "HR Team Members",
    description: "Invite recruiters and viewers. Team collaboration coming soon.",
    icon: Users,
    comingSoon: true,
  },
  {
    title: "Notification Preferences",
    description: "Choose email, website and WhatsApp channels.",
    icon: Bell,
    comingSoon: true,
  },
  {
    title: "Billing & Plans",
    description: "Manage your yearly plan and Smart Sourcing credits.",
    icon: CreditCard,
    href: "/employer/dashboard/billing",
  },
];

export default function SettingsClient() {
  return (
    <DashboardShell pageTitle="Settings">
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
          Settings
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
          Account &amp; Team Settings
        </h1>
      </div>

      <div className="space-y-3">
        {ROWS.map((row, i) => {
          const Icon = row.icon;
          const content = (
            <>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F1E35]/5 text-[#0F1E35]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0F1E35]">{row.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{row.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {row.comingSoon && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Coming soon
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-slate-300" strokeWidth={2} />
              </div>
            </>
          );

          const className =
            "group flex w-full items-center justify-between gap-4 rounded-[20px] border border-[#E7EAF1] bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,30,53,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_24px_rgba(15,30,53,0.08)]";

          return (
            <motion.div
              key={row.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              {row.href ? (
                <Link href={row.href} className={className}>
                  {content}
                </Link>
              ) : (
                <button type="button" className={className}>
                  {content}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}

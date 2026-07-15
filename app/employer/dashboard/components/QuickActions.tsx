"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CirclePlus,
  Users,
  FileText,
  Search,
  Building2,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const ACTIONS: { title: string; icon: LucideIcon; href: string }[] = [
  { title: "Post Job", icon: CirclePlus, href: "/employer/dashboard/post-job" },
  { title: "Talent Database", icon: Users, href: "/employer/dashboard/talent" },
  { title: "Applications", icon: FileText, href: "/employer/dashboard/applications" },
  { title: "Search Seafarers", icon: Search, href: "/employer/dashboard/smart-sourcing" },
  { title: "Company Profile", icon: Building2, href: "/employer/dashboard/company" },
  { title: "Buy Credits", icon: Wallet, href: "/employer/dashboard/billing" },
];

export default function QuickActions() {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={action.href}
                className="flex flex-col items-start gap-3 rounded-2xl border border-[#E7EAF1] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_24px_rgba(15,30,53,0.08)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F1E35]/5 text-[#0F1E35]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <span className="text-sm font-bold text-[#0F1E35]">{action.title}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

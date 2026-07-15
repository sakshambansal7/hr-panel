"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Zap, Bell, CircleHelp, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

type TopbarProps = {
  pageTitle: string;
  displayName: string;
  credits: number;
  onMenuClick: () => void;
  onLogout: () => void;
};

export default function Topbar({ pageTitle, displayName, credits, onMenuClick, onLogout }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-[#E7EAF1] bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
        <h1 className="text-base font-bold text-[#0F1E35] sm:text-lg">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-[#E7EAF1] bg-[#F5B61A]/10 px-3 py-2 text-xs font-bold text-[#946200] sm:flex">
          <Zap className="h-3.5 w-3.5 fill-[#F5B61A] text-[#F5B61A]" strokeWidth={0} />
          {credits} Credits
        </span>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#F5B61A]" />
        </button>

        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 sm:flex"
          title="Help"
        >
          <CircleHelp className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>

        <Link
          href="/employer/dashboard/post-job"
          className="hidden items-center gap-2 rounded-xl bg-[#F5B61A] px-4 py-2.5 text-xs font-bold text-[#0F1E35] shadow-sm shadow-[#F5B61A]/30 transition-all hover:brightness-95 sm:flex"
        >
          Post Job
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full p-1 pr-1.5 transition-colors hover:bg-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F1E35] text-xs font-bold text-white">
              {initial}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" strokeWidth={2} />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[calc(100%+8px)] z-40 w-48 overflow-hidden rounded-2xl border border-[#E7EAF1] bg-white shadow-lg"
                >
                  <div className="border-b border-[#E7EAF1] px-4 py-3">
                    <p className="truncate text-sm font-bold text-[#0F1E35]">{displayName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2} />
                    Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

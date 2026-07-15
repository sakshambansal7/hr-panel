"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, LogOut, X } from "lucide-react";
import { useState } from "react";
import { NAV_ITEMS, IMPLEMENTED_HREFS } from "../nav-items";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  isVerified: boolean;
  planActive: boolean;
  displayName: string;
  designation: string;
  onLogout: () => void;
};

function SidebarContent({
  pathname,
  companyName,
  isVerified,
  planActive,
  displayName,
  designation,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  companyName: string;
  isVerified: boolean;
  planActive: boolean;
  displayName: string;
  designation: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F1E35]">
            <span className="text-lg leading-none text-[#F5B61A]" aria-hidden="true">
              ⚓
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-[#0F1E35]">
              MND Employer
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Portal
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[#E7EAF1] bg-[#F8FAFC] px-3.5 py-3">
          <p className="truncate text-xs font-bold text-[#0F1E35]">{companyName}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0E8B61]/10 px-2 py-0.5 text-[10px] font-bold text-[#0E8B61]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0E8B61]" aria-hidden="true" />
                VERIFIED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden="true" />
                UNVERIFIED
              </span>
            )}
            {planActive && (
              <span className="inline-flex items-center rounded-full bg-[#F5B61A]/15 px-2 py-0.5 text-[10px] font-bold text-[#946200]">
                PLAN ACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isImplemented = IMPLEMENTED_HREFS.has(item.href);

          const content = (
            <>
              <Icon
                className={`h-[18px] w-[18px] shrink-0 ${
                  isActive ? "text-[#F5B61A]" : "text-slate-400 group-hover:text-slate-600"
                }`}
                strokeWidth={2}
              />
              <span className="truncate">{item.label}</span>
            </>
          );

          const className = `group relative flex h-12 items-center gap-3.5 rounded-full px-3.5 text-sm font-semibold transition-colors duration-200 ${
            isActive
              ? "bg-[#0F1E35] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`;

          return isImplemented ? (
            <Link key={item.label} href={item.href} onClick={onNavigate} className={className}>
              {content}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              title="Coming soon"
              className={className}
            >
              {content}
            </button>
          );
        })}
      </nav>

      {/* Profile footer */}
      <div className="relative border-t border-[#E7EAF1] p-4">
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-[calc(100%+8px)] left-4 right-4 overflow-hidden rounded-2xl border border-[#E7EAF1] bg-white shadow-lg"
            >
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-slate-50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F1E35] text-sm font-bold text-white">
            {initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-[#0F1E35]">{displayName}</span>
            <span className="block truncate text-xs text-slate-400">{designation}</span>
          </span>
          <ShieldCheck className="h-4 w-4 shrink-0 text-slate-300" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({
  isOpen,
  onClose,
  companyName,
  isVerified,
  planActive,
  displayName,
  designation,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-[#E7EAF1] lg:block">
        <SidebarContent
          pathname={pathname}
          companyName={companyName}
          isVerified={isVerified}
          planActive={planActive}
          displayName={displayName}
          designation={designation}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile / tablet drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-[#0F1E35]/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[#E7EAF1] shadow-2xl lg:hidden"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
              <SidebarContent
                pathname={pathname}
                companyName={companyName}
                isVerified={isVerified}
                planActive={planActive}
                displayName={displayName}
                designation={designation}
                onLogout={onLogout}
                onNavigate={onClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

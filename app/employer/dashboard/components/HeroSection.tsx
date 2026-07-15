"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Ship } from "lucide-react";

export default function HeroSection({ displayName }: { displayName: string }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-linear-to-br from-[#0F1E35] to-[#16294A] p-7 sm:p-9">
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#F5B61A]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-blue-400/10 blur-[110px]" />

      {/* Abstract wave */}
      <svg
        className="pointer-events-none absolute bottom-0 right-0 h-40 w-full text-white/5 sm:h-full sm:w-2/3"
        viewBox="0 0 500 300"
        fill="none"
        preserveAspectRatio="xMaxYMax slice"
      >
        <path
          d="M0 220c60 20 120 20 180 0s120-20 180 0 120 20 140 10V300H0Z"
          fill="currentColor"
        />
      </svg>

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-[11px] font-bold tracking-widest text-[#F5B61A] uppercase"
          >
            Welcome, {displayName.split(" ")[0]}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl"
          >
            Hire Verified
            <br />
            Seafarers Faster
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-3 max-w-md text-sm leading-relaxed text-slate-300"
          >
            Post maritime jobs, access verified seafarer profiles, shortlist candidates,
            manage hiring, and recruit faster from one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <Link
              href="/employer/dashboard/post-job"
              className="rounded-2xl bg-[#F5B61A] px-5 py-3 text-sm font-bold text-[#0F1E35] shadow-lg shadow-[#F5B61A]/20 transition-all hover:brightness-95 active:scale-[0.98]"
            >
              Post New Job
            </Link>
            <Link
              href="/employer/dashboard/talent"
              className="rounded-2xl border border-white/25 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Maritime Talent Database
            </Link>
            <Link
              href="/employer/dashboard/applications"
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Applications
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden justify-center lg:flex"
        >
          <div className="flex h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <Ship className="h-16 w-16 text-[#F5B61A]" strokeWidth={1.5} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

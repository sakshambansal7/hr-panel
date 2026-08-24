

// app/employer/dashboard/DashboardClient.tsx


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, FileText, CheckCircle, Users, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import DashboardShell from "./components/DashboardShell";
import api from "../../lib/api";

export default function DashboardClient() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get("/hr/dashboard/overview");
        setStats(res.data?.data || {});
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <DashboardShell pageTitle="Dashboard">
        <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400 animate-pulse">
          Loading Dashboard Analytics...
        </div>
      </DashboardShell>
    );
  }

  // Calculate Pipeline Percentages safely
  const totalApplied = stats?.applied || 0;
  const calcWidth = (val: number) => totalApplied > 0 ? `${Math.max(5, Math.round((val / totalApplied) * 100))}%` : '0%';

  return (
    <DashboardShell pageTitle="Dashboard">
      
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0F1E35] p-8 sm:p-10 shadow-lg mb-8">
        <div className="absolute right-0 top-0 h-[200%] w-[50%] -translate-y-1/4 translate-x-1/4 rounded-full bg-[#1A2D4C] blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F5B61A]">
            Welcome, HR
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            Hire Verified Seafarers Faster
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Post maritime jobs, access verified seafarer profiles, shortlist candidates, manage hiring, and recruit faster from one platform.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/employer/dashboard/post-job"
              className="rounded-full bg-[#F5B61A] px-6 py-2.5 text-xs font-bold text-[#0F1E35] transition-transform hover:scale-105"
            >
              Post New Job
            </Link>
            <Link
              href="/employer/dashboard/applications"
              className="rounded-full border border-slate-500/50 bg-slate-800/50 px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-700/50"
            >
              View Applications
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* 2. CLICKABLE STAT CARDS (Left Side - 2 Columns) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          
          <Link href="/employer/dashboard/jobs" className="group flex flex-col justify-between rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-sm transition-all hover:border-[#F5B61A]/50 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 group-hover:bg-[#F5B61A]/10 group-hover:text-[#F5B61A]">
                <Briefcase className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-[#0F1E35]">{stats?.active_jobs || 0}</p>
              <p className="text-xs font-medium text-slate-500">Active Jobs</p>
            </div>
          </Link>

          <Link href="/employer/dashboard/applications" className="group flex flex-col justify-between rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-sm transition-all hover:border-blue-500/50 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-[#0F1E35]">{stats?.total_applications || 0}</p>
              <p className="text-xs font-medium text-slate-500">Total Applications</p>
            </div>
          </Link>

          <Link href="/employer/dashboard/applications" className="group flex flex-col justify-between rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-sm transition-all hover:border-purple-500/50 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 group-hover:bg-purple-50 group-hover:text-purple-600">
                <Users className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-[#0F1E35]">{stats?.shortlisted || 0}</p>
              <p className="text-xs font-medium text-slate-500">Shortlisted</p>
            </div>
          </Link>

          <Link href="/employer/dashboard/interviews" className="group flex flex-col justify-between rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                <Calendar className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-[#0F1E35]">{stats?.upcoming_interviews || 0}</p>
              <p className="text-xs font-medium text-slate-500">Upcoming Interviews</p>
            </div>
          </Link>

        </div>

        {/* 3. HIRING PIPELINE FUNNEL (Right Side) */}
        <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-sm">
          <h2 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-6">
            Hiring Pipeline
          </h2>
          <div className="space-y-5">
            
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#0F1E35] mb-1.5">
                <span>Applied</span>
                <span>{stats?.applied || 0}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#F5B61A] rounded-full" style={{ width: calcWidth(stats?.applied) }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#0F1E35] mb-1.5">
                <span>Shortlisted</span>
                <span>{stats?.shortlisted || 0}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: calcWidth(stats?.shortlisted) }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#0F1E35] mb-1.5">
                <span>Interviewed</span>
                <span>{stats?.interviewed || 0}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: calcWidth(stats?.interviewed) }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#0F1E35] mb-1.5">
                <span>Selected</span>
                <span>{stats?.selected || 0}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#0E8B61] rounded-full" style={{ width: calcWidth(stats?.selected) }} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
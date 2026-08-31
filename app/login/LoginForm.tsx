"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import api from "../lib/api"; 
import { useAuth } from "../context/auth-context"; // 🚀 Imported useAuth

export default function LoginForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "seeker" ? "seeker" : "employer";

  const router = useRouter();
  // 🚀 Destructured setSessionUser from your context
  const { setSessionUser } = useAuth(); 

  const [role, setRole] = useState<"employer" | "seeker">(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (role === "seeker") {
      window.location.href = "http://localhost:3001/login"; 
    }
  }, [role]);

  // 🚀 FIXED: Added <HTMLFormElement> to resolve the TypeScript deprecation warning
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
        role: "hr" 
      });

      if (response.data?.success || response.status === 200) {
        const token = response.data?.data?.accessToken || response.data?.accessToken;
        
        // Ensure we have a fallback user object if the backend doesn't send one explicitly
        const userData = response.data?.data?.user || response.data?.user || { name: email, email: email, role: "employer" };
        
        if (token) {
          // 🚀 FIXED: Set the user in live React context so the dashboard doesn't kick us out!
          setSessionUser(userData, token);
        }
        
        const next = searchParams.get("next");
        // 🚀 FIXED: Smooth client-side routing instead of a hard reload
        router.push(next || "/employer/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const fillDemoCredentials = () => {
    setEmail("hr@vships.com");
    setPassword("Employer@123");
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#F8FAFC] font-sans antialiased selection:bg-[#FBBF24]/30">
      
      {/* LEFT SECTION */}
      <div className="relative flex w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#13294B] p-8 md:p-12 lg:w-1/2">
        <div className="absolute -left-1/4 -top-1/4 h-[80%] w-[80%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[80%] w-[80%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FBBF24] to-[#FCD34D] shadow-md shadow-[#FBBF24]/20">
              <svg className="h-5 w-5 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v14m0 0l-3-3m3 3l3-3M4 14a8 8 0 0016 0" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-white block">MerchantNavyJobs</span>
              <span className="text-[10px] font-bold tracking-widest text-[#FBBF24] uppercase block">Verified Maritime Hiring</span>
            </div>
          </div>
        </div>

        <div className="relative my-auto flex h-85 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-slate-950/20 md:h-100">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/50" />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0F172A]/80 via-transparent to-[#0F172A]/80" />
          
          <img 
            src="https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcRZWuZQdgwkENAA6UKzqs74YUnMnphBs5viXFjXwIAG2PmJdqnkzO2hLVfGbwMAdJj1fUxdWk9VNtKU_Ho" 
            alt="Modern cargo ship sailing during dusk" 
            className="h-full w-full object-cover opacity-65 mix-blend-luminosity scale-105 transform transition duration-1000 hover:scale-100"
          />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#FBBF24] uppercase">
              For Companies & Recruiters
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Hire verified seafarers faster.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-slate-300">
              Post unlimited jobs, access applied CVs for free, and unlock the Maritime Talent Database with Smart Sourcing.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="group rounded-2xl border border-white/5 bg-white/3 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/6 hover:shadow-lg hover:shadow-amber-500/2">
              <span className="block text-xl font-bold text-[#FBBF24] md:text-2xl">25k+</span>
              <span className="text-[11px] font-medium text-slate-400">Seafarers</span>
            </div>
            
            <div className="group rounded-2xl border border-white/5 bg-white/3 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/6 hover:shadow-lg hover:shadow-amber-500/2">
              <span className="block text-xl font-bold text-white md:text-2xl">₹25k</span>
              <span className="text-[11px] font-medium text-slate-400">Yearly Plan</span>
            </div>

            <div className="group rounded-2xl border border-white/5 bg-white/3 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/6 hover:shadow-lg hover:shadow-amber-500/2">
              <span className="block text-xl font-bold text-white md:text-2xl">3 Tabs</span>
              <span className="text-[11px] font-medium text-slate-400">Talent DB</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 md:px-12 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest text-[#13294B] uppercase block">
              Employer Login
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Sign in as Company
            </h1>
            <p className="text-sm text-slate-500">
              Access your hiring dashboard and Maritime Talent Database.
            </p>
          </div>

          

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Email / Mobile / Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-[#0F172A] placeholder:text-slate-400 transition-all duration-200 focus:border-[#FBBF24] focus:outline-none focus:ring-4 focus:ring-[#FBBF24]/10"
                  placeholder="hr@vships.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-slate-500 hover:text-[#0F172A] hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-[#0F172A] placeholder:text-slate-400 transition-all duration-200 focus:border-[#FBBF24] focus:outline-none focus:ring-4 focus:ring-[#FBBF24]/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] py-3.5 text-sm font-bold text-[#0F172A] shadow-lg shadow-amber-500/10 transition-all duration-300 hover:bg-[#FCD34D] hover:shadow-xl hover:shadow-amber-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In as Company"}
              {!isLoading && <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            New employer?{" "}
            <Link
              href="/signup?role=employer"
              className="font-semibold text-[#0F172A] underline underline-offset-4 hover:text-[#13294B]"
            >
              Create Employer Account
            </Link>
          </p>

         

        </div>
      </div>
    </div>
  );
}
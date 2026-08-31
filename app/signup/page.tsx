// app/signup/page.tsx


"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import api from "../lib/api"; 
import { useAuth } from "../context/auth-context";
import { ChevronDown, Search } from "lucide-react";

function SectionHeading({ title, description }: { title: string; description: string; }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white">
        ✓
      </span>
      <div>
        <h2 className="text-base font-bold text-[#0F172A]">{title}</h2>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode; }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
        {label}
        {required && <span className="ml-0.5 text-[#FBBF24]">*</span>}
      </label>
      {children}
    </div>
  );
}

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const safeOptions = Array.isArray(options) ? options : [];
    if (!query) return safeOptions; 

    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, ''); 
    return safeOptions.filter((opt) => {
      if (!opt) return false;
      return opt.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQuery);
    });
  }, [options, query]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-white py-3.5 px-4 text-sm shadow-sm transition-all duration-200 focus:border-[#FBBF24] focus:outline-none focus:ring-4 focus:ring-[#FBBF24]/20 hover:border-slate-400"
      >
        <span className={value ? "text-slate-900 font-bold" : "text-slate-400 font-medium"}>
          {value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-[100] mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl space-y-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Type to search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FBBF24] focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/30"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto space-y-1 mt-2">
            <button
              type="button"
              onClick={() => { onChange(""); setIsOpen(false); setQuery(""); }}
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              Clear Selection
            </button>
            {filtered.map((opt, index) => (
              <button
                key={`${opt}-${index}`}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false); setQuery(""); }}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                  value === opt ? "bg-amber-100 text-amber-900" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {opt}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-center">
                <p className="text-sm font-semibold text-slate-600">No organizations found.</p>
                <p className="text-xs text-slate-400 mt-1">Try a different spelling or clear the search.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-slate-300 bg-white py-3.5 px-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium shadow-sm transition-all duration-200 focus:border-[#FBBF24] focus:outline-none focus:ring-4 focus:ring-[#FBBF24]/20 hover:border-slate-400";

function SignupFormContent() {
  const router = useRouter();
  const { setSessionUser } = useAuth(); 

  const [isLoading, setIsLoading] = useState(false);

  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const [fullName, setFullName] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpNotice, setOtpNotice] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    api.get("/companies/dropdown?limit=all")
      .then((res) => {
        const payload = res.data?.data;
        const companyArray = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);

        if (companyArray.length > 0) {
          const cleanedCompanies = companyArray.map((c: any) => ({
            id: c.id,
            name: formatTitleCase(c.name || c.company_name || c.email || "Unknown Organization"),
            rawEmail: c.email
          }));

          const sortedCompanies = cleanedCompanies.sort((a: any, b: any) => 
            a.name.localeCompare(b.name)
          );
          
          setAvailableCompanies(sortedCompanies);
        }
      })
      .catch((err) => console.error("Failed to load companies:", err));
  }, []);

  function handleEmailChange(value: string) {
    setOfficialEmail(value);
    setOtpSent(false);
    setOtpValue("");
    setOtpError("");
    setOtpNotice("");
    setEmailVerified(false);
  }

  async function handleSendOtp() {
    setOtpError("");
    setOtpNotice("");

    if (!selectedCompanyId) {
      setOtpError("Please select your company first.");
      return;
    }
    if (!fullName.trim() || !officialEmail.trim() || !mobileNumber.trim() || !password) {
      setOtpError("Please fill out Name, Email, Mobile, and Password before sending OTP.");
      return;
    }
    if (password !== confirmPassword) {
      setOtpError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        name: fullName.trim(),
        email: officialEmail.trim().toLowerCase(),
        phone_number: `+91${mobileNumber.trim()}`, 
        password: password,
        confirmPassword: confirmPassword, 
        company_id: selectedCompanyId, 
      };

      const response = await api.post("auth/hr/send-otp", payload);
      
      if (response.data.success) {
        setOtpSent(true);
        setOtpNotice("Verification code sent! Please check your inbox.");
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendOtp() {
    setOtpError("");
    setOtpNotice("");

    if (!officialEmail.trim()) {
      setOtpError("Please enter your official email first.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/auth/resend-registration-otp", {
        email: officialEmail.trim().toLowerCase(),
      });
      
      if (response.data.success || response.status === 200) {
        setOtpNotice("New verification code sent! Please check your inbox.");
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setOtpError("");
    setOtpNotice("");

    if (!otpValue.trim()) {
      setOtpError("Please enter the OTP.");
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await api.post("auth/hr/verify-otp", { 
        email: officialEmail.trim().toLowerCase(), 
        otp: otpValue.trim() 
      });

      if (data.success) {
        setEmailVerified(true);
        setOtpSent(false);
        if (data.data?.user) {
          setSessionUser(data.data.user, data.data.accessToken);
        }
        setOtpNotice("Email verified successfully! You can now access your dashboard.");
      } else {
        setOtpError(data.message || "Invalid OTP code.");
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCompleteRegistration(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!emailVerified) {
      setError("Please verify your official email with the OTP before continuing.");
      return;
    }

    // Direct redirect to the HR Dashboard
    router.push("/employer/dashboard");
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#F8FAFC] font-sans antialiased selection:bg-[#FBBF24]/30">
       <div className="relative flex w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#13294B] p-8 md:p-12 lg:w-2/5 lg:sticky lg:top-0 lg:h-screen">
        <div className="absolute -left-1/4 -top-1/4 h-[80%] w-[80%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[80%] w-[80%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FBBF24] to-[#FCD34D] shadow-md shadow-[#FBBF24]/20">
            <svg className="h-5 w-5 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v14m0 0l-3-3m3 3l3-3M4 14a8 8 0 0016 0" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight text-white block">MND Jobs Employer Portal</span>
            <span className="text-[10px] font-bold tracking-widest text-[#FBBF24] uppercase block">Verified Maritime Hiring</span>
          </div>
        </div>

        <div className="relative z-10 my-10 space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#FBBF24] uppercase">
            Join Your Organization
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Start hiring verified maritime crew today.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-slate-300">
            Select your registered company, verify your official HR email, and access the hiring pipeline.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="group rounded-2xl border border-white/5 bg-white/3 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-white">Yearly Plan</span>
              <span className="text-lg font-bold text-[#FBBF24]">₹25,000<span className="text-xs font-medium text-slate-400"> / year</span></span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
              {["Unlimited job postings", "Applied CV access included", "Complete hiring pipeline", "Company profile listing"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-[#FBBF24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

       <div className="flex w-full flex-col items-center bg-white px-6 py-12 md:px-12 lg:w-3/5">
        <div className="w-full max-w-2xl space-y-10">
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest text-[#13294B] uppercase block">
              Employer Registration
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Create Employer Account
            </h1>
          </div>

          <form onSubmit={handleCompleteRegistration} className="space-y-10">
            <div className="space-y-5">
              <SectionHeading title="HR / Recruiter Details" description="Select your company and verify your identity." />
              <div className="grid gap-5 sm:grid-cols-2">
                
                <div className="sm:col-span-2 relative z-50">
                  <Field label="Search Your Company" required>
                    <SearchableSelect 
                      options={availableCompanies.map(comp => comp.name)}
                      value={availableCompanies.find(c => c.id.toString() === selectedCompanyId)?.name || ""}
                      onChange={(selectedName: string) => {
                        if (!selectedName) {
                          setSelectedCompanyId("");
                          return;
                        }
                        const comp = availableCompanies.find(c => c.name === selectedName);
                        setSelectedCompanyId(comp ? comp.id.toString() : "");
                      }} 
                      placeholder="-- Type to search your registered organization --"
                    />
                  </Field>
                </div>

                <Field label="Full Name" required>
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Enter your name" />
                </Field>
                <Field label="Mobile Number" required>
                  <input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} className={inputClass} placeholder="9876543210" />
                </Field>
                <Field label="Password" required>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="At least 8 characters" />
                </Field>
                <Field label="Confirm Password" required>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Official Email" required>
                    <div className="flex gap-2">
                      <input type="email" required value={officialEmail} onChange={(e) => handleEmailChange(e.target.value)} className={inputClass} placeholder="hr@company.com" />
                      {!emailVerified && (
                        <button 
                          type="button" 
                          onClick={otpSent ? handleResendOtp : handleSendOtp} 
                          disabled={isLoading} 
                          className="shrink-0 whitespace-nowrap rounded-2xl border border-slate-300 bg-slate-100 px-5 text-xs font-bold text-[#0F172A] transition-colors hover:bg-slate-200 disabled:opacity-50 shadow-sm"
                        >
                          {isLoading ? "Processing..." : otpSent ? "Resend OTP" : "Send OTP"}
                        </button>
                      )}
                      {emailVerified && (
                        <span className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-emerald-50 px-4 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-sm">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Verified
                        </span>
                      )}
                    </div>
                  </Field>
                </div>

                {otpSent && !emailVerified && (
                  <div className="sm:col-span-2 flex items-end gap-2 animate-fade-in">
                    <Field label="Enter OTP">
                      <input value={otpValue} onChange={(e) => setOtpValue(e.target.value)} className={inputClass} placeholder="6-digit code" maxLength={6} />
                    </Field>
                    <button type="button" onClick={handleVerifyOtp} disabled={isLoading} className="mb-0.5 shrink-0 whitespace-nowrap rounded-2xl bg-[#0F172A] px-6 py-3.5 text-xs font-bold text-white transition-colors hover:bg-[#13294B] shadow-md disabled:opacity-50">
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                )}
                {otpNotice && <p className="sm:col-span-2 text-xs font-bold text-emerald-600 animate-fade-in">{otpNotice}</p>}
                {otpError && <p className="sm:col-span-2 text-xs font-bold text-red-600 animate-fade-in">{otpError}</p>}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200 animate-fade-in">
                <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={!emailVerified}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] py-4 text-sm font-bold text-[#0F172A] shadow-lg shadow-amber-500/10 transition-all duration-300 hover:bg-[#FCD34D] hover:shadow-xl hover:shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Account & Go to Dashboard
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </form>

          <p className="text-center text-sm font-semibold text-slate-500">
            Already have an employer account?{" "}
            <Link href="/login" className="text-[#0F172A] underline underline-offset-4 hover:text-[#13294B]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-600">Loading portal...</div>}>
      <SignupFormContent />
    </Suspense>
  );
}
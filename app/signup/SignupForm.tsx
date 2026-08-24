"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "../lib/api"; // 🚀 Real API utility

const COMPANY_TYPES = [
  "Manning Agent / RPSL Holder",
  "Ship Owner",
  "Ship Management Company",
  "Crewing Agency",
  "Cruise Line",
  "Other Maritime Employer",
];

function SectionHeading({ step, title, description }: { step: number; title: string; description: string; }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white">
        {step}
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

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm text-[#0F172A] placeholder:text-slate-400 transition-all duration-200 focus:border-[#FBBF24] focus:outline-none focus:ring-4 focus:ring-[#FBBF24]/10";

export default function SignupForm() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false); // 🚀 Added loading state

  const [fullName, setFullName] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");

  const [rpslNumber, setRpslNumber] = useState("");
  const [rpslValidity, setRpslValidity] = useState("");
  const [dgShippingDetails, setDgShippingDetails] = useState("");
  const [companyRegNumber, setCompanyRegNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  const [error, setError] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  function handleEmailChange(value: string) {
    setOfficialEmail(value);
    setOtpSent(false);
    setOtpValue("");
    setOtpError("");
    setEmailVerified(false);
  }

  function handleSendOtp() {
    setOtpError("");
    if (!officialEmail.trim() || !/^\S+@\S+\.\S+$/.test(officialEmail)) {
      setOtpError("Enter a valid official email first.");
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpValue("");
    setOtpError(`Demo mode — OTP sent to ${officialEmail}: ${code}`);
  }

  function handleVerifyOtp() {
    if (otpValue.trim() === generatedOtp) {
      setEmailVerified(true);
      setOtpError("");
    } else {
      setOtpError("Incorrect OTP. Please try again.");
    }
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!emailVerified) {
      setError("Please verify your official email with the OTP before continuing.");
      return;
    }
    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 🚀 Real Backend Registration Call
      const payload = {
        name: fullName.trim(),
        email: officialEmail.trim(),
        phone_number: mobileNumber.trim(),
        password: password,
        role: "hr", // Forced HR role
        company_name: companyName.trim(),
        company_type: companyType,
        company_website: companyWebsite.trim(),
        office_address: officeAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        rpsl_number: rpslNumber.trim(),
        rpsl_validity: rpslValidity,
        dg_shipping_details: dgShippingDetails.trim(),
        company_reg_number: companyRegNumber.trim(),
        gst_number: gstNumber.trim(),
      };

      const response = await api.post("/auth/register", payload);

      if (response.data?.success || response.status === 201) {
        // Redirect to dashboard on successful registration
        router.push("/employer/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            Create Employer Account
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Start hiring verified maritime crew today.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-slate-300">
            Register your company, verify RPSL &amp; DG Shipping details, and activate the
            yearly plan to post unlimited maritime jobs.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="group rounded-2xl border border-white/5 bg-white/3 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-white">Yearly Plan</span>
              <span className="text-lg font-bold text-[#FBBF24]">₹25,000<span className="text-xs font-medium text-slate-400"> / year</span></span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
              {[
                "Unlimited job postings",
                "Applied CV access included",
                "Complete hiring pipeline",
                "Company profile listing",
                "Basic analytics",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-[#FBBF24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="group rounded-2xl border border-white/5 bg-white/3 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/6">
            <span className="text-sm font-bold text-white">Smart Sourcing</span>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
              Discover and unlock candidates from the Maritime Talent Database — a
              pay-as-you-go add-on.
            </p>
          </div>
        </div>
      </div>

       <div className="flex w-full flex-col items-center bg-white px-6 py-12 md:px-12 lg:w-3/5">
        <div className="w-full max-w-2xl space-y-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] font-bold tracking-widest text-[#13294B] uppercase block">
                Employer Registration
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
                Create Employer Account
              </h1>
              <p className="text-sm text-slate-500">
                Fill in your details below to set up your company&apos;s hiring workspace.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {[
                { n: 1, label: "Your Details" },
                { n: 2, label: "Company & Verification" },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        step >= s.n
                          ? "bg-[#0F172A] text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {s.n}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        step >= s.n ? "text-[#0F172A]" : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i === 0 && <div className="h-px w-8 bg-slate-200" />}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleContinue} className="space-y-10">
              <div className="space-y-5">
                <SectionHeading
                  step={1}
                  title="HR / Recruiter Details"
                  description="Who will manage this employer account?"
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full Name" required>
                    <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Enter your name" />
                  </Field>
                  <Field label="Official Email" required>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={officialEmail}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={inputClass}
                        placeholder="hr@company.com"
                      />
                      {!emailVerified && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="shrink-0 whitespace-nowrap rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-[#0F172A] transition-colors hover:bg-slate-100"
                        >
                          {otpSent ? "Resend OTP" : "Send OTP"}
                        </button>
                      )}
                      {emailVerified && (
                        <span className="flex shrink-0 items-center gap-1 rounded-2xl bg-green-50 px-3 text-xs font-semibold text-green-600 border border-green-100">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                  </Field>

                  {otpSent && !emailVerified && (
                    <div className="sm:col-span-2 flex items-end gap-2">
                      <Field label="Enter OTP">
                        <input
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value)}
                          className={inputClass}
                          placeholder="6-digit code"
                          maxLength={6}
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="mb-0.5 shrink-0 whitespace-nowrap rounded-2xl bg-blue-950 px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#13294B]"
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}
                  {otpError && (
                    <p className={`sm:col-span-2 text-xs font-medium ${otpError.startsWith("Demo mode") ? "text-slate-500" : "text-red-600"}`}>
                      {otpError}
                    </p>
                  )}

                  <Field label="Mobile Number" required>
                    <div className="flex flex-col gap-2">
                      <input
                        required
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className={inputClass}
                        placeholder="9876543210"
                      />
                    </div>
                  </Field>
                  <Field label="Password" required>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="At least 6 characters" />
                  </Field>
                  <Field label="Confirm Password" required>
                    <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                  </Field>
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
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] py-3.5 text-sm font-bold text-[#0F172A] shadow-lg shadow-amber-500/10 transition-all duration-300 hover:bg-[#FCD34D] hover:shadow-xl hover:shadow-amber-500/20 active:scale-[0.98]"
              >
                Continue
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-5">
                <SectionHeading
                  step={2}
                  title="Company Details"
                  description="Basic information about your organisation."
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Company Name" required>
                    <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="V.Ships Crew Management" />
                  </Field>
                  <Field label="Company Type" required>
                    <select required value={companyType} onChange={(e) => setCompanyType(e.target.value)} className={inputClass}>
                      <option value="">Select</option>
                      {COMPANY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Company Website">
                    <input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} className={inputClass} placeholder="https://" />
                  </Field>
                  <Field label="Office Address">
                    <input value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} className={inputClass} placeholder="Office address" />
                  </Field>
                  <Field label="City">
                    <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="City" />
                  </Field>
                  <Field label="State">
                    <input value={state} onChange={(e) => setState(e.target.value)} className={inputClass} placeholder="State" />
                  </Field>
                  <Field label="Country">
                    <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} placeholder="India" />
                  </Field>
                </div>
              </div>

              <div className="space-y-5 border-t border-slate-100 pt-8">
                <SectionHeading
                  step={3}
                  title="Verification Details"
                  description="Add RPSL / DG Shipping details for faster verification. Optional but recommended."
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="RPSL Number">
                    <input value={rpslNumber} onChange={(e) => setRpslNumber(e.target.value)} className={inputClass} placeholder="RPSL/MUM/xxxx/xxx" />
                  </Field>
                  <Field label="RPSL Validity Date">
                    <input type="date" value={rpslValidity} onChange={(e) => setRpslValidity(e.target.value)} className={inputClass} placeholder="dd/mm/yyyy" />
                  </Field>
                  <Field label="DG Shipping Details">
                    <input value={dgShippingDetails} onChange={(e) => setDgShippingDetails(e.target.value)} className={inputClass} placeholder="DG Shipping registration details" />
                  </Field>
                  <Field label="Company Registration Number">
                    <input value={companyRegNumber} onChange={(e) => setCompanyRegNumber(e.target.value)} className={inputClass} placeholder="Company registration number" />
                  </Field>
                  <Field label="GST Number (Optional)">
                    <input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className={inputClass} placeholder="GST number" />
                  </Field>
                </div>
                <p className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 border border-slate-100">
                  Note: After creating your account you can submit RPSL certificate &amp;
                  company authorization letter for verification. Jobs go live after
                  verification.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setStep(1)}
                  className="shrink-0 rounded-2xl border border-slate-200 px-6 py-3.5 text-sm font-bold text-[#0F172A] transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] py-3.5 text-sm font-bold text-[#0F172A] shadow-lg shadow-amber-500/10 transition-all duration-300 hover:bg-[#FCD34D] hover:shadow-xl hover:shadow-amber-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Account..." : "Create Employer Account"}
                  {!isLoading && <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-slate-500">
            Already have an employer account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#0F172A] underline underline-offset-4 hover:text-[#13294B]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
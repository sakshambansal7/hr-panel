// app/employer/forgot-password/page.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import api from "../../lib/api";

const ReCAPTCHA: any = dynamic(() => import("react-google-recaptcha"), { ssr: false });

function MaritimeIllustration() {
  return (
    <svg viewBox="0 0 600 800" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1230" />
          <stop offset="55%" stopColor="#0f1f4d" />
          <stop offset="100%" stopColor="#123a6b" />
        </linearGradient>
        <linearGradient id="waveFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a4a8a" />
          <stop offset="100%" stopColor="#123a6b" />
        </linearGradient>
        <linearGradient id="waveNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a2a52" />
          <stop offset="100%" stopColor="#081d3d" />
        </linearGradient>
      </defs>
      <rect width="600" height="800" fill="url(#sky)" />
      {[ [60, 70], [140, 110], [220, 60], [320, 130], [420, 80], [500, 140], [90, 200], [260, 180], [460, 220], [40, 260], [540, 260] ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 2 : 1.2} fill="#facc15" opacity={0.7} />
      ))}
      <circle cx="470" cy="120" r="34" fill="#fde68a" opacity="0.9" />
      <circle cx="482" cy="110" r="30" fill="url(#sky)" opacity="0.55" />
      <g opacity="0.15" stroke="#facc15" strokeWidth="1.5" fill="none">
        <circle cx="150" cy="420" r="90" />
        <circle cx="150" cy="420" r="60" />
        <line x1="150" y1="330" x2="150" y2="510" />
        <line x1="60" y1="420" x2="240" y2="420" />
      </g>
      <path d="M0 480 Q 75 460 150 480 T 300 480 T 450 480 T 600 480 V 620 H 0 Z" fill="url(#waveFar)" />
      <path d="M0 560 Q 100 530 200 560 T 400 560 T 600 560 V 800 H 0 Z" fill="url(#waveNear)" />
    </svg>
  );
}

export default function HrForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showCaptcha, setShowCaptcha] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef<any>(null);

  const [showResendCaptcha, setShowResendCaptcha] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const resendRecaptchaRef = useRef<any>(null);

  // 🚀 HR uses EMAIL (not phone)
  const [email, setEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [tempToken, setTempToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ─────────────────────────────────────────────
  // STEP 1 — Send OTP to email
  // ─────────────────────────────────────────────
  function handleInitiateReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your registered company email.");
      return;
    }
    setShowCaptcha(true);
  }

  async function executeSendCode(token: string) {
    if (!token) return;
    try {
      setLoading(true);
      setShowCaptcha(false);

      const { data } = await api.post(
        "/auth/forgot-password",
        {
          email: email.trim().toLowerCase(),
          recaptchaToken: token,
        },
        { headers: { Authorization: "" } } // Bypass expired JWT for public route
      );

      if (!data.success) {
        setError(data.message || "Failed to send OTP.");
        return;
      }
      setStep(2);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
      setRecaptchaToken("");
    }
  }

  // ─────────────────────────────────────────────
  // STEP 2 — Verify OTP, get reset token
  // ─────────────────────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResendMessage("");
    if (!otpInput.trim()) {
      setError("Please enter OTP.");
      return;
    }
    try {
      setLoading(true);

      const { data } = await api.post(
        "/auth/verify-forgot-otp",
        {
          email: email.trim().toLowerCase(),
          otp: otpInput.trim(),
        },
        { headers: { Authorization: "" } }
      );

      if (!data.success) {
        setError(data.message || "Invalid OTP.");
        return;
      }

      const token = data.data?.resetToken || data.data?.accessToken;
      if (!token) {
        setError("Token not received from server.");
        return;
      }

      setTempToken(token);
      setStep(3);
    } catch (error: any) {
      setError(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────
  // STEP 2b — Resend OTP
  // ─────────────────────────────────────────────
  async function executeResendCode(token: string) {
    if (!token) return;
    try {
      setResendLoading(true);
      setError("");
      setResendMessage("");
      setShowResendCaptcha(false);

      const { data } = await api.post(
        "/auth/resend-forgot-password-otp",
        {
          email: email.trim().toLowerCase(),
          recaptchaToken: token,
        },
        { headers: { Authorization: "" } }
      );

      if (!data.success) {
        setError(data.message || "Failed to resend OTP.");
        return;
      }
      setResendMessage("A new verification code has been sent to your email.");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
      resendRecaptchaRef.current?.reset();
    }
  }

  // ─────────────────────────────────────────────
  // STEP 3 — Reset password
  // ─────────────────────────────────────────────
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password) { setError("Please enter a new password."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    try {
      setLoading(true);
      const { data } = await api.post(
        "/auth/reset-password",
        {
          token: tempToken,
          password,
          confirmPassword,
        },
        { headers: { Authorization: "" } }
      );

      if (!data.success) {
        setError(data.message || "Password reset failed.");
        return;
      }
      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/employer/login"), 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT PANEL */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <MaritimeIllustration />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow-400 text-sm font-bold text-blue-950">
              MN
            </div>
            <span className="text-lg font-bold tracking-tight">MerchantNavyJobs</span>
          </div>

          <div className="max-w-md space-y-4">
            <span className="inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-300">
              HR Account Recovery
            </span>
            <h1 className="text-3xl font-bold leading-tight tracking-tight">
              Secure Access Restoration.
            </h1>
            <p className="text-sm leading-relaxed text-blue-100/80">
              For security reasons, HR password resets require verification via your registered company email address.
            </p>
          </div>

          <p className="text-[14px] text-blue-200/50">
            &copy; {new Date().getFullYear()} MerchantNavyJobs. Restricted access.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex w-full flex-col items-center justify-center bg-gray-50 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">

          <Link
            href="/employer/login"
            className="mb-6 inline-block text-sm font-bold text-zinc-500 hover:text-blue-950 transition-colors"
          >
            &larr; Back to Login
          </Link>

          <div className="rounded-2xl border-slate-300 border-2 bg-white p-8 shadow-lg shadow-zinc-200/60">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-black leading-tight">
                {step === 1 && "Forgot Password"}
                {step === 2 && "Verify Email"}
                {step === 3 && "Reset Password"}
              </h1>
              <p className="mt-1 text-[14px] text-zinc-500 leading-tight">
                {step === 1 && "Enter your company email to receive a code."}
                {step === 2 && "Enter the 6-digit OTP sent to your email."}
                {step === 3 && "Create a new strong password."}
              </p>
            </div>

            {/* STEP 1 — Email + Captcha */}
            {step === 1 && (
              <form onSubmit={handleInitiateReset} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-600">Company Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hr@angloeastern.com"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-black focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950 transition-all"
                  />
                </div>

                {error && <p className="text-sm font-medium text-red-500">{error}</p>}

                {!showCaptcha ? (
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full rounded-full bg-yellow-400 py-3 text-sm font-bold text-blue-950 shadow-sm transition-colors hover:bg-yellow-300 disabled:opacity-50"
                  >
                    {loading ? "Preparing..." : "Send Verification Code"}
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-4 pt-2">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                      onChange={(token: string | null) => {
                        if (token) {
                          setRecaptchaToken(token);
                          executeSendCode(token);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCaptcha(false)}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* STEP 2 — Verify OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-600">Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full rounded-lg border-slate-300 border-2 bg-white py-3 text-center text-xl tracking-[0.5em] font-bold text-black focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950"
                  />
                </div>

                {error && <p className="text-sm font-medium text-red-500">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(""); setResendMessage(""); }}
                    className="rounded-full border-slate-300 border-2 px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || resendLoading}
                    className="flex-1 rounded-full bg-yellow-400 py-3 text-sm font-bold text-blue-950 shadow-sm transition-colors hover:bg-yellow-300 disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                </div>

                <div className="pt-2 text-center">
                  {resendMessage && (
                    <p className="mb-4 text-xs font-semibold text-emerald-600">{resendMessage}</p>
                  )}
                  {!showResendCaptcha ? (
                    <button
                      type="button"
                      disabled={loading || resendLoading}
                      onClick={() => { setError(""); setResendMessage(""); setShowResendCaptcha(true); }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Didn't receive code? Resend
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <ReCAPTCHA
                        ref={resendRecaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                        onChange={(token: string | null) => { if (token) executeResendCode(token); }}
                      />
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* STEP 3 — Reset Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-600">New Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border-slate-300 border-2 bg-white px-3 py-2.5 text-sm text-black focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-600">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border-slate-300 border-2 bg-white px-3 py-2.5 text-sm text-black focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950"
                  />
                </div>

                {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                {successMsg && <p className="text-sm font-medium text-emerald-600">{successMsg}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-yellow-400 py-3 text-sm font-bold text-blue-950 shadow-sm transition-colors hover:bg-yellow-300 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
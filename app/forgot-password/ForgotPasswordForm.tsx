// app/forgot-password/ForgotPasswordForm.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import api from "../lib/api";

const ReCAPTCHA: any = dynamic(() => import("react-google-recaptcha"), {
  ssr: false,
});

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const [email, setEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [tempToken, setTempToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleInitiateReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setShowCaptcha(true);
  }

  async function executeSendCode(token: string) {
    if (!token) {
      setError("Please complete the captcha.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
        recaptchaToken: token, 
      });

      if (!data.success) {
        setError(data.message || "Failed to send OTP.");
        setShowCaptcha(false);
        return;
      }

      setShowCaptcha(false);
      setStep(2);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
      setRecaptchaToken("");
    }
  }

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
      const { data } = await api.post("/auth/verify-forgot-otp", {
        email: email.trim().toLowerCase(),
        otp: otpInput.trim(),
      });

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

  async function executeResendCode(token: string) {
    if (!token) return;

    try {
      setResendLoading(true);
      setError("");
      setResendMessage("");

      const { data } = await api.post("/auth/resend-forgot-password-otp", {
        email: email.trim().toLowerCase(),
        recaptchaToken: token,
      });

      if (!data.success) {
        setError(data.message || "Failed to resend OTP.");
        return;
      }

      setResendMessage("A new verification code has been sent to your email.");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
      setShowResendCaptcha(false);
      resendRecaptchaRef.current?.reset();
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/reset-password", {
        token: tempToken,
        password,
        confirmPassword, 
      });

      if (!data.success) {
        setError(data.message || "Password reset failed.");
        return;
      }

      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] px-6 py-12 font-sans antialiased">
      <div className="w-full max-w-lg space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
            Account Recovery
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify Your Email"}
            {step === 3 && "Reset Password"}
          </h1>
          <p className="text-sm text-slate-500">
            {step === 1 && "Enter the email linked to your account and we'll send a verification code."}
            {step === 2 && "Enter the 6-digit verification code sent to your email."}
            {step === 3 && "Create a new strong password for your account."}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
          {/* STEP 1: EMAIL ENTRY & CAPTCHA */}
          {step === 1 && (
            <form onSubmit={handleInitiateReset} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hr@vships.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 px-4 text-sm text-[#0F172A] placeholder:text-slate-400 transition-all duration-200 focus:border-[#FBBF24] focus:outline-none focus:ring-4 focus:ring-[#FBBF24]/10"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              {!showCaptcha ? (
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] py-3.5 text-sm font-bold text-[#0F172A] shadow-lg shadow-amber-500/10 transition-all duration-300 hover:bg-[#FCD34D] hover:shadow-xl hover:shadow-amber-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Preparing..." : "Send verification code"}
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
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-center text-xl tracking-[0.5em] font-bold text-[#0F172A] placeholder:text-slate-300 focus:border-[#FBBF24] focus:outline-none focus:ring-4 focus:ring-[#FBBF24]/10"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setResendMessage("");
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || resendLoading}
                  className="flex-1 rounded-2xl bg-[#FBBF24] py-3.5 text-sm font-bold text-[#0F172A] shadow-lg shadow-amber-500/10 transition-all duration-300 hover:bg-[#FCD34D] active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center space-y-3">
                {resendMessage && (
                  <p className="text-xs font-medium text-emerald-700 bg-emerald-50 py-2.5 px-3 rounded-xl border border-emerald-100">
                    {resendMessage}
                  </p>
                )}

                {!showResendCaptcha ? (
                  <button
                    type="button"
                    disabled={loading || resendLoading}
                    onClick={() => {
                      setError("");
                      setResendMessage("");
                      setShowResendCaptcha(true);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                  >
                    Didn't receive the code? Resend OTP
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <ReCAPTCHA
                      ref={resendRecaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                      onChange={(token: string | null) => {
                        if (token) executeResendCode(token);
                      }}
                    />
                  </div>
                )}
              </div>
            </form>
          )}

          {/* STEP 3: RESET PASSWORD FORM */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 px-4 text-sm text-[#0F172A] placeholder:text-slate-400 transition-all duration-200 focus:border-[#FBBF24] focus:outline-none focus:ring-4 focus:ring-[#FBBF24]/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 px-4 text-sm text-[#0F172A] placeholder:text-slate-400 transition-all duration-200 focus:border-[#FBBF24] focus:outline-none focus:ring-4 focus:ring-[#FBBF24]/10"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 border border-emerald-100">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#FBBF24] py-3.5 text-sm font-bold text-[#0F172A] shadow-lg shadow-amber-500/10 transition-all duration-300 hover:bg-[#FCD34D] active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#0F172A] underline underline-offset-4 hover:text-[#13294B]"
          >
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  );
}
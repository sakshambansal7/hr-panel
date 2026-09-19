// app/employer/dashboard/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/auth-context";
import { Mail, Phone, LockKeyhole, Save, User as UserIcon, ShieldCheck } from "lucide-react";
// 🚀 FIXED: Changed from "../components" to "../../components"
import DashboardShell from "../components/DashboardShell"; 

export default function EmployerProfilePage() {
  const { user, updateLocalUser } = useAuth();
  const router = useRouter();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"personal" | "security">("personal");

  // Form State
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhoneNumber(user.phone_number || "");
    }
  }, [user]);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, phone_number: phoneNumber }),
      });

      if (!res.ok) throw new Error("Failed to update profile details");

      if (updateLocalUser) {
        updateLocalUser({ ...user, name, phone_number: phoneNumber });
      }
      
      setMessage({ text: "Profile details updated successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Something went wrong.", type: "error" });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <DashboardShell pageTitle="My Profile">
      {/* 🚀 w-full ensures the content stretches to fill the dashboard area */}
      <div className="w-full space-y-8 animate-in fade-in duration-500 font-sans antialiased text-zinc-900">
        
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Account Settings</h1>
          <p className="text-sm text-zinc-500 mt-2">Manage your personal information, company email, and security preferences.</p>
        </div>

        {/* MAIN CARD (Constrained width inside the full-width container) */}
        <div className="max-w-4xl bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          
          {/* PROFILE HEADER (Inside Card) */}
          <div className="p-8 border-b border-zinc-100 flex items-center gap-6 bg-zinc-50/50">
            <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-700 shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || "H"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">{user?.name || "HR Manager"}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-200/50 px-2.5 py-1 rounded-md">
                  {user?.role === "employer" ? "Recruiter (HR)" : user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex border-b border-zinc-100 px-4">
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                activeTab === "personal"
                  ? "border-amber-400 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-200"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                activeTab === "security"
                  ? "border-amber-400 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-200"
              }`}
            >
              <LockKeyhole className="w-4 h-4" />
              Security
            </button>
          </div>

          {/* TAB CONTENT AREA */}
          <div className="p-8">
            
            {/* ALERTS */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${
                message.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
              }`}>
                {message.type === "success" ? <ShieldCheck className="w-5 h-5" /> : null}
                {message.text}
              </div>
            )}

            {/* TAB 1: PERSONAL INFORMATION */}
            {activeTab === "personal" && (
              <form onSubmit={handleSaveDetails} className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-1.5 max-w-xl">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm text-zinc-900 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-1.5 max-w-xl">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Company Email (Read Only)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-100 pl-11 pr-4 py-3.5 text-sm text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium mt-1">This is your verified company email and cannot be changed.</p>
                </div>

                <div className="space-y-1.5 max-w-xl">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 py-3.5 text-sm text-zinc-900 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="pt-4 max-w-xl">
                  <button
                    type="submit"
                    disabled={isUpdating || (name === user?.name && phoneNumber === user?.phone_number)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-8 py-3.5 text-sm font-bold text-zinc-950 shadow-sm hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Save className="w-4 h-4" />
                    {isUpdating ? "Saving Changes..." : "Save Details"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: SECURITY */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-xl">
                <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <h3 className="text-sm font-bold text-zinc-900 mb-2">Password Reset</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    To change your password, we need to verify your identity. We will send a 6-digit verification code to your registered company email address (<strong>{user?.email}</strong>). 
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => router.push("/employer/forgot-password")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-zinc-800 transition-all"
                  >
                    <LockKeyhole className="w-4 h-4" />
                    Change Password
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
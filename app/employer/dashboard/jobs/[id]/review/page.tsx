"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Clock, Loader2, Save, Anchor, Award, Phone, Mail, FileText, MapPin } from "lucide-react";
import api from "../../../../../lib/api";
import ResumeTemplate from "../ResumeTemplate";

// Helper function to calculate total sea time from experience array
const calculateTotalSeaTime = (seaExperiences?: any[]) => {
  if (!seaExperiences || seaExperiences.length === 0) return "0 Months";
  let totalDays = 0;
  seaExperiences.forEach((exp) => {
    const start = new Date(exp.from_date || exp.sign_on || exp.fromDate);
    const end = new Date(exp.to_date || exp.sign_off || exp.toDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      totalDays += (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
    }
  });
  const months = Math.floor(totalDays / 30);
  if (months > 12) return `${(months / 12).toFixed(1)} Years`;
  return `${months} Months`;
};

// Helper component for key credentials row
const CredentialRow = ({ label, value }: { label: string; value: any }) => {
  if (!value || value === "—" || value === "") return null;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0 last:pb-0">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-800">{value}</span>
    </div>
  );
};

export default function SpeedReviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [applications, setApplications] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  
  const [candidateCache, setCandidateCache] = useState<Record<string, any>>({});
  const [isLoadingCandidate, setIsLoadingCandidate] = useState(false);

  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    const fetchApps = async () => {
      try {
        const res = await api.get(`/hr/jobs/${jobId}/applications`);
        const apps = res.data?.data || res.data || [];
        const pendingApps = apps.filter((a: any) => a.status === 'applied');
        setApplications(pendingApps.length > 0 ? pendingApps : apps);
      } catch (err) {
        console.error("Failed to load applications for review", err);
      } finally {
        setIsLoadingApps(false);
      }
    };
    fetchApps();
  }, [jobId]);

  const currentApp = applications[currentIndex];
  
  useEffect(() => {
    if (!currentApp) return;
    const candidateId = currentApp.candidate_id || currentApp.user_id;

    if (candidateCache[candidateId]) return;

    const fetchDeepData = async () => {
      setIsLoadingCandidate(true);
      try {
        const profileRes = await api.get(`/hr/candidates/${candidateId}/profile`);
        const apiData = profileRes.data?.data || profileRes.data || {};
        
        let finalProfile: any = { ...apiData }; 
        let finalSeaExperience: any[] = [];
        let finalCertificates: any[] = [];

        const fieldsArray = apiData.fields || (Array.isArray(apiData) ? apiData : []);
        
        if (fieldsArray.length > 0) {
          fieldsArray.forEach((field: any) => {
            const { meta_data: key, meta_sub_data: subKey, meta_value: value } = field;
            if (value === null || value === undefined || value === "") return;

            if (key === "dob") finalProfile.date_of_birth = value;
            if (key === "nationality") finalProfile.nationality = value;
            if (key === "gender") finalProfile.gender = value;
            if (key === "indos_number") finalProfile.indos_number = value;
            if (key === "about_yourself") finalProfile.summary = value;
            if (key === "has_us_visa") finalProfile.has_us_visa = (value === 1 || value === "Yes" || value === true || value === "1");
            if (key === "desired_rank" || key === "current_rank") finalProfile.applied_rank = value;

            if (key === "passport") {
               if (subKey === "passport_number") finalProfile.passport_number = value;
               if (subKey === "passport_issue_place") finalProfile.passport_place_of_issue = value;
               if (subKey === "passport_expiry_date") finalProfile.passport_expiry_date = value;
            }

            const coreCerts = ["cdc_number", "coc_number", "cop_number", "sid_number", "dce_number", "yellow_fever_vaccination"];
            if (coreCerts.includes(key)) {
                let docName = key.replace(/_/g, " ").toUpperCase();
                if (key === "yellow_fever_vaccination") docName = "YELLOW FEVER";
                
                finalCertificates.push({
                    custom_name: docName.replace(" NUMBER", ""),
                    document_number: value,
                    lifetime: true, 
                    place_of_issue: "—" 
                });
                finalProfile[key] = value;
            }

            if (key === "sea_experiences") {
              try {
                const parsedSea = typeof value === 'string' ? JSON.parse(value) : value;
                if (Array.isArray(parsedSea) && parsedSea.length > 0) {
                  finalSeaExperience = parsedSea;
                }
              } catch (e) {}
            }
          });
        }

        const mappedSeaExp = finalSeaExperience.map((exp: any) => ({
          ...exp,
          vessel_name: exp.vessel_name || exp.vesselName,
          from_date: exp.from_date || exp.fromDate,
          to_date: exp.to_date || exp.toDate,
        })).sort((a, b) => new Date(b.to_date).getTime() - new Date(a.to_date).getTime());

        setCandidateCache(prev => ({
          ...prev,
          [candidateId]: {
            user: { name: currentApp.candidate_name, email: currentApp.candidate_email, phone: currentApp.phone_number },
            profile: finalProfile,
            seaExperience: mappedSeaExp,
            certificates: finalCertificates
          }
        }));

      } catch (err) {
        console.error("Error fetching candidate profile:", err);
      } finally {
        setIsLoadingCandidate(false);
      }
    };

    fetchDeepData();
  }, [currentApp, candidateCache]);

  const handleDecision = (status: string) => {
    if (!currentApp) return;
    setDecisions(prev => ({
      ...prev,
      [currentApp.application_id || currentApp.id]: status
    }));
    if (currentIndex < applications.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSaveAndComplete = async () => {
    setIsSaving(true);
    const decisionEntries = Object.entries(decisions);
    for (const [appId, status] of decisionEntries) {
      const dbStatus = status === 'hold' ? 'applied' : status;
      try {
        await api.patch(`/hr/applications/${appId}/status`, { status: dbStatus });
      } catch (err) {
        console.error(`Failed to update app ${appId}`, err);
      }
    }
    router.push(`/employer/dashboard/jobs/${jobId}`);
  };

  if (isLoadingApps) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  if (applications.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-700">No new candidates available for review.</p>
        <Link href={`/employer/dashboard/jobs/${jobId}`} className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-700">Return to ATS</Link>
      </div>
    );
  }

  const activeCandidateData = currentApp ? candidateCache[currentApp.candidate_id || currentApp.user_id] : null;
  const progressPercent = Math.round(((currentIndex + 1) / applications.length) * 100);

  // Derive deep data for left panel
  const latestVessel = activeCandidateData?.seaExperience?.[0];
  const cocData = activeCandidateData?.certificates?.find((c: any) => c.custom_name === 'COC');

  return (
    <div className="flex h-screen flex-col bg-slate-50 overflow-hidden font-sans">
      
      {/* 🔝 TOP NAVBAR */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-4">
          <Link href={`/employer/dashboard/jobs/${jobId}`} className="text-slate-400 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Reviewing Applications</h1>
            <p className="text-xs font-medium text-slate-500">Candidate {currentIndex + 1} of {applications.length}</p>
          </div>
        </div>

        <div className="flex w-1/3 items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-500">{progressPercent}%</span>
        </div>

        <button 
          onClick={handleSaveAndComplete}
          disabled={isSaving || Object.keys(decisions).length === 0}
          className="flex items-center gap-2 rounded-lg bg-[#0F1E35] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#1a2e4c] disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Complete & Save"}
        </button>
      </header>

      {/* 🪟 SPLIT SCREEN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ⬅️ LEFT SIDEBAR (Deep Analytics Panel) */}
        <div className="w-[380px] shrink-0 border-r border-slate-200 bg-white p-6 overflow-y-auto flex flex-col gap-6 scrollbar-hide shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
              {activeCandidateData?.profile?.photo_url ? (
                <img src={activeCandidateData.profile.photo_url} className="h-full w-full object-cover" alt="Profile" />
              ) : (
                <span className="text-xl font-black text-slate-400">{currentApp.candidate_name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">{currentApp.candidate_name}</h2>
              <p className="text-sm font-bold text-blue-600 mt-0.5">{activeCandidateData?.profile?.applied_rank || "Rank Not Specified"}</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Sea Time</p>
               <p className="text-sm font-black text-slate-800 mt-1">
                 {isLoadingCandidate ? "..." : calculateTotalSeaTime(activeCandidateData?.seaExperience)}
               </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nationality</p>
               <p className="text-sm font-black text-slate-800 mt-1 flex items-center gap-1.5">
                 <MapPin className="h-3.5 w-3.5 text-slate-400"/>
                 {activeCandidateData?.profile?.nationality || "N/A"}
               </p>
            </div>
          </div>

          {/* Readiness Score */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-50 shrink-0">
               <span className="text-sm font-black text-emerald-700">92%</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Match Score</h3>
              <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold mt-1">Excellent Match</p>
            </div>
          </div>

          {/* Latest Sea Service */}
          {latestVessel && (
            <div>
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
                 <Anchor className="h-3.5 w-3.5"/> Latest Sea Service
               </h3>
               <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="font-bold text-slate-900">{latestVessel.vessel_name || "Unknown Vessel"}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs font-semibold text-slate-600">{latestVessel.rank}</p>
                    <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{latestVessel.company}</p>
                  </div>
               </div>
            </div>
          )}

          {/* Key Credentials List */}
          <div>
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
               <Award className="h-3.5 w-3.5"/> Key Credentials
             </h3>
             <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <CredentialRow label="INDOS No." value={activeCandidateData?.profile?.indos_number} />
                <CredentialRow label="Passport" value={activeCandidateData?.profile?.passport_number} />
                <CredentialRow label="CDC" value={activeCandidateData?.profile?.cdc_number} />
                <CredentialRow label="COC" value={cocData?.document_number} />
                <CredentialRow label="US Visa" value={activeCandidateData?.profile?.has_us_visa ? "Yes (C1/D)" : "No"} />
             </div>
          </div>

          {/* Contact Details */}
          <div className="mt-auto pt-4 border-t border-slate-100">
             <div className="space-y-2.5">
               <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                 <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Mail className="h-3.5 w-3.5" /></div>
                 {currentApp.candidate_email}
               </div>
               <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                 <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Phone className="h-3.5 w-3.5" /></div>
                 {currentApp.phone_number}
               </div>
             </div>
          </div>

        </div>

        {/* ➡️ RIGHT CONTENT (Virtual CV) */}
        <div className="flex-1 bg-slate-100 p-8 overflow-y-auto relative flex justify-center">
          {isLoadingCandidate ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
            </div>
          ) : activeCandidateData ? (
            <div className="origin-top scale-[0.85] xl:scale-100 transition-transform w-[210mm] shadow-2xl">
              <ResumeTemplate 
                user={activeCandidateData.user}
                profile={activeCandidateData.profile}
                seaExperience={activeCandidateData.seaExperience}
                certificates={activeCandidateData.certificates}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 font-bold">Failed to load CV data.</div>
          )}
        </div>
      </div>

      {/* 🔽 BOTTOM ACTION BAR */}
      <div className="flex h-20 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-8 z-20">
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="text-sm font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 flex items-center gap-1"
        >
          &larr; Previous
        </button>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleDecision('rejected')}
            className={`flex items-center gap-2 rounded-xl border px-8 py-3 text-sm font-bold transition-all ${
              decisions[currentApp?.application_id || currentApp?.id] === 'rejected' 
                ? 'bg-red-500 text-white border-red-600 shadow-md shadow-red-500/20' 
                : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <X className="h-5 w-5" /> Reject
          </button>
          
          <button 
            onClick={() => handleDecision('hold')}
            className={`flex items-center gap-2 rounded-xl border px-8 py-3 text-sm font-bold transition-all ${
              decisions[currentApp?.application_id || currentApp?.id] === 'hold' 
                ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20' 
                : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock className="h-5 w-5" /> Keep on Hold
          </button>

          <button 
            onClick={() => handleDecision('shortlisted')}
            className={`flex items-center gap-2 rounded-xl border px-8 py-3 text-sm font-bold transition-all ${
              decisions[currentApp?.application_id || currentApp?.id] === 'shortlisted' 
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20' 
                : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            <Check className="h-5 w-5" /> Forward / Shortlist
          </button>
        </div>

        <button 
          onClick={() => setCurrentIndex(prev => Math.min(applications.length - 1, prev + 1))}
          disabled={currentIndex === applications.length - 1}
          className="text-sm font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 flex items-center gap-1"
        >
          Next &rarr;
        </button>
      </div>

    </div>
  );
}
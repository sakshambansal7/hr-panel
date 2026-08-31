//   app/employer/dashboard/candidates/[id]/page.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, ShieldCheck, Award, Anchor, Loader2, MapPin } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";
import api from "../../../../lib/api";
// 🚀 Make sure you moved ResumeTemplate to the components folder!
import ResumeTemplate from "../../jobs/[id]/ResumeTemplate"; 


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

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(name: string = "") {
  if (name) return name.charAt(0).toUpperCase();
  return "U";
}

export default function CandidateProfilePage() {
  const params = useParams();
  const candidateId = params?.id as string;
  
  const [candidateBasic, setCandidateBasic] = useState<any>(null);
  
  // State for the Deep Virtual CV Data
  const [cvProfile, setCvProfile] = useState<any>({});
  const [cvSeaExp, setCvSeaExp] = useState<any[]>([]);
  const [cvCerts, setCvCerts] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidateData = useCallback(async () => {
    if (!candidateId) return; 

    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Basic Info
      const basicRes = await api.get(`/hr/candidates/${candidateId}`);
      const basicPayload = basicRes.data?.data;
      if (!basicPayload || !basicPayload.profile) throw new Error("Profile data is empty.");
      
      setCandidateBasic(basicPayload.profile);

      // 2. Fetch Deep EAV Data for Virtual CV
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

      setCvProfile(finalProfile);
      setCvSeaExp(mappedSeaExp);
      setCvCerts(finalCertificates);

    } catch (err: any) {
      console.error("Failed to fetch candidate profile:", err);
      setError(err.response?.data?.message || "Candidate profile not found or restricted.");
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchCandidateData();
  }, [fetchCandidateData]);

  if (isLoading) {
    return (
      <DashboardShell pageTitle="Loading Profile...">
        <div className="flex h-[70vh] flex-col items-center justify-center font-bold text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          Loading Deep Candidate Profile...
        </div>
      </DashboardShell>
    );
  }

  if (error || !candidateBasic) {
    return (
      <DashboardShell pageTitle="Profile Not Found">
         <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
           <div className="rounded-full bg-red-50 p-4">
             <ShieldCheck className="h-8 w-8 text-red-500" />
           </div>
           <p className="text-lg font-bold text-[#0F1E35]">{error || "Candidate profile not found or restricted."}</p>
           <Link href="/employer/dashboard/applications" className="text-sm font-bold text-blue-600 hover:underline">
             &larr; Go Back
           </Link>
         </div>
      </DashboardShell>
    );
  }

  const fullName = candidateBasic.name || "Unknown Seafarer";
  const userObjForCV = { name: fullName, email: candidateBasic.email, phone: candidateBasic.phone_number };

  // Derive deep data for left panel
  const latestVessel = cvSeaExp?.[0];
  const cocData = cvCerts?.find((c: any) => c.custom_name === 'COC');

  return (
    <DashboardShell pageTitle={`Profile: ${formatTitleCase(fullName)}`}>
      <div className="mb-6">
        <Link href="/employer/dashboard/applications" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0F1E35] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN: Deep Analytics Panel */}
        <div className="w-full lg:w-[350px] shrink-0 space-y-6 lg:sticky lg:top-24">
          
          <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-sm flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
                {cvProfile.photo_url ? (
                  <img src={cvProfile.photo_url} className="h-full w-full object-cover" alt="Profile" />
                ) : (
                  <span className="text-2xl font-black text-slate-400">{getInitials(fullName)}</span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-[#0F1E35] leading-tight">{formatTitleCase(fullName)}</h1>
                <p className="text-sm font-bold text-blue-600 mt-0.5">{cvProfile.applied_rank || "Rank Not Specified"}</p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Sea Time</p>
                 <p className="text-sm font-black text-slate-800 mt-1">
                   {calculateTotalSeaTime(cvSeaExp)}
                 </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nationality</p>
                 <p className="text-sm font-black text-slate-800 mt-1 flex items-center gap-1.5">
                   <MapPin className="h-3.5 w-3.5 text-slate-400"/>
                   {cvProfile.nationality || "N/A"}
                 </p>
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
                  <CredentialRow label="INDOS No." value={cvProfile?.indos_number} />
                  <CredentialRow label="Passport" value={cvProfile?.passport_number} />
                  <CredentialRow label="CDC" value={cvProfile?.cdc_number} />
                  <CredentialRow label="COC" value={cocData?.document_number} />
                  <CredentialRow label="US Visa" value={cvProfile?.has_us_visa ? "Yes (C1/D)" : "No"} />
               </div>
            </div>

            {/* Contact Details */}
            <div className="pt-4 border-t border-slate-100">
               <div className="space-y-2.5">
                 <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                   <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Mail className="h-3.5 w-3.5" /></div>
                   <span className="break-all">{candidateBasic.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                   <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Phone className="h-3.5 w-3.5" /></div>
                   <span>{candidateBasic.phone_number}</span>
                 </div>
               </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: The Virtual CV Document */}
        <div className="flex-1 bg-slate-100/50 p-6 rounded-[20px] border border-slate-200 flex justify-center shadow-inner overflow-hidden">
           <div className="w-full max-w-[210mm] shadow-xl bg-white scale-[0.85] sm:scale-100 origin-top">
             <ResumeTemplate 
                user={userObjForCV}
                profile={cvProfile}
                seaExperience={cvSeaExp}
                certificates={cvCerts}
             />
           </div>
        </div>

      </div>
    </DashboardShell>
  );
}
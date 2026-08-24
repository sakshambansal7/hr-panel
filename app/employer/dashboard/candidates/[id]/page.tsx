
// app/employer/dashboard/candidates/[id]/page.tsx



"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Anchor, FileText, Award } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";
import api from "../../../../lib/api";

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function CandidateProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: candidateId } = params;

  const [candidate, setCandidate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      setIsLoading(true);
      try {
        // Fetch candidate details from your backend
        const res = await api.get(`/candidates/${candidateId}`);
        setCandidate(res.data?.data);
      } catch (err) {
        console.error("Failed to fetch candidate profile", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidate();
  }, [candidateId]);

  if (isLoading) {
    return (
      <DashboardShell pageTitle="Loading Profile...">
        <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400 animate-pulse">
          Fetching Seafarer CV...
        </div>
      </DashboardShell>
    );
  }

  if (!candidate) {
    return (
      <DashboardShell pageTitle="Not Found">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-lg font-bold text-slate-500">Candidate profile not found or restricted.</p>
          <button onClick={() => router.back()} className="text-blue-600 font-bold underline">Go Back</button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell pageTitle={`CV: ${formatTitleCase(candidate.first_name)}`}>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0F1E35] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to ATS
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        
        {/* LEFT COLUMN: Main Profile Info */}
        <div className="space-y-6">
          
          {/* Header Card */}
          <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-sm flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0F1E35] text-3xl font-black text-white shadow-inner">
              {candidate.first_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-[#0F1E35]">
                  {formatTitleCase(candidate.first_name)} {formatTitleCase(candidate.last_name)}
                </h1>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 border border-blue-100">
                  Verified Profile
                </span>
              </div>
              <p className="text-sm font-medium text-[#0E8B61] mt-1">
                {formatTitleCase(candidate.rank || "Unspecified Rank")}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {formatTitleCase(candidate.city)}, {formatTitleCase(candidate.country)}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {candidate.email}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {candidate.phone_number || "Not Provided"}
                </div>
              </div>
            </div>
          </div>

          {/* Sea Service Section */}
          <div className="rounded-[20px] border border-[#E7EAF1] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[#E7EAF1] px-6 py-4 bg-slate-50/50 flex items-center gap-2">
              <Anchor className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-[#0F1E35]">Sea Service Experience</h2>
            </div>
            <div className="p-6 text-sm text-slate-600">
              <p>Experience details will be fetched from the sea_service table associated with Candidate ID #{candidate.candidate_id}.</p>
              {/* You can map over candidate.experience here once your backend joins that data! */}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Certifications & Actions */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Recruitment Actions</h2>
            <button className="w-full rounded-xl bg-[#F5B61A] py-3 text-sm font-bold text-[#0F1E35] transition-all hover:brightness-95 shadow-sm">
              Schedule Interview
            </button>
            <button className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-[#0F1E35] transition-colors hover:bg-slate-50">
              Download Full Resume (PDF)
            </button>
          </div>

          {/* Certifications & Documents */}
          <div className="rounded-[20px] border border-[#E7EAF1] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[#E7EAF1] px-5 py-4 bg-slate-50/50 flex items-center gap-2">
              <Award className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-[#0F1E35]">Certifications</h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Example dynamic UI for documents */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs font-bold text-[#0F1E35]">STCW Basic Safety</p>
                    <p className="text-[10px] font-medium text-slate-500">Valid till 2028</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Verified</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs font-bold text-[#0F1E35]">CDC / Seaman Book</p>
                    <p className="text-[10px] font-medium text-slate-500">IND1234567</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Verified</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}
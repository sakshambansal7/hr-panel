// app/employer/dashboard/post-job/page.tsx

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { useAuth } from "../../../context/auth-context";
import { getCompanyProfile } from "../../../lib/company-profile-store";
import api from "../../../lib/api"; 

// 🚀 FALLBACKS (Just in case your database is completely empty on day 1)
const FALLBACK_DEPARTMENTS = ["Deck", "Engine", "Catering", "Electrical", "Shore"];
const FALLBACK_RANKS = ["Master", "Chief Officer", "Chief Engineer", "2nd Engineer", "AB", "Oiler"];
const FALLBACK_VESSELS = ["Oil Tanker", "Chemical Tanker", "Bulk Carrier", "Container Ship", "OSV"];

const SHIP_TYPES = [
  { label: "Mainfleet", value: "mainfleet" },
  { label: "Offshore", value: "offshore" },
  { label: "Shore", value: "shore" },
  { label: "Cruise", value: "cruise" },
];

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode; }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
        {label}
        {required && <span className="ml-0.5 text-[#F5B61A]">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-[#E7EAF1] bg-white py-3 px-4 text-sm text-[#0F1E35] placeholder:text-slate-400 transition-all duration-200 focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5 rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)]">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </div>
  );
}

export default function PostJobPage() {
  const { user } = useAuth();
  const router = useRouter();

  // 🚀 DYNAMIC STATE (Populated from your Database Matrix)
  const [dynamicDepartments, setDynamicDepartments] = useState<string[]>(FALLBACK_DEPARTMENTS);
  const [dynamicVessels, setDynamicVessels] = useState<string[]>(FALLBACK_VESSELS);
  const [dynamicRanks, setDynamicRanks] = useState<string[]>(FALLBACK_RANKS);

  // Form State
  const [title, setTitle] = useState("");
  const [shipType, setShipType] = useState<string>(SHIP_TYPES[0].value);
  const [rank, setRank] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [vesselType, setVesselType] = useState<string>("");
  const [contractLength, setContractLength] = useState("6 months");
  const [description, setDescription] = useState("");

  const [itfApproved, setItfApproved] = useState(true);
  const [rpslValid, setRpslValid] = useState(true);

  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);
  const [companyId, setCompanyId] = useState<number>(1);

  const isVerified = useMemo(
    () => (user ? Boolean(getCompanyProfile(user.email).verified) : false),
    [user]
  );

  // 🚀 FETCH DYNAMIC FILTERS FROM YOUR MATRIX ENDPOINT
  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        // Tries standard mounting points based on your router file
        let res;
        try {
          res = await api.get("/filters");
        } catch {
          res = await api.get("/filters");
        }

        const data = res.data?.data || res.data;
        
        let deps = new Set<string>();
        let vessels = new Set<string>();
        let ranks = new Set<string>();

        // Extracting data based on your specific SQL DISTINCT query shape
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (item.department) deps.add(item.department);
            if (item.vessel_type) vessels.add(item.vessel_type);
            if (item.rank || item.job_rank) ranks.add(item.rank || item.job_rank);
          });
        }

        if (deps.size > 0) setDynamicDepartments(Array.from(deps));
        if (vessels.size > 0) setDynamicVessels(Array.from(vessels));
        if (ranks.size > 0) setDynamicRanks(Array.from(ranks));

        // Auto-select first options to prevent empty submissions
        if (deps.size > 0) setDepartment(Array.from(deps)[0]);
        if (vessels.size > 0) setVesselType(Array.from(vessels)[0]);
        if (ranks.size > 0) setRank(Array.from(ranks)[0]);

      } catch (err) {
        console.error("Failed to fetch dynamic matrix", err);
        // Fallbacks stay active if the DB fetch fails
        setDepartment(FALLBACK_DEPARTMENTS[0]);
        setVesselType(FALLBACK_VESSELS[0]);
        setRank(FALLBACK_RANKS[0]);
      }
    };
    fetchMatrix();
  }, []);

  // Fetch Company ID
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user?.email) return;
      try {
        const res = await api.get("/companies/dropdown");
        let comps = Array.isArray(res.data?.data?.data) ? res.data.data.data : Array.isArray(res.data?.data) ? res.data.data : res.data;
        const myComp = comps.find((c: any) => c.email?.toLowerCase() === user.email.toLowerCase());
        if (myComp && myComp.id) setCompanyId(myComp.id);
      } catch (err) {
        console.error("Failed to fetch company ID", err);
      }
    };
    fetchCompanyId();
  }, [user]);

  // 🚀 CONDITIONAL LOGIC FLAGS
  const showVesselType = shipType !== "shore" && shipType !== "cruise";
  const showRank = shipType !== "shore";

  // Compute final values for payload & preview based on conditional flags
  const finalVesselType = showVesselType ? vesselType : "N/A";
  const finalRank = showRank ? rank : "Shore Staff";

  function buildPayload(statusOverride?: string) {
    const specificsArray = [
      title ? `Title: ${title.trim()}` : "",
      itfApproved ? "ITF Approved" : "",
      rpslValid ? "RPSL Valid" : ""
    ].filter(Boolean);

    return {
      company_id: companyId, 
      job_type: shipType === "shore" ? "shore" : "engineer",
      rank: finalRank, // Injected conditionally
      department: department,
      vessel_type: finalVesselType, // Injected conditionally
      ship_type: shipType, 
      contract: contractLength.trim() || "TBD",
      requirement_description: description.trim() || "Standard experience required.",
      position_specifics: specificsArray.join(" | ") || "Standard terms.",
      status: statusOverride || (isVerified ? "active" : "pending")
    };
  }

  async function handleSaveDraft() {
    if (!user) return;
    setSubmitting("draft");
    try {
      await api.post("/jobs", buildPayload("draft"));
      router.push("/employer/dashboard/jobs");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save draft.");
      setSubmitting(null);
    }
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting("publish");
    try {
      await api.post("/jobs", buildPayload());
      router.push("/employer/dashboard/jobs");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to publish job.");
      setSubmitting(null);
    }
  }

  return (
    <DashboardShell pageTitle="Post New Job">
      <form onSubmit={handlePublish} className="space-y-1">
        <div className="mb-5 space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
            Post New Job
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
            Create a Maritime Job Vacancy
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <SectionCard title="Job Details">
              <Field label="Job info (Internal)">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. AB required for Container"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Ship Type" required>
                  <select value={shipType} onChange={(e) => setShipType(e.target.value)} className={inputClass}>
                    {SHIP_TYPES.map((st) => (
                      <option key={st.value} value={st.value}>{st.label}</option>
                    ))}
                  </select>
                </Field>
                
                {/* 🚀 CONDITIONAL VESSEL TYPE */}
                {showVesselType && (
                  <Field label="Vessel Type" required>
                    <select value={vesselType} onChange={(e) => setVesselType(e.target.value)} className={inputClass}>
                      {dynamicVessels.map((v) => (
                        <option key={v} value={v}>{formatTitleCase(v)}</option>
                      ))}
                    </select>
                  </Field>
                )}

                {/* 🚀 CONDITIONAL RANK */}
                {showRank && (
                  <Field label="Rank" required>
                    <select value={rank} onChange={(e) => setRank(e.target.value)} className={inputClass}>
                      {dynamicRanks.map((r) => (
                        <option key={r} value={r}>{formatTitleCase(r)}</option>
                      ))}
                    </select>
                  </Field>
                )}

                <Field label="Department" required>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass}>
                    {dynamicDepartments.map((d) => (
                      <option key={d} value={d}>{formatTitleCase(d)}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Contract Length">
                  <input value={contractLength} onChange={(e) => setContractLength(e.target.value)} className={inputClass} placeholder="6 months" />
                </Field>
              </div>

              <Field label="Job Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={inputClass}
                  placeholder="Role summary, responsibilities, and requirements…"
                />
              </Field>
            </SectionCard>

            <SectionCard title="Compliance">
              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={itfApproved} onChange={(e) => setItfApproved(e.target.checked)} className="h-4 w-4 rounded border-[#E7EAF1] text-[#F5B61A] focus:ring-[#F5B61A] cursor-pointer" />
                  ITF Approved
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={rpslValid} onChange={(e) => setRpslValid(e.target.checked)} className="h-4 w-4 rounded border-[#E7EAF1] text-[#F5B61A] focus:ring-[#F5B61A] cursor-pointer" />
                  RPSL Valid
                </label>
              </div>
            </SectionCard>
          </div>

          {/* Preview & Publish */}
          <div className="lg:sticky lg:top-[86px] lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5 rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
            >
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Preview &amp; Publish
              </h2>

              <div className="rounded-2xl border border-[#E7EAF1] bg-[#F8FAFC] p-4">
                <p className="text-sm font-bold text-[#0F1E35]">
                  {title || `${formatTitleCase(finalRank)} required for ${formatTitleCase(finalVesselType)}`}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatTitleCase(finalRank)} · {formatTitleCase(department)} · {formatTitleCase(finalVesselType)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Contract: {contractLength || "TBD"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {itfApproved && (
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      ITF Approved
                    </span>
                  )}
                  {rpslValid && (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      RPSL Valid
                    </span>
                  )}
                </div>
              </div>

              {!isVerified && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-700">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                  If your company is not verified yet, the job will be saved as Pending Approval and go live after verification.
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={submitting !== null}
                  className="rounded-2xl bg-[#F5B61A] py-3 text-sm font-bold text-[#0F1E35] shadow-lg shadow-[#F5B61A]/20 transition-all hover:brightness-95 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting === "publish" ? "Publishing..." : "Publish Job"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={submitting !== null}
                  className="rounded-2xl border border-[#E7EAF1] py-3 text-sm font-bold text-[#0F1E35] transition-colors hover:bg-slate-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting === "draft" ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/employer/dashboard/jobs")}
                  className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-500 hover:text-[#0F1E35] cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  Back
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </form>
    </DashboardShell>
  );
}
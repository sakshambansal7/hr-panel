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

const CURRENCIES = ["USD", "INR", "EUR", "GBP", "SGD"];
const DEPARTMENTS = ["Deck", "Engine", "Catering", "Electrical", "Shore"];
const RANKS = [
  "Master", "Chief Officer", "2nd Officer", "3rd Officer", "Deck Cadet",
  "Chief Engineer", "2nd Engineer", "3rd Engineer", "4th Engineer", "Engine Cadet",
  "ETO", "AB", "OS", "Oiler", "Wiper", "Chief Cook", "General Steward"
];

// Dynamic Ship and Vessel Types
const SHIP_TYPES = [
  { label: "Mainfleet", value: "mainfleet" },
  { label: "Offshore", value: "offshore" },
  { label: "Shore", value: "shore" },
  { label: "Cruise", value: "cruise" },
];

const MAINFLEET_VESSELS = [
  "Oil Tanker", "Chemical Tanker", "Gas Carrier (LPG/LNG)", "Container Ship",
  "Bulk Carrier", "General Cargo", "Ro-Ro Vessel", "Pure Car Carrier (PCC)",
];

const OFFSHORE_VESSELS = [
  "Anchor Handling Tug Supply (AHTS)", "Platform Supply Vessel (PSV)", 
  "Offshore Support Vessel (OSV)", "Crew Boat", "DP Vessel", "Dredger", "Tugboat"
];

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

  const [title, setTitle] = useState("");
  const [rank, setRank] = useState<string>(RANKS[0]);
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  
  const [shipType, setShipType] = useState<string>(SHIP_TYPES[0].value);
  const [vesselType, setVesselType] = useState<string>(MAINFLEET_VESSELS[0]);
  
  const [contractLength, setContractLength] = useState("6 months");
  const [joiningDate, setJoiningDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [salaryNegotiable, setSalaryNegotiable] = useState(false);
  const [overtimeDetails, setOvertimeDetails] = useState("");
  const [contractTerms, setContractTerms] = useState("");
  const [itfApproved, setItfApproved] = useState(false);
  const [rpslValid, setRpslValid] = useState(false);

  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);
  const [companyId, setCompanyId] = useState<number>(1);

  const isVerified = useMemo(
    () => (user ? Boolean(getCompanyProfile(user.email).verified) : false),
    [user]
  );

  const currencySymbol = currency === "USD" ? "$" : currency === "INR" ? "₹" : currency + " ";

  // Dynamically change Vessel options based on Ship Type selection
  const currentVesselOptions = shipType === "mainfleet" ? MAINFLEET_VESSELS : OFFSHORE_VESSELS;

  const handleShipTypeChange = (newShipType: string) => {
    setShipType(newShipType);
    if (newShipType === "mainfleet") setVesselType(MAINFLEET_VESSELS[0]);
    else if (newShipType === "offshore") setVesselType(OFFSHORE_VESSELS[0]);
    else if (newShipType === "shore") setVesselType("Shore Operations");
    else setVesselType("Cruise Liner");
  };

  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user?.email) return;
      try {
        const res = await api.get("/companies/dropdown");
        let comps = [];
        const responseData = res.data;
        
        // Aggressive extraction
        if (responseData && Array.isArray(responseData)) comps = responseData;
        else if (responseData?.data && Array.isArray(responseData.data)) comps = responseData.data;
        else if (responseData?.data?.data && Array.isArray(responseData.data.data)) comps = responseData.data.data;
        
        const myComp = comps.find((c: any) => c.email?.toLowerCase() === user.email.toLowerCase());
        if (myComp && myComp.id) {
          setCompanyId(myComp.id);
        }
      } catch (err) {
        console.error("Failed to fetch company ID", err);
      }
    };
    fetchCompanyId();
  }, [user]);

  function buildPayload(statusOverride?: string) {
    const specificsArray = [
      title ? `Title: ${title.trim()}` : "",
      salaryFrom || salaryTo ? `Salary: ${currencySymbol}${salaryFrom}-${salaryTo} ${salaryNegotiable ? '(Negotiable)' : ''}` : "",
      joiningDate ? `Joining: ${joiningDate}` : "",
      location ? `Location: ${location.trim()}` : "",
      overtimeDetails ? `OT: ${overtimeDetails.trim()}` : "",
      contractTerms ? `Terms: ${contractTerms.trim()}` : ""
    ].filter(Boolean);

    return {
      company_id: companyId, 
      job_type: department.toLowerCase() === "shore" ? "shore" : "engineer",
      rank: rank,
      department: department,
      vessel_type: vesselType,
      ship_type: shipType, 
      contract: contractLength.trim() || "TBD",
      requirement_description: description.trim() || "Standard rank experience required.",
      position_specifics: specificsArray.join(" | ") || "Immediate joining.",
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
              <Field label="Job Title (Internal)">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. AB required for Container"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Ship Type" required>
                  <select value={shipType} onChange={(e) => handleShipTypeChange(e.target.value)} className={inputClass}>
                    {SHIP_TYPES.map((st) => (
                      <option key={st.value} value={st.value}>{st.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Vessel Type" required>
                  {shipType === "shore" || shipType === "cruise" ? (
                    <input type="text" value={vesselType} disabled className={`${inputClass} bg-slate-50 text-slate-500 font-bold`} />
                  ) : (
                    <select value={vesselType} onChange={(e) => setVesselType(e.target.value)} className={inputClass}>
                      {currentVesselOptions.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  )}
                </Field>

                <Field label="Rank" required>
                  <select value={rank} onChange={(e) => setRank(e.target.value)} className={inputClass}>
                    {RANKS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Department" required>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass}>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Contract Length">
                  <input value={contractLength} onChange={(e) => setContractLength(e.target.value)} className={inputClass} placeholder="6 months" />
                </Field>
                <Field label="Joining Date">
                  <input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} className={inputClass} />
                </Field>
              </div>

              <Field label="Location">
                <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="Mumbai, India" />
              </Field>

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

            <SectionCard title="Salary & Terms">
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Salary From">
                  <input type="number" min={0} value={salaryFrom} onChange={(e) => setSalaryFrom(e.target.value)} className={inputClass} placeholder="0" />
                </Field>
                <Field label="Salary To">
                  <input type="number" min={0} value={salaryTo} onChange={(e) => setSalaryTo(e.target.value)} className={inputClass} placeholder="0" />
                </Field>
                <Field label="Currency">
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Overtime Details">
                  <input value={overtimeDetails} onChange={(e) => setOvertimeDetails(e.target.value)} className={inputClass} placeholder="e.g. Fixed OT included" />
                </Field>
                <Field label="Contract Terms">
                  <input value={contractTerms} onChange={(e) => setContractTerms(e.target.value)} className={inputClass} placeholder="e.g. As per CBA" />
                </Field>
              </div>

              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={salaryNegotiable} onChange={(e) => setSalaryNegotiable(e.target.checked)} className="h-4 w-4 rounded border-[#E7EAF1] text-[#F5B61A] focus:ring-[#F5B61A] cursor-pointer" />
                  Salary Negotiable
                </label>
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
                  {title || `${rank} required for ${vesselType}`}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {rank} · {department} · {vesselType}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {contractLength || "TBD"} · Joining {joiningDate || "TBD"} · {location || "TBD"}
                </p>
                <p className="mt-2 text-sm font-bold text-[#0E8B61]">
                  {currencySymbol}{salaryFrom || 0} - {currencySymbol}{salaryTo || 0}
                  {salaryNegotiable && <span className="ml-1.5 text-xs font-medium text-slate-400">(Negotiable)</span>}
                </p>
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
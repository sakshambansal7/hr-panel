// app/employer/dashboard/post-job/page.tsx
// app/employer/dashboard/post-job/page.tsx

// app/employer/dashboard/post-job/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert, Ship, Briefcase, Plus, Trash2, CheckCircle2 } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { useAuth } from "../../../context/auth-context";
import { getCompanyProfile } from "../../../lib/company-profile-store";
import api from "../../../lib/api"; 

const inputClass =
  "w-full rounded-xl border border-[#E7EAF1] bg-white py-2.5 px-4 text-sm text-[#0F1E35] placeholder:text-slate-400 transition-all duration-200 focus:border-[#F5B61A] focus:outline-none focus:ring-2 focus:ring-[#F5B61A]/20";

const SHIP_TYPES = [
  { label: "Mainfleet", value: "mainfleet" },
  { label: "Offshore", value: "offshore" },
  { label: "Shore", value: "shore" },
  { label: "Cruise", value: "cruise" },
];

const FALLBACK_DEPARTMENTS = ["Deck", "Engine", "Catering", "Electrical"];
const RANKS_BY_DEPT: Record<string, string[]> = {
  Deck: ["Master", "Chief Officer", "2nd Officer", "3rd Officer", "Deck Cadet", "Able Seaman", "Ordinary Seaman"],
  Engine: ["Chief Engineer", "2nd Engineer", "3rd Engineer", "4th Engineer", "Engine Cadet", "ETO", "Fitter", "Oiler", "Wiper"],
  Catering: ["Chief Cook", "General Steward"],
  Electrical: ["ETO", "Electrician"],
};

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

interface PositionEntry {
  id: string;
  department: string;
  rank: string;
  title: string;
  requirements: string;
}

interface VesselGroup {
  id: string;
  vesselName: string;
  positions: PositionEntry[];
}

export default function UnifiedPostJobPage() {
  const { user } = useAuth();
  const router = useRouter();

  // API Driven States
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [vesselOptions, setVesselOptions] = useState<string[]>([]);
  const [companyId, setCompanyId] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<"draft" | "publish" | null>(null);

  const isVerified = useMemo(() => (user ? Boolean(getCompanyProfile(user.email).verified) : false), [user]);

  // Form States
  const [shipType, setShipType] = useState<string>("mainfleet");
  const [contractLength, setContractLength] = useState("6 Months");
  const [commonRequirements, setCommonRequirements] = useState("");
  const [itfApproved, setItfApproved] = useState(true);
  const [rpslValid, setRpslValid] = useState(true);

  // 🚀 THE NESTED ARRAY STATE (Matches your screenshot logic)
  const [vessels, setVessels] = useState<VesselGroup[]>([{
    id: `vessel-${Date.now()}`,
    vesselName: "",
    positions: [{ id: `pos-${Date.now()}`, department: "", rank: "", title: "", requirements: "" }]
  }]);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await api.get("/filters");
        const data = res.data?.data || res.data;
        if (data.departments) setDepartmentsList(data.departments);
        
        let vList: string[] = [];
        if (data.vessel_types) vList = data.vessel_types.map((v: any) => v.name || v);
        else if (data.vessels) vList = data.vessels.map((v: any) => v.name || v);
        if (vList.length > 0) setVesselOptions(vList);
      } catch (err) {
        console.error("Failed to fetch filters", err);
      }
    };
    fetchMatrix();
  }, []);

  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user?.email) return;
      try {
        const res = await api.get("/companies/dropdown");
        let comps = Array.isArray(res.data?.data?.data) ? res.data.data.data : Array.isArray(res.data?.data) ? res.data.data : res.data;
        const myComp = comps.find((c: any) => c.email?.toLowerCase() === user.email.toLowerCase());
        if (myComp && myComp.id) setCompanyId(myComp.id);
      } catch (err) {}
    };
    fetchCompanyId();
  }, [user]);

  // --- UI LOGIC HANDLERS ---
  const handleShipTypeChange = (val: string) => {
    setShipType(val);
    // Reset form cleanly when ship type changes
    setVessels([{
      id: `vessel-${Date.now()}`,
      vesselName: val === "shore" ? "Shore Operations" : "",
      positions: [{ id: `pos-${Date.now()}`, department: val === "shore" ? "Shore" : "", rank: "", title: "", requirements: "" }]
    }]);
  };

  const addVessel = () => {
    setVessels([...vessels, {
      id: `vessel-${Date.now()}`,
      vesselName: "",
      positions: [{ id: `pos-${Date.now()}`, department: "", rank: "", title: "", requirements: "" }]
    }]);
  };

  const removeVessel = (id: string) => {
    setVessels(vessels.filter(v => v.id !== id));
  };

  const addPosition = (vesselId: string) => {
    setVessels(vessels.map(v => v.id === vesselId ? {
      ...v, positions: [...v.positions, { id: `pos-${Date.now()}`, department: shipType === "shore" ? "Shore" : "", rank: "", title: "", requirements: "" }]
    } : v));
  };

  const removePosition = (vesselId: string, posId: string) => {
    setVessels(vessels.map(v => v.id === vesselId ? {
      ...v, positions: v.positions.filter(p => p.id !== posId)
    } : v));
  };

  const updatePosition = (vesselId: string, posId: string, key: keyof PositionEntry, val: string) => {
    setVessels(vessels.map(v => v.id === vesselId ? {
      ...v, positions: v.positions.map(p => {
        if (p.id !== posId) return p;
        const updated = { ...p, [key]: val };
        // Auto-reset rank and title if department changes
        if (key === "department") { updated.rank = ""; updated.title = ""; }
        // Auto-fill title if rank changes
        if (key === "rank" && shipType !== "shore") { updated.title = val; }
        return updated;
      })
    } : v));
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent, statusOverride?: string) => {
    e.preventDefault();
    if (!companyId) return alert("Company Profile not found. Please setup your profile first.");

    let totalPositions = 0;
    const jobPayloads: any[] = [];

    // Loop through nested UI to build flat payloads
    for (const vessel of vessels) {
      if (shipType !== "shore" && !vessel.vesselName) return alert("Please select a Vessel Type for all groups.");
      
      for (const pos of vessel.positions) {
        if (!pos.department || (!pos.rank && shipType !== 'shore') || !pos.title) {
          return alert(`Please fill all required fields (Department, Rank, Title) for ${vessel.vesselName || 'Shore'}`);
        }

        const specifics = [
          itfApproved ? "ITF Approved" : "",
          rpslValid ? "RPSL Valid" : "",
          pos.requirements ? `Specifics: ${pos.requirements}` : ""
        ].filter(Boolean).join(" | ");

        jobPayloads.push({
          company_id: companyId,
          job_type: shipType === "shore" ? "shore" : "engineer",
          rank: pos.rank || pos.title,
          department: pos.department,
          vessel_type: shipType === "shore" ? "Shore Facility" : vessel.vesselName,
          ship_type: shipType,
          contract: contractLength || "TBD",
          requirement_description: commonRequirements || "Standard requirements apply.",
          position_specifics: specifics || "Standard terms.",
          status: statusOverride || (isVerified ? "active" : "pending")
        });
        totalPositions++;
      }
    }

    if (jobPayloads.length === 0) return alert("Please add at least one position.");

    try {
      setIsSubmitting(statusOverride === "draft" ? "draft" : "publish");
      // Fire all posts in parallel (Standard API behavior)
      await Promise.all(jobPayloads.map(payload => api.post("/jobs", payload)));
      alert(`Successfully processed ${totalPositions} job position(s)!`);
      router.push("/employer/dashboard/jobs");
    } catch (err: any) {
      alert(err.response?.data?.message || "An error occurred while posting jobs.");
    } finally {
      setIsSubmitting(null);
    }
  };

  const showVesselDropdown = shipType !== "shore";
  const totalPositionsCount = vessels.reduce((acc, v) => acc + v.positions.length, 0);

  return (
    <DashboardShell pageTitle="Post Job Vacancies">
      <form onSubmit={(e) => handleSubmit(e, "active")} className="space-y-6 max-w-5xl">
        
        {/* Header */}
        <div className="mb-6 border-b border-[#E7EAF1] pb-5">
          <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase block">
            Recruitment
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
            Publish Job Positions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Add a single vacancy or create bulk positions across multiple vessels.
          </p>
        </div>

        {/* --- GLOBAL SETTINGS (Applies to all positions) --- */}
        <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)] space-y-5">
          <h2 className="text-sm font-bold text-[#0F1E35] uppercase tracking-wide flex items-center gap-2 border-b border-[#E7EAF1] pb-3">
            <Briefcase className="w-4 h-4 text-[#F5B61A]" /> Global Contract Details
          </h2>
          
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase mb-1.5 block">Ship Type *</label>
              <select value={shipType} onChange={(e) => handleShipTypeChange(e.target.value)} className={inputClass}>
                {SHIP_TYPES.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase mb-1.5 block">Contract Length</label>
              <input value={contractLength} onChange={(e) => setContractLength(e.target.value)} placeholder="e.g. 6 Months" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase mb-1.5 block">Common Requirements (Applies to all)</label>
            <textarea rows={2} value={commonRequirements} onChange={(e) => setCommonRequirements(e.target.value)} placeholder="e.g. US Visa required for all crew, immediate joining..." className={inputClass} />
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={itfApproved} onChange={(e) => setItfApproved(e.target.checked)} className="h-4 w-4 rounded border-[#E7EAF1] text-[#F5B61A] focus:ring-[#F5B61A]" />
              ITF Approved
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={rpslValid} onChange={(e) => setRpslValid(e.target.checked)} className="h-4 w-4 rounded border-[#E7EAF1] text-[#F5B61A] focus:ring-[#F5B61A]" />
              RPSL Valid
            </label>
          </div>
        </div>

        {/* --- DYNAMIC VESSEL & POSITIONS SECTION --- */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-[#0F1E35] flex items-center gap-2">
            Job Positions <span className="text-red-500">*</span>
          </h2>

          {vessels.map((vessel, vIndex) => (
            <div key={vessel.id} className="rounded-2xl border-l-4 border-l-[#0F1E35] border border-[#E7EAF1] bg-white p-6 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-2">
              
              {/* Vessel Header */}
              {showVesselDropdown ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7EAF1] pb-4">
                  <div className="flex-1 max-w-md">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Vessel Type *</label>
                    <select required value={vessel.vesselName} onChange={(e) => setVessels(vessels.map(v => v.id === vessel.id ? { ...v, vesselName: e.target.value } : v))} className={inputClass}>
                      <option value="" disabled>Select Vessel Type...</option>
                      {vesselOptions.length > 0 
                        ? vesselOptions.map((opt, i) => <option key={i} value={opt}>{formatTitleCase(opt)}</option>)
                        : ["Oil Tanker", "Chemical Tanker", "Bulk Carrier"].map(o => <option key={o} value={o}>{o}</option>)
                      }
                    </select>
                  </div>
                  {vessels.length > 1 && (
                    <button type="button" onClick={() => removeVessel(vessel.id)} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove Group
                    </button>
                  )}
                </div>
              ) : (
                <div className="border-b border-[#E7EAF1] pb-3">
                  <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">Shore / Facility Category</span>
                </div>
              )}

              {/* Positions List */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#0F1E35] uppercase tracking-wide">Positions in this group:</p>
                
                {vessel.positions.map((pos, pIndex) => (
                  <div key={pos.id} className="relative bg-[#F8FAFC] p-5 rounded-xl border border-[#E7EAF1] space-y-4">
                    {vessel.positions.length > 1 && (
                      <button type="button" onClick={() => removePosition(vessel.id, pos.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="grid gap-4 sm:grid-cols-3 pr-6 sm:pr-0">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Department *</label>
                        {shipType === "shore" ? (
                          <input type="text" value="Shore" disabled className="w-full rounded-xl border border-[#E7EAF1] bg-slate-100 py-2.5 px-4 text-sm text-slate-500 font-bold" />
                        ) : (
                          <select required value={pos.department} onChange={(e) => updatePosition(vessel.id, pos.id, "department", e.target.value)} className={inputClass}>
                            <option value="" disabled>Select Dept...</option>
                            {departmentsList.length > 0 
                              ? departmentsList.map((d: any, i) => <option key={i} value={d.name || d}>{formatTitleCase(d.name || d)}</option>)
                              : FALLBACK_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)
                            }
                          </select>
                        )}
                      </div>

                      {shipType !== "shore" && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Rank *</label>
                          <select required value={pos.rank} onChange={(e) => updatePosition(vessel.id, pos.id, "rank", e.target.value)} className={inputClass} disabled={!pos.department}>
                            <option value="" disabled>{pos.department ? "Select Rank..." : "Select Dept First"}</option>
                            {(RANKS_BY_DEPT[pos.department] || []).map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      )}

                      <div className={shipType === "shore" ? "sm:col-span-2" : ""}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Position Title *</label>
                        <input required type="text" value={pos.title} onChange={(e) => updatePosition(vessel.id, pos.id, "title", e.target.value)} placeholder={shipType === "shore" ? "e.g. Marine Superintendent" : "Auto-fills from Rank"} className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Position Specific Requirements (Optional)</label>
                      <input type="text" value={pos.requirements} onChange={(e) => updatePosition(vessel.id, pos.id, "requirements", e.target.value)} placeholder="e.g. Needs DP Maintenance certificate..." className={inputClass} />
                    </div>
                  </div>
                ))}

                <button type="button" onClick={() => addPosition(vessel.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#0F1E35]/30 bg-blue-50/50 px-5 py-2.5 text-xs font-bold text-[#0F1E35] hover:bg-blue-50 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Position
                </button>
              </div>
            </div>
          ))}

          {showVesselDropdown && (
            <div className="flex justify-center pt-2">
              <button type="button" onClick={addVessel} className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1E35] bg-white px-6 py-3 text-sm font-bold text-[#0F1E35] hover:bg-[#0F1E35] hover:text-white transition-all shadow-sm">
                <Ship className="w-4 h-4" /> Add Another Vessel Group
              </button>
            </div>
          )}
        </div>

        {/* --- SUBMIT FOOTER --- */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between rounded-t-2xl border-t border-[#E7EAF1] bg-white/80 backdrop-blur-md p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] mt-10">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-500">Ready to publish</p>
            <p className="text-sm font-extrabold text-[#0F1E35]"><span className="text-[#F5B61A]">{totalPositionsCount}</span> Position(s)</p>
          </div>
          
          <div className="flex w-full sm:w-auto gap-3">
            <button type="button" onClick={(e) => handleSubmit(e, "draft")} disabled={isSubmitting !== null} className="flex-1 sm:flex-none rounded-xl border border-[#E7EAF1] bg-white px-6 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
              {isSubmitting === "draft" ? "Saving..." : "Save Draft"}
            </button>
            <button type="submit" disabled={isSubmitting !== null} className="flex-1 sm:flex-none rounded-xl bg-[#F5B61A] px-8 py-3 text-sm font-bold text-[#0F1E35] shadow-lg shadow-[#F5B61A]/20 hover:brightness-95 transition-all disabled:opacity-50">
              {isSubmitting === "publish" ? "Publishing..." : "Publish Jobs"}
            </button>
          </div>
        </div>

      </form>
    </DashboardShell>
  );
}
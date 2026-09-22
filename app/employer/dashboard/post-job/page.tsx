// app/employer/dashboard/post-job/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ship,
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
  Wand2,
  Settings2,
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { useAuth } from "../../../context/auth-context";
import api from "../../../lib/api";

const inputClass =
  "w-full rounded-xl border border-[#E7EAF1] bg-white py-2.5 px-4 text-sm text-[#0F1E35] placeholder:text-slate-400 transition-all duration-200 focus:border-[#F5B61A] focus:outline-none focus:ring-2 focus:ring-[#F5B61A]/20";

const SHIP_TYPES = [
  { label: "Mainfleet", value: "mainfleet" },
  { label: "Offshore", value: "offshore" },
  { label: "Shore", value: "shore" },
  { label: "Cruise", value: "cruise" },
];

const MAINFLEET_VESSELS = [
  "Bulk Carrier",
  "General Cargo",
  "Ro-Ro Vessel",
  "Pure Car Carrier (PCC)",
];

const OFFSHORE_VESSELS = [
  "Anchor Handling Tug Supply (AHTS)",
  "Platform Supply Vessel (PSV)",
  "Offshore Support Vessel (OSV)",
  "Crew Boat",
  "DP Vessel",
  "Dredger",
  "Tugboat",
  "Accommodation Barge",
];

const FALLBACK_DEPARTMENTS = ["Deck", "Engine", "Catering", "Electrical"];

const RANKS_BY_DEPT: Record<string, string[]> = {
  Deck: [
    "Master",
    "Chief Officer",
    "2nd Officer",
    "3rd Officer",
    "Deck Cadet",
    "Able Seaman",
    "Ordinary Seaman",
  ],
  Engine: [
    "Chief Engineer",
    "2nd Engineer",
    "3rd Engineer",
    "4th Engineer",
    "Engine Cadet",
    "ETO",
    "Fitter",
    "Oiler",
    "Wiper",
  ],
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
  salary: string;
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

  const [entryMode, setEntryMode] = useState<"smart" | "manual">("smart");

  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [vesselOptions, setVesselOptions] = useState<string[]>([]);

  // company_id is optional — backend fills it from user_details if not sent
  const [companyId, setCompanyId] = useState<number | null>(
    (user as any)?.company_id ??
      (user as any)?.companyId ??
      (user as any)?.details?.company_id ??
      null
  );

  const [isSubmitting, setIsSubmitting] = useState<
    "smart" | "publish" | null
  >(null);

  const [rawVacancyText, setRawVacancyText] = useState("");
  const [smartSuccess, setSmartSuccess] = useState(false);

  // ── Manual builder state ──
  const [shipType, setShipType] = useState<string>("mainfleet");
  const [joiningDate, setJoiningDate] = useState("Immediate");
  const [commonRequirements, setCommonRequirements] = useState(
    "Looking for an experienced officer with minimum 12 months rank experience."
  );

  const [vessels, setVessels] = useState<VesselGroup[]>([
    {
      id: `vessel-${Date.now()}`,
      vesselName: "Bulk Carrier",
      positions: [
        {
          id: `pos-${Date.now()}`,
          department: "",
          rank: "",
          title: "",
          salary: "",
          requirements: "US Visa required, immediate joining.",
        },
      ],
    },
  ]);

  const totalPositionsCount = useMemo(
    () => vessels.reduce((acc, v) => acc + v.positions.length, 0),
    [vessels]
  );

  // ── Load filter matrix ──
  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await api.get("/filters");
        const data = res.data?.data || res.data;
        if (data.departments) setDepartmentsList(data.departments);

        let vList: string[] = [];
        if (data.vessel_types)
          vList = data.vessel_types.map((v: any) => v.name || v);
        else if (data.vessels)
          vList = data.vessels.map((v: any) => v.name || v);

        if (vList.length > 0) setVesselOptions(vList);
      } catch (err) {
        console.error("Failed to fetch filters", err);
      }
    };
    fetchMatrix();
  }, []);

  // ── Best-effort fallback: only if session didn't carry company_id ──
  useEffect(() => {
    if (companyId) return;
    if (!user?.email) return;

    (async () => {
      try {
        const res = await api.get("/companies/dropdown");
        const raw =
          res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
        const arr = Array.isArray(raw) ? raw : [];
        const match = arr.find(
          (c: any) =>
            String(c.email || "").toLowerCase() === user.email.toLowerCase()
        );
        if (match?.id) setCompanyId(Number(match.id));
      } catch (err) {
        // Silent — backend will resolve company_id anyway
        console.warn("Company fallback lookup skipped:", err);
      }
    })();
  }, [user, companyId]);

  // ── Ship type change → reset vessels ──
  const handleShipTypeChange = (val: string) => {
    setShipType(val);

    let defaultVessel = "";
    if (val === "mainfleet") defaultVessel = "Bulk Carrier";
    else if (val === "offshore") defaultVessel = "Platform Supply Vessel (PSV)";
    else if (val === "shore") defaultVessel = "Shore Operations";
    else defaultVessel = "Cruise Liner";

    setVessels([
      {
        id: `vessel-${Date.now()}`,
        vesselName: defaultVessel,
        positions: [
          {
            id: `pos-${Date.now()}`,
            department: "",
            rank: "",
            title: "",
            salary: "",
            requirements: "",
          },
        ],
      },
    ]);
  };

  const addVessel = () =>
    setVessels((prev) => [
      ...prev,
      {
        id: `vessel-${Date.now()}`,
        vesselName:
          shipType === "mainfleet"
            ? "Container Ship"
            : "Offshore Support Vessel (OSV)",
        positions: [
          {
            id: `pos-${Date.now()}`,
            department: "",
            rank: "",
            title: "",
            salary: "",
            requirements: "",
          },
        ],
      },
    ]);

  const removeVessel = (vesselId: string) =>
    setVessels((prev) => prev.filter((v) => v.id !== vesselId));

  const addPositionToVessel = (vesselId: string) =>
    setVessels((prev) =>
      prev.map((v) =>
        v.id === vesselId
          ? {
              ...v,
              positions: [
                ...v.positions,
                {
                  id: `pos-${Date.now()}`,
                  department: "",
                  rank: "",
                  title: "",
                  salary: "",
                  requirements: "",
                },
              ],
            }
          : v
      )
    );

  const removePositionFromVessel = (vesselId: string, posId: string) =>
    setVessels((prev) =>
      prev.map((v) =>
        v.id === vesselId
          ? {
              ...v,
              positions: v.positions.filter((p) => p.id !== posId),
            }
          : v
      )
    );

  const updatePosition = (
    vesselId: string,
    posId: string,
    key: keyof PositionEntry,
    val: string
  ) =>
    setVessels((prev) =>
      prev.map((v) =>
        v.id === vesselId
          ? {
              ...v,
              positions: v.positions.map((p) => {
                if (p.id !== posId) return p;
                const updated = { ...p, [key]: val };
                if (key === "department") {
                  updated.rank = "";
                  updated.title = "";
                }
                if (key === "rank") updated.title = val;
                return updated;
              }),
            }
          : v
      )
    );

  // ── SMART PASTE ──
  const handleSmartSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!rawVacancyText.trim()) return alert("Please paste your vacancy text.");

  const smartPayload: any = { raw_text: rawVacancyText };
  if (companyId) smartPayload.company_id = Number(companyId);

  try {
    setIsSubmitting("smart");
    setSmartSuccess(false);
    await api.post("/jobs/smart-post", smartPayload);
    setSmartSuccess(true);
    setRawVacancyText("");
  } catch (err: any) {
    alert(
      err.response?.data?.message ||
        "Failed to process vacancy data. The AI might have rejected it as invalid."
    );
  } finally {
    setIsSubmitting(null);
  }
};

  // ── MANUAL SUBMIT ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const jobPayloads: any[] = [];

    for (const vessel of vessels) {
      if (shipType !== "shore" && !vessel.vesselName) {
        return alert("Please select a Vessel Type for all groups.");
      }

      for (const pos of vessel.positions) {
        if (!pos.department || (!pos.rank && shipType !== "shore") || !pos.title) {
          return alert(
            `Please fill all required fields (Department, Rank, Title) for ${
              vessel.vesselName || "Shore"
            }`
          );
        }

        const payload: any = {
          rank: pos.rank || pos.title || "Position",
          department: pos.department || "General",
          vessel_type:
            shipType === "shore"
              ? "Shore Operations"
              : vessel.vesselName || "Commercial Fleet",
          ship_type: shipType,
          joining: joiningDate || "Immediate",
          requirement_description:
            commonRequirements || "Standard rank experience required.",
          position_specifics: pos.requirements || "Immediate joining.",
          salary: pos.salary || null,
        };

        // Only include company_id if we resolved it — backend fills it otherwise
        if (companyId) payload.company_id = Number(companyId);

        jobPayloads.push(payload);
      }
    }

    if (jobPayloads.length === 0)
      return alert("Please add at least one position.");

    try {
      setIsSubmitting("publish");
      await Promise.all(jobPayloads.map((payload) => api.post("/jobs", payload)));
      alert(`Successfully published ${jobPayloads.length} job posting(s)!`);
      router.push("/employer/dashboard/jobs");
    } catch (err: any) {
      alert(
        err.response?.data?.message || "An error occurred while posting jobs."
      );
    } finally {
      setIsSubmitting(null);
    }
  };

  const showVesselDropdown = shipType === "mainfleet" || shipType === "offshore";
  const currentVesselOptions =
    shipType === "mainfleet" ? MAINFLEET_VESSELS : OFFSHORE_VESSELS;

  return (
    <DashboardShell pageTitle="Post Job Vacancies">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* HEADER + TAB TOGGLE */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E7EAF1] pb-5">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase block mb-1">
              Recruitment
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
              Publish Job Positions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Add a single vacancy or create bulk positions across multiple
              vessels.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => {
                setEntryMode("smart");
                setSmartSuccess(false);
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                entryMode === "smart"
                  ? "bg-white text-[#0F1E35] shadow-sm"
                  : "text-slate-500 hover:text-[#0F1E35]"
              }`}
            >
              <Wand2 className="w-4 h-4" /> Smart Paste
            </button>
            <button
              onClick={() => setEntryMode("manual")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                entryMode === "manual"
                  ? "bg-white text-[#0F1E35] shadow-sm"
                  : "text-slate-500 hover:text-[#0F1E35]"
              }`}
            >
              <Settings2 className="w-4 h-4" /> Manual Builder
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* SMART PASTE */}
          {entryMode === "smart" && (
            <motion.div
              key="smart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-8 shadow-[0_1px_2px_rgba(15,30,53,0.04)] max-w-3xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-[#0F1E35]">
                    Post your vacancy
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Paste what you send to your WhatsApp groups. Our AI will
                    structure it and queue it for review.
                  </p>
                </div>

                <form onSubmit={handleSmartSubmit} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">
                      Your Vacancy Dump
                    </label>
                    <textarea
                      required
                      rows={8}
                      value={rawVacancyText}
                      onChange={(e) => setRawVacancyText(e.target.value)}
                      placeholder={`e.g.\nURGENT REQUIREMENT: Need one 2nd Engineer for our Oil/Chem Tanker. Joining around 20th August, standard 6 months contract...`}
                      className="w-full rounded-xl border border-[#E7EAF1] bg-slate-50 p-4 text-sm text-[#0F1E35] placeholder:text-slate-400 focus:border-[#F5B61A] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">
                      Company Auth Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full rounded-xl border border-[#E7EAF1] bg-slate-100 py-3 px-4 text-sm text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting === "smart" || !rawVacancyText.trim()}
                    className="w-full rounded-xl bg-[#0F1E35] py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting === "smart"
                      ? "Processing via AI..."
                      : "Post vacancy"}
                  </button>

                  {smartSuccess && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-emerald-800">
                          Received successfully.
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          We are checking it via our AI gateway before it goes
                          live, usually within a few hours.
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}

          {/* MANUAL BUILDER */}
          {entryMode === "manual" && (
            <motion.form
              key="manual"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-5xl"
            >
              {/* JOB INFORMATION */}
              <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)] space-y-5">
                <h2 className="text-sm font-bold text-[#0F1E35] uppercase tracking-wide flex items-center gap-2 border-b border-[#E7EAF1] pb-3">
                  <Briefcase className="w-4 h-4 text-[#F5B61A]" /> Job Information
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase mb-1.5 block">
                      Ship Type *
                    </label>
                    <select
                      value={shipType}
                      onChange={(e) => handleShipTypeChange(e.target.value)}
                      className={inputClass}
                    >
                      {SHIP_TYPES.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase mb-1.5 block">
                      Joining Date / Availability *
                    </label>
                    <input
                      required
                      type="text"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      placeholder="e.g., Immediate, 15 Days, 1 Month"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase mb-1.5 block">
                    Common Job Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={commonRequirements}
                    onChange={(e) => setCommonRequirements(e.target.value)}
                    placeholder="Relevant rank experience required on similar type of ship"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* JOB POSITIONS */}
              <div className="space-y-6">
                <h2 className="text-base font-bold text-[#0F1E35] flex items-center gap-2">
                  Job Positions <span className="text-red-500">*</span>
                </h2>

                {vessels.map((vessel) => (
                  <div
                    key={vessel.id}
                    className="rounded-2xl border-l-4 border-l-[#0F1E35] border border-[#E7EAF1] bg-white p-6 shadow-sm space-y-5"
                  >
                    {showVesselDropdown ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7EAF1] pb-4">
                        <div className="flex-1 max-w-md">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                            Vessel Type *
                          </label>
                          <select
                            value={vessel.vesselName}
                            onChange={(e) =>
                              setVessels((prev) =>
                                prev.map((v) =>
                                  v.id === vessel.id
                                    ? { ...v, vesselName: e.target.value }
                                    : v
                                )
                              )
                            }
                            className={inputClass}
                          >
                            {(vesselOptions.length > 0
                              ? vesselOptions
                              : currentVesselOptions
                            ).map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>

                        {vessels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVessel(vessel.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Group
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="border-b border-[#E7EAF1] pb-3">
                        <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                          {shipType === "shore"
                            ? "Shore Job Category"
                            : "Cruise Job Category"}
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <p className="text-xs font-bold text-[#0F1E35] uppercase tracking-wide">
                        Positions:
                      </p>

                      {vessel.positions.map((pos) => (
                        <div
                          key={pos.id}
                          className="relative bg-[#F8FAFC] p-5 rounded-xl border border-[#E7EAF1] space-y-4"
                        >
                          {vessel.positions.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removePositionFromVessel(vessel.id, pos.id)
                              }
                              className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          <div className="grid gap-4 sm:grid-cols-3 pr-6 sm:pr-0">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                                Department *
                              </label>
                              {shipType === "shore" ? (
                                <input
                                  type="text"
                                  value="Shore"
                                  disabled
                                  className="w-full rounded-xl border border-[#E7EAF1] bg-slate-100 py-2.5 px-4 text-sm text-slate-500 font-bold"
                                />
                              ) : (
                                <select
                                  required
                                  value={pos.department}
                                  onChange={(e) =>
                                    updatePosition(
                                      vessel.id,
                                      pos.id,
                                      "department",
                                      e.target.value
                                    )
                                  }
                                  className={inputClass}
                                >
                                  <option value="" disabled>
                                    Select Dept...
                                  </option>
                                  {departmentsList.length > 0
                                    ? departmentsList.map((d: any, i) => (
                                        <option key={i} value={d.name || d}>
                                          {formatTitleCase(d.name || d)}
                                        </option>
                                      ))
                                    : FALLBACK_DEPARTMENTS.map((d) => (
                                        <option key={d} value={d}>
                                          {d}
                                        </option>
                                      ))}
                                </select>
                              )}
                            </div>

                            {shipType !== "shore" && (
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                                  Rank
                                </label>
                                <select
                                  value={pos.rank}
                                  onChange={(e) =>
                                    updatePosition(
                                      vessel.id,
                                      pos.id,
                                      "rank",
                                      e.target.value
                                    )
                                  }
                                  className={inputClass}
                                  disabled={!pos.department}
                                >
                                  <option value="" disabled>
                                    {pos.department
                                      ? "Select Rank..."
                                      : "Select Dept First"}
                                  </option>
                                  {(RANKS_BY_DEPT[pos.department] || []).map(
                                    (r) => (
                                      <option key={r} value={r}>
                                        {r}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                            )}

                            <div
                              className={
                                shipType === "shore" ? "sm:col-span-2" : ""
                              }
                            >
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                                Position Title *
                              </label>
                              <input
                                required
                                type="text"
                                value={pos.title}
                                onChange={(e) =>
                                  updatePosition(
                                    vessel.id,
                                    pos.id,
                                    "title",
                                    e.target.value
                                  )
                                }
                                placeholder={
                                  shipType === "shore"
                                    ? "e.g. Marine Superintendent"
                                    : "Auto-fills from Rank"
                                }
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                                Salary Range (Optional)
                              </label>
                              <input
                                type="text"
                                value={pos.salary}
                                onChange={(e) =>
                                  updatePosition(
                                    vessel.id,
                                    pos.id,
                                    "salary",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., $3000 - $5000"
                                className={inputClass}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                                Position Specific Requirements (Optional)
                              </label>
                              <input
                                type="text"
                                value={pos.requirements}
                                onChange={(e) =>
                                  updatePosition(
                                    vessel.id,
                                    pos.id,
                                    "requirements",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Needs DP Maintenance cert..."
                                className={inputClass}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addPositionToVessel(vessel.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#0F1E35]/30 bg-blue-50/50 px-5 py-2.5 text-xs font-bold text-[#0F1E35] hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Position
                      </button>
                    </div>
                  </div>
                ))}

                {showVesselDropdown && (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={addVessel}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1E35] bg-white px-6 py-3 text-sm font-bold text-[#0F1E35] hover:bg-[#0F1E35] hover:text-white transition-all shadow-sm"
                    >
                      <Ship className="w-4 h-4" /> Add Another Vessel Group
                    </button>
                  </div>
                )}
              </div>

              {/* STICKY FOOTER */}
              <div className="sticky bottom-0 z-10 flex items-center justify-between rounded-t-2xl border-t border-[#E7EAF1] bg-white/80 backdrop-blur-md p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] mt-10">
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-slate-500">
                    Ready to publish
                  </p>
                  <p className="text-sm font-extrabold text-[#0F1E35]">
                    <span className="text-[#F5B61A]">
                      {totalPositionsCount}
                    </span>{" "}
                    Position(s)
                  </p>
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting !== null}
                    className="flex-1 sm:flex-none rounded-xl bg-[#F5B61A] px-8 py-3 text-sm font-bold text-[#0F1E35] shadow-lg shadow-[#F5B61A]/20 hover:brightness-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting === "publish"
                      ? "Publishing..."
                      : "Publish Jobs"}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
// app/employer/dashboard/bulk-post/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ship, Anchor, Users, Plus, Trash2, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "../../../../context/auth-context";
import DashboardShell from "../../components/DashboardShell";

import api from "../../../../lib/api";

interface Role {
  rank: string;
  vacancies: string;
  experience: string;
}

interface SelectedVessel {
  vessel_id: string;
  vessel_name: string;
  roles: Role[];
}

const SHIP_TYPES = [
  { label: "Mainfleet", value: "mainfleet" },
  { label: "Offshore", value: "offshore" },
  { label: "Cruise", value: "cruise" },
];

export default function HRBulkJobPoster() {
  const { user } = useAuth();
  const router = useRouter();

  const [dynamicVessels, setDynamicVessels] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);

  const [shipType, setShipType] = useState<string>("");
  const [selectedVessels, setSelectedVessels] = useState<SelectedVessel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch Vessels dynamically
  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await api.get("/filters");
        const data = res.data?.data || res.data;
        if (data.vessel_types && data.vessel_types.length > 0) {
          setDynamicVessels(data.vessel_types);
        } else if (data.vessels && data.vessels.length > 0) {
          setDynamicVessels(data.vessels);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic vessels", err);
      }
    };
    fetchMatrix();
  }, []);

  const fallbackVessels = ["Oil Tanker", "Chemical Tanker", "Bulk Carrier", "Container Ship", "OSV"];
  const vesselOptions = dynamicVessels.length > 0 ? dynamicVessels : fallbackVessels;

  const toggleVessel = (vesselName: string) => {
    const vesselId = vesselName.toLowerCase().replace(/\s+/g, '-');
    const exists = selectedVessels.find((v) => v.vessel_id === vesselId);
    
    if (exists) {
      setSelectedVessels(selectedVessels.filter((v) => v.vessel_id !== vesselId));
    } else {
      setSelectedVessels([
        ...selectedVessels,
        { vessel_id: vesselId, vessel_name: vesselName, roles: [] },
      ]);
    }
  };

  const addRoleToVessel = (vesselId: string) => {
    setSelectedVessels(
      selectedVessels.map((vessel) => {
        if (vessel.vessel_id === vesselId) {
          return { ...vessel, roles: [...vessel.roles, { rank: "", vacancies: "1", experience: "" }] };
        }
        return vessel;
      })
    );
  };

  const updateRole = (vesselId: string, roleIndex: number, field: keyof Role, value: string) => {
    setSelectedVessels(
      selectedVessels.map((vessel) => {
        if (vessel.vessel_id === vesselId) {
          const updatedRoles = [...vessel.roles];
          updatedRoles[roleIndex][field] = value;
          return { ...vessel, roles: updatedRoles };
        }
        return vessel;
      })
    );
  };

  const removeRole = (vesselId: string, roleIndex: number) => {
    setSelectedVessels(
      selectedVessels.map((vessel) => {
        if (vessel.vessel_id === vesselId) {
          const updatedRoles = [...vessel.roles];
          updatedRoles.splice(roleIndex, 1);
          return { ...vessel, roles: updatedRoles };
        }
        return vessel;
      })
    );
  };

  const handleSubmit = async () => {
    if (!companyId) {
      alert("Company details not found. Please ensure your profile is complete.");
      return;
    }
    if (!shipType || selectedVessels.length === 0) {
      alert("Please select a ship type and at least one vessel.");
      return;
    }

    for (const vessel of selectedVessels) {
      if (vessel.roles.length === 0) {
        alert(`Please add at least one role for ${vessel.vessel_name}`);
        return;
      }
      for (const role of vessel.roles) {
        if (!role.rank.trim()) {
          alert(`Please fill all rank names for ${vessel.vessel_name}`);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      const payload = { 
        company_id: companyId,
        ship_type: shipType, 
        vessels: selectedVessels 
      };
      
      await api.post("/jobs/bulkPost", payload);
      
      alert("Bulk Jobs Posted Successfully!");
      router.push("/employer/dashboard/jobs");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to post bulk jobs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell pageTitle="Bulk Post Jobs">
      <div className="max-w-5xl space-y-6">
        
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
              Bulk Operations
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
              Bulk Crew Deployment
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/employer/dashboard/post-job")}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-bold text-zinc-600 shadow-sm hover:bg-zinc-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Single Post
          </button>
        </div>

        {/* STEP 1: SHIP TYPE SELECTION */}
        <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)]">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Ship className="w-4 h-4 text-[#F5B61A]" /> 1. Select Ship Type
          </h2>
          <div className="flex flex-wrap gap-3">
            {SHIP_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setShipType(type.value)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                  shipType === type.value
                    ? "bg-[#0F1E35] text-white border-[#0F1E35]"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: MULTI-SELECT VESSELS */}
        {shipType && (
          <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)] animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Anchor className="w-4 h-4 text-[#F5B61A]" /> 2. Select Vessels
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {vesselOptions.map((vessel: any, idx) => {
                const vesselName = typeof vessel === 'string' ? vessel : (vessel.name || vessel.value || vessel);
                const vesselId = vesselName.toLowerCase().replace(/\s+/g, '-');
                const isSelected = selectedVessels.some((v) => v.vessel_id === vesselId);
                
                return (
                  <div
                    key={vesselId + idx}
                    onClick={() => toggleVessel(vesselName)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      isSelected ? "border-[#0F1E35] bg-blue-50/50" : "border-zinc-200 hover:border-[#0F1E35]/30"
                    }`}
                  >
                    <span className={`text-sm font-bold ${isSelected ? "text-[#0F1E35]" : "text-zinc-600"}`}>
                      {vesselName}
                    </span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#0F1E35]" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: ASSIGN ROLES PER VESSEL */}
        {selectedVessels.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F5B61A]" /> 3. Assign Crew Requirements
            </h2>

            {selectedVessels.map((vessel) => (
              <div key={vessel.vessel_id} className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)] overflow-hidden">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                  <h3 className="text-lg font-extrabold text-[#0F1E35]">{vessel.vessel_name}</h3>
                  <button
                    onClick={() => addRoleToVessel(vessel.vessel_id)}
                    className="flex items-center gap-1.5 bg-[#F5B61A] text-[#0F1E35] px-4 py-2 rounded-xl text-xs font-bold hover:brightness-95 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Role
                  </button>
                </div>

                {vessel.roles.length === 0 ? (
                  <div className="text-center py-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                    <p className="text-xs font-bold text-zinc-400">No roles added yet. Click "Add Role" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vessel.roles.map((role, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-3 items-end bg-[#F8FAFC] p-4 rounded-xl border border-[#E7EAF1]">
                        
                        <div className="flex-1 w-full">
                          <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Rank / Role</label>
                          <input
                            type="text"
                            placeholder="e.g. Chief Engineer"
                            value={role.rank}
                            onChange={(e) => updateRole(vessel.vessel_id, index, "rank", e.target.value)}
                            className="w-full rounded-xl border border-[#E7EAF1] px-4 py-2.5 text-sm text-[#0F1E35] focus:border-[#F5B61A] focus:ring-4 focus:ring-[#F5B61A]/10 focus:outline-none transition-all"
                          />
                        </div>

                        <div className="w-full sm:w-32">
                          <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Vacancies</label>
                          <input
                            type="number"
                            min="1"
                            value={role.vacancies}
                            onChange={(e) => updateRole(vessel.vessel_id, index, "vacancies", e.target.value)}
                            className="w-full rounded-xl border border-[#E7EAF1] px-4 py-2.5 text-sm text-[#0F1E35] focus:border-[#F5B61A] focus:ring-4 focus:ring-[#F5B61A]/10 focus:outline-none transition-all"
                          />
                        </div>

                        <div className="w-full sm:w-40">
                          <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Min. Exp</label>
                          <input
                            type="text"
                            placeholder="e.g. 24 Months"
                            value={role.experience}
                            onChange={(e) => updateRole(vessel.vessel_id, index, "experience", e.target.value)}
                            className="w-full rounded-xl border border-[#E7EAF1] px-4 py-2.5 text-sm text-[#0F1E35] focus:border-[#F5B61A] focus:ring-4 focus:ring-[#F5B61A]/10 focus:outline-none transition-all"
                          />
                        </div>

                        <button
                          onClick={() => removeRole(vessel.vessel_id, index)}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                          title="Remove Role"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* FINAL SUBMIT ACTION */}
            <div className="flex justify-end pt-6">
               <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#F5B61A] text-[#0F1E35] px-10 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-[#F5B61A]/20 hover:brightness-95 hover:-translate-y-0.5 transition-all disabled:opacity-50"
               >
                 {isSubmitting ? "Deploying Jobs..." : "Publish Bulk Requirements"}
               </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
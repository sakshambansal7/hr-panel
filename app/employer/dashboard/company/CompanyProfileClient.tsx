"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Check, Save } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { useAuth } from "../../../context/auth-context";
import {
  getCompanyProfile,
  saveCompanyProfile,
  type CompanyProfile,
} from "../../../lib/company-profile-store";
import { VESSEL_TYPES } from "../../../lib/mock-data";

const COMPANY_TYPES = [
  "Manning Agent / RPSL Holder",
  "Ship Owner",
  "Ship Management Company",
  "Crewing Agency",
  "Cruise Line",
  "Other Maritime Employer",
];

const inputClass =
  "w-full rounded-2xl border border-[#E7EAF1] bg-white py-3 px-4 text-sm text-[#0F1E35] placeholder:text-slate-400 transition-all duration-200 focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">{label}</label>
      {children}
    </div>
  );
}

export default function CompanyProfileClient() {
  const { user } = useAuth();
  return (
    <DashboardShell pageTitle="Company Profile">
      {user && <CompanyProfileForm key={user.email} email={user.email} />}
    </DashboardShell>
  );
}

function CompanyProfileForm({ email }: { email: string }) {
  const [profile, setProfile] = useState<CompanyProfile>(() => getCompanyProfile(email));
  const [saved, setSaved] = useState(false);

  function update<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function toggleVessel(vessel: string) {
    setProfile((p) => ({
      ...p,
      vesselTypesManaged: p.vesselTypesManaged.includes(vessel)
        ? p.vesselTypesManaged.filter((v) => v !== vessel)
        : [...p.vesselTypesManaged, vessel],
    }));
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveCompanyProfile(email, profile);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
              {profile.companyName || "Company Profile"}
            </h1>
            {profile.verified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E8B61]/10 px-3 py-1.5 text-xs font-bold text-[#0E8B61]">
                <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E8B61]"
                >
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                  Saved
                </motion.span>
              )}
            </AnimatePresence>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#F5B61A] px-4 py-2.5 text-xs font-bold text-[#0F1E35] shadow-sm shadow-[#F5B61A]/30 transition-all hover:brightness-95 active:scale-[0.98]"
            >
              <Save className="h-4 w-4" strokeWidth={2} />
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-5 rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)]">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Company Details
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Company Name">
              <input
                value={profile.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Company Type">
              <select
                value={profile.companyType}
                onChange={(e) => update("companyType", e.target.value)}
                className={inputClass}
              >
                <option value="">Select</option>
                {COMPANY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Website">
              <input
                value={profile.website}
                onChange={(e) => update("website", e.target.value)}
                className={inputClass}
                placeholder="https://"
              />
            </Field>
            <Field label="Office Address">
              <input
                value={profile.officeAddress}
                onChange={(e) => update("officeAddress", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="City">
              <input
                value={profile.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="State">
              <input
                value={profile.state}
                onChange={(e) => update("state", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Country">
              <input
                value={profile.country}
                onChange={(e) => update("country", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Fleet Size">
              <input
                type="number"
                min={0}
                value={profile.fleetSize || ""}
                onChange={(e) => update("fleetSize", Number(e.target.value) || 0)}
                className={inputClass}
              />
            </Field>
            <Field label="Salary Range">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={profile.salaryRangeMin || ""}
                  onChange={(e) => update("salaryRangeMin", Number(e.target.value) || 0)}
                  className={inputClass}
                  placeholder="Min"
                />
                <span className="text-slate-400">–</span>
                <input
                  type="number"
                  min={0}
                  value={profile.salaryRangeMax || ""}
                  onChange={(e) => update("salaryRangeMax", Number(e.target.value) || 0)}
                  className={inputClass}
                  placeholder="Max"
                />
              </div>
            </Field>
          </div>

          <Field label="About Company">
            <textarea
              value={profile.about}
              onChange={(e) => update("about", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>

          <Field label="Vessel Types Managed">
            <div className="flex flex-wrap gap-2">
              {VESSEL_TYPES.map((v) => {
                const active = profile.vesselTypesManaged.includes(v);
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleVessel(v)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                      active
                        ? "border-[#0F1E35] bg-[#0F1E35] text-white"
                        : "border-[#E7EAF1] bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="space-y-5 rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)]">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Verification Details
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="RPSL Number">
              <input
                value={profile.rpslNumber}
                onChange={(e) => update("rpslNumber", e.target.value)}
                className={inputClass}
                placeholder="RPSL/MUM/xxxx/xxx"
              />
            </Field>
            <Field label="RPSL Validity">
              <input
                type="date"
                value={profile.rpslValidity}
                onChange={(e) => update("rpslValidity", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="DG Shipping Details">
              <input
                value={profile.dgShippingDetails}
                onChange={(e) => update("dgShippingDetails", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Company Registration Number">
              <input
                value={profile.companyRegNumber}
                onChange={(e) => update("companyRegNumber", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="GST Number (Optional)">
              <input
                value={profile.gstNumber}
                onChange={(e) => update("gstNumber", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </form>
  );
}

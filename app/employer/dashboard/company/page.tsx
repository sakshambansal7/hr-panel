// app/employer/dashboard/company/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Building2, Globe, MapPin, Anchor, Banknote, Info, Loader2, ShieldCheck, Mail, Phone } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import api from "../../../lib/api";

function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "—";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(name: string = "") {
  if (name) return name.substring(0, 2).toUpperCase();
  return "CO";
}

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setIsLoading(true);
        // 🚀 Adjust this endpoint if your backend uses a different route to fetch the HR's company details
        const res = await api.get('/company/profile').catch(() => api.get('/company'));
        
        let apiData = res.data?.data || res.data || {};
        let finalCompany: any = { ...apiData };

        // Unpack EAV fields if your company table uses them
        const fieldsArray = apiData.fields || (Array.isArray(apiData) ? apiData : []);
        if (fieldsArray.length > 0) {
          fieldsArray.forEach((field: any) => {
            const { meta_data: key, meta_value: value } = field;
            if (value !== null && value !== undefined && value !== "") {
              finalCompany[key] = value;
            }
          });
        }

        setCompany(finalCompany);
      } catch (error) {
        console.error("Failed to fetch company profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  if (isLoading) {
    return (
      <DashboardShell pageTitle="Company Profile">
        <div className="flex h-[60vh] flex-col items-center justify-center font-bold text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          Loading Company Details...
        </div>
      </DashboardShell>
    );
  }

  const companyName = company?.name || company?.company_name || "Unknown Company";

  return (
    <DashboardShell pageTitle="Company Profile">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Organization</p>
          <h1 className="text-2xl font-extrabold text-[#0F1E35]">Company Profile</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Official details and public information for your organization.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 border border-slate-200">
          <ShieldCheck className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-600">Read-Only View</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main ID Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#0F1E35] text-3xl font-black text-white shadow-inner">
              {getInitials(companyName)}
            </div>
            <h2 className="text-xl font-extrabold text-[#0F1E35]">{formatTitleCase(companyName)}</h2>
            <p className="text-sm font-bold text-blue-600 mt-1">
              {formatTitleCase(company?.company_type || company?.type || "Shipping Company")}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Website</p>
                  <a href={company?.website || "#"} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#0F1E35] hover:text-blue-600 truncate block">
                    {company?.website || "—"}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  <Anchor className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fleet Size</p>
                  <p className="text-xs font-bold text-[#0F1E35]">{company?.fleet_size || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  <Banknote className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Salary Range</p>
                  <p className="text-xs font-bold text-[#0F1E35]">
                    {company?.salary_min || company?.min_salary ? `$${company.salary_min || company.min_salary} - $${company.salary_max || company.max_salary}` : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & About */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Section */}
          <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0F1E35] mb-4">
              <Info className="h-4 w-4 text-blue-500" /> About Company
            </h3>
            {company?.about || company?.about_company || company?.description ? (
              <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                {company.about || company.about_company || company.description}
              </p>
            ) : (
              <p className="text-sm italic text-slate-400">No description provided for this company.</p>
            )}
          </div>

          {/* Location Section */}
          <div className="rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0F1E35] mb-6">
              <MapPin className="h-4 w-4 text-emerald-500" /> Headquarters / Office Location
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Office Address</p>
                <p className="text-sm font-semibold text-[#0F1E35]">{company?.office_address || company?.address || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">City</p>
                <p className="text-sm font-semibold text-[#0F1E35]">{company?.city || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">State / Province</p>
                <p className="text-sm font-semibold text-[#0F1E35]">{company?.state || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Country</p>
                <p className="text-sm font-semibold text-[#0F1E35]">{company?.country || "—"}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}
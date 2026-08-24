

export type CompanyProfile = {
  companyName: string;
  companyType: string;
  website: string;
  officeAddress: string;
  city: string;
  state: string;
  country: string;
  fleetSize: number;
  salaryRangeMin: number;
  salaryRangeMax: number;
  about: string;
  vesselTypesManaged: string[];
  rpslNumber: string;
  rpslValidity: string;
  dgShippingDetails: string;
  companyRegNumber: string;
  gstNumber: string;
  verified: boolean;
};

export const EMPTY_COMPANY_PROFILE: CompanyProfile = {
  companyName: "",
  companyType: "",
  website: "",
  officeAddress: "",
  city: "",
  state: "",
  country: "India",
  fleetSize: 0,
  salaryRangeMin: 0,
  salaryRangeMax: 0,
  about: "",
  vesselTypesManaged: [],
  rpslNumber: "",
  rpslValidity: "",
  dgShippingDetails: "",
  companyRegNumber: "",
  gstNumber: "",
  verified: false,
};

const SEED_VSHIPS: CompanyProfile = {
  companyName: "V.Ships India",
  companyType: "Ship Management Company",
  website: "",
  officeAddress: "Mumbai, India",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  fleetSize: 800,
  salaryRangeMin: 1300,
  salaryRangeMax: 11000,
  about: "Part of V.Group, the world's leading maritime services provider.",
  vesselTypesManaged: [
    "Bulk Carrier",
    "Container",
    "Tanker",
    "LNG Carrier",
    "LPG Carrier",
    "Chemical Tanker",
    "Offshore",
    "Cruise",
  ],
  rpslNumber: "RPSL/MUM/2016/002",
  rpslValidity: "",
  dgShippingDetails: "",
  companyRegNumber: "",
  gstNumber: "",
  verified: true,
};

type LegacyEmployerMeta = {
  companyName?: string;
  companyType?: string;
  companyWebsite?: string;
  officeAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  rpslNumber?: string;
  rpslValidity?: string;
  dgShippingDetails?: string;
  companyRegNumber?: string;
  gstNumber?: string;
};

function profileKey(email: string) {
  return `mnj_company_profile_${email.toLowerCase()}`;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function fromLegacyEmployerMeta(email: string): CompanyProfile | null {
  const raw = readJSON<LegacyEmployerMeta | null>(`employer_meta_${email.toLowerCase()}`, null);
  if (!raw) return null;
  return {
    ...EMPTY_COMPANY_PROFILE,
    companyName: raw.companyName || "",
    companyType: raw.companyType || "",
    website: raw.companyWebsite || "",
    officeAddress: raw.officeAddress || "",
    city: raw.city || "",
    state: raw.state || "",
    country: raw.country || "India",
    rpslNumber: raw.rpslNumber || "",
    rpslValidity: raw.rpslValidity || "",
    dgShippingDetails: raw.dgShippingDetails || "",
    companyRegNumber: raw.companyRegNumber || "",
    gstNumber: raw.gstNumber || "",
    verified: Boolean(raw.rpslNumber),
  };
}

export function getCompanyProfile(email: string): CompanyProfile {
  const stored = readJSON<CompanyProfile | null>(profileKey(email), null);
  if (stored) return stored;
  
  // 🚀 FIXED: Replaced the broken variable with the hardcoded string
  if (email.toLowerCase() === "hr@vships.com") return SEED_VSHIPS;
  
  return fromLegacyEmployerMeta(email) || EMPTY_COMPANY_PROFILE;
}

export function saveCompanyProfile(email: string, profile: CompanyProfile) {
  writeJSON(profileKey(email), profile);
}

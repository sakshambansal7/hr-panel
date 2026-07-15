export type TalentCategory = "Rating" | "Engineer" | "Deck Officer";

export type TalentCandidate = {
  id: string;
  maskedName: string;
  rank: string;
  category: TalentCategory;
  vesselType: string;
  availability: string;
  experienceMonths: number;
  profileMatchPercent: number;
};

export const TALENT_CANDIDATES: TalentCandidate[] = [
  {
    id: "tc-1",
    maskedName: "M****",
    rank: "AB",
    category: "Rating",
    vesselType: "Container",
    availability: "Available Immediately",
    experienceMonths: 0,
    profileMatchPercent: 57,
  },
  {
    id: "tc-2",
    maskedName: "R****",
    rank: "Oiler",
    category: "Engineer",
    vesselType: "Bulk Carrier",
    availability: "Available in 15 days",
    experienceMonths: 18,
    profileMatchPercent: 64,
  },
  {
    id: "tc-3",
    maskedName: "A****",
    rank: "2nd Officer",
    category: "Deck Officer",
    vesselType: "Tanker",
    availability: "Available Immediately",
    experienceMonths: 36,
    profileMatchPercent: 81,
  },
  {
    id: "tc-4",
    maskedName: "S****",
    rank: "3rd Officer",
    category: "Deck Officer",
    vesselType: "Container",
    availability: "Available in 30 days",
    experienceMonths: 14,
    profileMatchPercent: 72,
  },
  {
    id: "tc-5",
    maskedName: "V****",
    rank: "Chief Officer",
    category: "Deck Officer",
    vesselType: "Bulk Carrier",
    availability: "Available Immediately",
    experienceMonths: 64,
    profileMatchPercent: 88,
  },
  {
    id: "tc-6",
    maskedName: "K****",
    rank: "Master",
    category: "Deck Officer",
    vesselType: "LNG Carrier",
    availability: "Available in 45 days",
    experienceMonths: 110,
    profileMatchPercent: 91,
  },
  {
    id: "tc-7",
    maskedName: "P****",
    rank: "Deck Cadet",
    category: "Deck Officer",
    vesselType: "Tanker",
    availability: "Available Immediately",
    experienceMonths: 2,
    profileMatchPercent: 48,
  },
  {
    id: "tc-8",
    maskedName: "N****",
    rank: "2nd Officer",
    category: "Deck Officer",
    vesselType: "Offshore",
    availability: "Available in 20 days",
    experienceMonths: 40,
    profileMatchPercent: 76,
  },
  {
    id: "tc-9",
    maskedName: "D****",
    rank: "3rd Officer",
    category: "Deck Officer",
    vesselType: "Chemical Tanker",
    availability: "Available Immediately",
    experienceMonths: 22,
    profileMatchPercent: 69,
  },
  {
    id: "tc-10",
    maskedName: "H****",
    rank: "Chief Officer",
    category: "Deck Officer",
    vesselType: "Cruise Ship",
    availability: "Available in 60 days",
    experienceMonths: 78,
    profileMatchPercent: 84,
  },
];

export function categoryCounts() {
  return {
    Rating: TALENT_CANDIDATES.filter((c) => c.category === "Rating").length,
    Engineer: TALENT_CANDIDATES.filter((c) => c.category === "Engineer").length,
    "Deck Officer": TALENT_CANDIDATES.filter((c) => c.category === "Deck Officer").length,
  };
}

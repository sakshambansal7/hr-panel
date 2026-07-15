export type JobCategory = "Ship" | "Shore" | "Cruise";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  rank: string;
  department?: string;
  vesselType: string;
  contractLength: string;
  salary: string;
  salaryMin: number;
  salaryFrom?: number;
  salaryTo?: number;
  currency?: string;
  salaryNegotiable?: boolean;
  minExperienceYears: number;
  type: "Full-time" | "Contract";
  category: JobCategory;
  postedAt: string;
  joiningDate?: string;
  tags: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  overtimeDetails?: string;
  contractTerms?: string;
  itfApproved?: boolean;
  rpslValid?: boolean;
};

export function rankCategory(rank: string): "Rating" | "Engineer" | "Deck Officer" {
  const engineRanks = [
    "Chief Engineer",
    "Second Engineer",
    "Third Engineer",
    "Fourth Engineer",
    "Electro-Technical Officer",
    "Oiler",
    "Fitter",
    "Wiper",
  ];
  const deckOfficerRanks = [
    "Master",
    "Chief Officer",
    "Second Officer",
    "Third Officer",
    "2nd Officer",
    "3rd Officer",
    "Deck Cadet",
    "Cadet",
  ];
  if (engineRanks.includes(rank)) return "Engineer";
  if (deckOfficerRanks.includes(rank)) return "Deck Officer";
  return "Rating";
}

export const RANKS = [
  "Master",
  "Chief Officer",
  "Second Officer",
  "Third Officer",
  "Chief Engineer",
  "Second Engineer",
  "Third Engineer",
  "Fourth Engineer",
  "Electro-Technical Officer",
  "Bosun",
  "Able Seaman",
  "Ordinary Seaman",
  "Cadet",
] as const;

export const DEPARTMENTS = ["Deck", "Engine", "Catering", "Electrical"] as const;

export const VESSEL_TYPES = [
  "Container",
  "Bulk Carrier",
  "Tanker",
  "LNG Carrier",
  "LPG Carrier",
  "Chemical Tanker",
  "Offshore",
  "Cruise Ship",
] as const;

export const jobs: Job[] = [
  {
    id: "1",
    title: "Chief Engineer",
    company: "Anglo-Eastern Ship Management",
    location: "Singapore",
    rank: "Chief Engineer",
    vesselType: "Container Vessel",
    contractLength: "6 months",
    salary: "$11,000 - $13,500 / month",
    salaryMin: 11000,
    minExperienceYears: 2,
    type: "Contract",
    category: "Ship",
    postedAt: "2026-06-24",
    tags: ["COC Class 1", "Container", "Immediate joining"],
    description:
      "Leading shipping company seeking an experienced Chief Engineer for a fleet of modern container vessels operating on Asia-Europe routes.",
    responsibilities: [
      "Oversee all engine room operations and maintenance schedules",
      "Ensure compliance with MARPOL and SOLAS regulations",
      "Manage engine room crew and training",
      "Report directly to fleet superintendent",
    ],
    requirements: [
      "Valid COC Class 1 (Chief Engineer, unlimited)",
      "Minimum 2 years experience as Chief Engineer on container vessels",
      "Valid STCW and medical certificates",
      "Strong leadership and communication skills",
    ],
  },
  {
    id: "2",
    title: "Second Officer",
    company: "Wallem Ship Management",
    location: "Rotterdam, Netherlands",
    rank: "Second Officer",
    vesselType: "Bulk Carrier",
    contractLength: "4 months",
    salary: "$4,200 - $5,000 / month",
    salaryMin: 4200,
    minExperienceYears: 1,
    type: "Contract",
    category: "Ship",
    postedAt: "2026-06-26",
    tags: ["COC Class 2", "Bulk Carrier", "European trade"],
    description:
      "Seeking a Second Officer for a modern bulk carrier trading primarily between European and West African ports.",
    responsibilities: [
      "Navigation watchkeeping duties",
      "Cargo watch and hold inspections",
      "Assist Master with passage planning",
      "Maintain bridge equipment and charts",
    ],
    requirements: [
      "Valid COC Class 2 (Officer of the Watch or higher)",
      "Minimum 1 year experience on bulk carriers",
      "GMDSS certificate",
      "Fluent in English",
    ],
  },
  {
    id: "3",
    title: "Able Seaman (AB)",
    company: "V.Group",
    location: "Mumbai, India",
    rank: "Able Seaman",
    vesselType: "Tanker",
    contractLength: "8 months",
    salary: "$1,800 - $2,200 / month",
    salaryMin: 1800,
    minExperienceYears: 0.5,
    type: "Contract",
    category: "Ship",
    postedAt: "2026-06-28",
    tags: ["Tanker", "AB Certificate", "Immediate joining"],
    description:
      "Reputable tanker operator hiring Able Seamen for crude oil tankers trading on the Middle East to Asia route.",
    responsibilities: [
      "Deck maintenance and mooring operations",
      "Cargo watch assistance",
      "General housekeeping and safety duties",
      "Assist officers during navigation watch",
    ],
    requirements: [
      "Valid AB certificate",
      "Tanker familiarization (Basic + Advanced)",
      "Minimum 6 months sea time on tankers",
      "Valid STCW certificates",
    ],
  },
  {
    id: "4",
    title: "Third Engineer",
    company: "Bernhard Schulte Shipmanagement",
    location: "Hamburg, Germany",
    rank: "Third Engineer",
    vesselType: "LNG Carrier",
    contractLength: "5 months",
    salary: "$6,500 - $7,800 / month",
    salaryMin: 6500,
    minExperienceYears: 1,
    type: "Contract",
    category: "Ship",
    postedAt: "2026-06-20",
    tags: ["LNG", "COC Class 3", "Gas endorsement"],
    description:
      "Third Engineer required for state-of-the-art LNG carriers with premium salary and benefits package.",
    responsibilities: [
      "Operate and maintain auxiliary machinery",
      "Assist Chief Engineer with planned maintenance system",
      "Monitor cargo machinery during gas operations",
      "Maintain engine room logs and records",
    ],
    requirements: [
      "Valid COC Class 3 with gas endorsement",
      "Prior LNG or LPG experience preferred",
      "Valid ENG1 or equivalent medical certificate",
      "Strong technical troubleshooting skills",
    ],
  },
  {
    id: "5",
    title: "Master Mariner",
    company: "MSC Ship Management",
    location: "Geneva, Switzerland",
    rank: "Master",
    vesselType: "Container Vessel",
    contractLength: "6 months",
    salary: "$13,000 - $16,000 / month",
    salaryMin: 13000,
    minExperienceYears: 3,
    type: "Contract",
    category: "Ship",
    postedAt: "2026-06-15",
    tags: ["Command experience", "Container", "COC Class 1"],
    description:
      "Experienced Master Mariner required to command ultra-large container vessels on global trade routes.",
    responsibilities: [
      "Overall command and safety of vessel and crew",
      "Compliance with ISM/ISPS codes and flag state regulations",
      "Liaise with port authorities and charterers",
      "Lead senior officers and department heads",
    ],
    requirements: [
      "Valid COC Class 1 (Master, unlimited)",
      "Minimum 3 years command experience",
      "Clean record with no PSC detentions",
      "Excellent leadership and crisis management skills",
    ],
  },
  {
    id: "6",
    title: "Deck Cadet",
    company: "Synergy Marine Group",
    location: "Manila, Philippines",
    rank: "Cadet",
    vesselType: "Bulk Carrier",
    contractLength: "12 months",
    salary: "$500 - $700 / month",
    salaryMin: 500,
    minExperienceYears: 0,
    type: "Contract",
    category: "Ship",
    postedAt: "2026-06-29",
    tags: ["Training program", "Entry level", "Sea time"],
    description:
      "Structured cadetship program for maritime academy graduates looking to build sea time toward their officer license.",
    responsibilities: [
      "Assist officers with navigation and deck duties",
      "Complete onboard training record book tasks",
      "Participate in safety drills",
      "Learn cargo and mooring operations under supervision",
    ],
    requirements: [
      "Maritime academy diploma or equivalent",
      "Valid STCW basic safety training",
      "Valid seaman's medical certificate",
      "Strong willingness to learn",
    ],
  },
  {
    id: "7",
    title: "Marine Superintendent",
    company: "V.Group",
    location: "London, United Kingdom",
    rank: "Chief Engineer",
    vesselType: "Bulk Carrier",
    contractLength: "Permanent",
    salary: "$7,000 - $9,000 / month",
    salaryMin: 7000,
    minExperienceYears: 5,
    type: "Full-time",
    category: "Shore",
    postedAt: "2026-06-22",
    tags: ["Shore-based", "Office role", "Fleet oversight"],
    description:
      "Shore-based role overseeing technical and safety performance of a managed fleet of bulk carriers, working closely with ship staff and class societies.",
    responsibilities: [
      "Conduct vessel visits and technical audits",
      "Oversee dry-docking and major repairs",
      "Support ship staff on technical and regulatory matters",
      "Liaise with classification societies and flag states",
    ],
    requirements: [
      "Prior sea experience as Chief Engineer or Chief Officer",
      "Minimum 5 years combined sea and shore experience",
      "Strong knowledge of class and flag state requirements",
      "Willingness to travel for vessel visits",
    ],
  },
  {
    id: "8",
    title: "Cruise Ship Second Officer",
    company: "MSC Ship Management",
    location: "Miami, United States",
    rank: "Second Officer",
    vesselType: "Cruise Ship",
    contractLength: "6 months",
    salary: "$5,500 - $6,500 / month",
    salaryMin: 5500,
    minExperienceYears: 1.5,
    type: "Contract",
    category: "Cruise",
    postedAt: "2026-06-27",
    tags: ["Cruise", "Passenger vessel", "Guest-facing"],
    description:
      "Seeking a Second Officer for a modern cruise ship, combining navigation watchkeeping duties with guest safety and passenger-facing responsibilities.",
    responsibilities: [
      "Navigation watchkeeping duties",
      "Lead passenger safety drills and musters",
      "Support bridge team during port arrivals and departures",
      "Liaise with hotel department on guest safety matters",
    ],
    requirements: [
      "Valid COC Class 2 (Officer of the Watch or higher)",
      "Passenger ship familiarization",
      "Comfortable in guest-facing situations",
      "Fluent in English",
    ],
  },
];

export type Company = {
  id: string;
  name: string;
  headquarters: string;
  founded: number;
  fleetSize: number;
  vesselTypes: string[];
  rating: number;
  reviewCount: number;
  description: string;
  website: string;
};

export const companies: Company[] = [
  {
    id: "c1",
    name: "Anglo-Eastern Ship Management",
    headquarters: "Hong Kong",
    founded: 1974,
    fleetSize: 650,
    vesselTypes: ["Container Vessel", "Bulk Carrier", "Tanker"],
    rating: 4.2,
    reviewCount: 318,
    description:
      "One of the world's largest independent ship management companies, providing crewing and technical management across a diverse global fleet.",
    website: "angloeastern.com",
  },
  {
    id: "c2",
    name: "Wallem Ship Management",
    headquarters: "Hong Kong",
    founded: 1903,
    fleetSize: 300,
    vesselTypes: ["Bulk Carrier", "Container Vessel", "Gas Carrier"],
    rating: 4.0,
    reviewCount: 214,
    description:
      "A long-established maritime services group offering ship management, crewing, and marine logistics with a strong presence in Europe and Asia.",
    website: "wallem.com",
  },
  {
    id: "c3",
    name: "V.Group",
    headquarters: "London, United Kingdom",
    founded: 1968,
    fleetSize: 1000,
    vesselTypes: ["Tanker", "LNG Carrier", "Bulk Carrier"],
    rating: 3.9,
    reviewCount: 512,
    description:
      "One of the largest independent marine and offshore vessel management companies, supporting owners with crewing, technical, and marine assurance services.",
    website: "vgroup.com",
  },
  {
    id: "c4",
    name: "Bernhard Schulte Shipmanagement",
    headquarters: "Hamburg, Germany",
    founded: 1985,
    fleetSize: 550,
    vesselTypes: ["LNG Carrier", "Container Vessel", "Tanker"],
    rating: 4.3,
    reviewCount: 276,
    description:
      "Part of the Schulte Group, offering full technical and crew management services with a focus on gas carriers and premium vessel operations.",
    website: "bs-shipmanagement.com",
  },
  {
    id: "c5",
    name: "MSC Ship Management",
    headquarters: "Geneva, Switzerland",
    founded: 1970,
    fleetSize: 800,
    vesselTypes: ["Container Vessel"],
    rating: 3.8,
    reviewCount: 640,
    description:
      "The ship management arm of the Mediterranean Shipping Company, operating one of the largest container vessel fleets in the world.",
    website: "msc.com",
  },
  {
    id: "c6",
    name: "Synergy Marine Group",
    headquarters: "Singapore",
    founded: 2006,
    fleetSize: 700,
    vesselTypes: ["Bulk Carrier", "Tanker", "Container Vessel"],
    rating: 4.1,
    reviewCount: 389,
    description:
      "A fast-growing global ship management company known for structured cadet training programs and a strong safety culture.",
    website: "synergymarinegroup.com",
  },
];

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-write-a-seafarer-cv",
    title: "How to Write a Seafarer CV That Gets You Hired",
    excerpt:
      "Recruiters spend seconds scanning a CV. Here's how to structure yours so your certifications and sea time stand out immediately.",
    date: "2026-06-18",
    author: "MerchantNavyJobs Editorial Team",
    content: [
      "Your CV is often the only thing standing between you and your next contract, so it needs to work hard in the first few seconds a recruiter looks at it.",
      "Lead with your rank, your highest certificate of competency, and your most recent vessel type. Recruiters filter by these details first.",
      "List your sea time in a clear table: vessel name, type, rank, sign-on and sign-off dates. Gaps should be explained briefly rather than hidden.",
      "Keep certifications up to date in a dedicated section, and note expiry dates so recruiters know you're ready to join immediately.",
    ],
  },
  {
    slug: "understanding-stcw-certificates",
    title: "Understanding STCW Certificates: A Quick Reference",
    excerpt:
      "A breakdown of the STCW certificates every seafarer needs, and how to keep track of renewal dates without the stress.",
    date: "2026-06-10",
    author: "MerchantNavyJobs Editorial Team",
    content: [
      "STCW (Standards of Training, Certification and Watchkeeping) certificates form the backbone of every seafarer's qualifications.",
      "Basic Safety Training, Advanced Fire Fighting, and Medical First Aid are foundational certificates required across almost all vessel types.",
      "Tanker vessels require additional endorsements such as Oil Tanker Familiarization or Advanced Oil Tanker Operations depending on rank.",
      "Set reminders at least three months before any certificate expires — many employers require a minimum validity period at the time of joining.",
    ],
  },
  {
    slug: "life-onboard-container-vessel",
    title: "What Life Is Really Like Onboard a Container Vessel",
    excerpt:
      "A first-hand look at daily routines, watch schedules, and downtime for officers and crew on modern container ships.",
    date: "2026-05-29",
    author: "Guest Contributor, Chief Officer",
    content: [
      "Life on a container vessel revolves around the watch schedule, whether that's a traditional 4-on-8-off or the more common 6-on-6-off rotation.",
      "Port calls are often short — sometimes under 24 hours — which means cargo operations and paperwork move fast, especially for deck officers.",
      "Downtime is spent in the ship's gym, mess room, or connecting with family via onboard Wi-Fi, which has become far more common on modern fleets.",
      "The camaraderie of a multinational crew is one of the most rewarding parts of the job, alongside the opportunity to see the world between contracts.",
    ],
  },
];

export type Applicant = {
  id: string;
  name: string;
  jobId: string;
  jobTitle: string;
  appliedAt: string;
  status: "New" | "Reviewed" | "Interview" | "Rejected" | "Hired";
  rank: string;
  experience: string;
};

export const applicants: Applicant[] = [
  {
    id: "a1",
    name: "Rohan Mehta",
    jobId: "2",
    jobTitle: "Second Officer",
    appliedAt: "2026-06-27",
    status: "New",
    rank: "Second Officer",
    experience: "3 years",
  },
  {
    id: "a2",
    name: "Carlos Dominguez",
    jobId: "2",
    jobTitle: "Second Officer",
    appliedAt: "2026-06-26",
    status: "Reviewed",
    rank: "Second Officer",
    experience: "5 years",
  },
  {
    id: "a3",
    name: "Priya Nair",
    jobId: "1",
    jobTitle: "Chief Engineer",
    appliedAt: "2026-06-25",
    status: "Interview",
    rank: "Chief Engineer",
    experience: "8 years",
  },
  {
    id: "a4",
    name: "James O'Connor",
    jobId: "4",
    jobTitle: "Third Engineer",
    appliedAt: "2026-06-21",
    status: "Rejected",
    rank: "Third Engineer",
    experience: "2 years",
  },
  {
    id: "a5",
    name: "Michael Santos",
    jobId: "1",
    jobTitle: "Chief Engineer",
    appliedAt: "2026-06-18",
    status: "Hired",
    rank: "Chief Engineer",
    experience: "10 years",
  },
];

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: "seeker" | "employer";
  joinedAt: string;
  status: "Active" | "Suspended";
};

export const platformUsers: PlatformUser[] = [
  { id: "u1", name: "Rohan Mehta", email: "rohan.mehta@example.com", role: "seeker", joinedAt: "2026-05-02", status: "Active" },
  { id: "u2", name: "Carlos Dominguez", email: "carlos.d@example.com", role: "seeker", joinedAt: "2026-05-14", status: "Active" },
  { id: "u3", name: "Priya Nair", email: "priya.nair@example.com", role: "seeker", joinedAt: "2026-04-30", status: "Active" },
  { id: "u4", name: "Anglo-Eastern Ship Management", email: "hr@angloeastern.com", role: "employer", joinedAt: "2026-03-11", status: "Active" },
  { id: "u5", name: "Wallem Ship Management", email: "careers@wallem.com", role: "employer", joinedAt: "2026-03-22", status: "Active" },
  { id: "u6", name: "V.Group", email: "recruitment@vgroup.com", role: "employer", joinedAt: "2026-02-18", status: "Suspended" },
];

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
  status: "Active" | "Suspended";
};

export const adminAccounts: AdminAccount[] = [
  { id: "sa1", name: "Super Admin", email: "superadmin@merchantnavyjobs.example", role: "superadmin", status: "Active" },
  { id: "ad1", name: "Site Admin", email: "admin@merchantnavyjobs.example", role: "admin", status: "Active" },
  { id: "ad2", name: "Fatima Rahman", email: "fatima.rahman@merchantnavyjobs.example", role: "admin", status: "Active" },
];

export const platformStats = {
  totalSeekers: 12480,
  totalEmployers: 340,
  totalJobsPosted: 1876,
  applicationsThisWeek: 942,
};

export type Testimonial = {
  id: string;
  name: string;
  rank: string;
  location: string;
  quote: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Arjun Nair",
    rank: "Third Officer",
    location: "Kochi, India",
    quote:
      "I could filter by rank and vessel type instead of scrolling through listings that didn't apply to me. Applied to a container vessel role and heard back within a week.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Marco Silva",
    rank: "Second Engineer",
    location: "Lisbon, Portugal",
    quote:
      "Being able to check a company's fleet size and vessel types before applying made it easy to shortlist the contracts that actually matched my experience.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Deepak Rao",
    rank: "Able Seaman",
    location: "Mumbai, India",
    quote:
      "Straightforward application process and a dashboard where I can track every contract I've applied to in one place.",
    rating: 4,
  },
  
];
export const candidates = [
  { id: "1", name: "John Doe", rank: "Master Mariner", nationality: "Indian", experienceYears: 12, vesselType: "LNG Carrier", cocIssuingCountry: "UK (MCA)" }
];

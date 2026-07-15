import { jobs as baseJobs, type Job } from "./mock-data";
import { MOCK_EMPLOYER_EMAIL } from "../context/auth-context";

export type JobStatus = "draft" | "pending" | "live" | "paused" | "closed" | "rejected";

export type StoredJob = Job & {
  status: JobStatus;
  submittedByName: string;
  submittedByEmail: string;
};

const JOBS_KEY = "mnj_jobs";

const VSHIPS = "V.Ships India";

// Sample employer submissions awaiting verification, shown until the admin
// panel's own localStorage state has been written for the first time.
const seedPendingJobs: StoredJob[] = [
  {
    id: "pending-1",
    title: "Third Officer",
    company: "Anglo-Eastern Ship Management",
    location: "Singapore",
    rank: "Third Officer",
    vesselType: "Container Vessel",
    contractLength: "6 months",
    salary: "$3,200 - $3,800 / month",
    salaryMin: 3200,
    minExperienceYears: 0.5,
    type: "Contract",
    category: "Ship",
    postedAt: "2026-06-29",
    tags: ["COC Class 3", "Container", "Immediate joining"],
    description:
      "Third Officer required for a modern container vessel operating on the Asia-Europe trade.",
    responsibilities: [
      "Navigation watchkeeping duties",
      "Maintain safety equipment and firefighting gear",
      "Assist with cargo documentation",
    ],
    requirements: [
      "Valid COC Class 3 (Officer of the Watch)",
      "Valid STCW and medical certificates",
      "Willingness to join immediately",
    ],
    status: "pending",
    submittedByName: "Anglo-Eastern Ship Management",
    submittedByEmail: "hr@angloeastern.com",
  },
  {
    id: "pending-2",
    title: "Chief Cook",
    company: "Wallem Ship Management",
    location: "Rotterdam, Netherlands",
    rank: "Able Seaman",
    vesselType: "Bulk Carrier",
    contractLength: "8 months",
    salary: "$2,000 - $2,400 / month",
    salaryMin: 2000,
    minExperienceYears: 1,
    type: "Contract",
    category: "Ship",
    postedAt: "2026-06-30",
    tags: ["Catering", "Bulk Carrier", "European trade"],
    description:
      "Experienced Chief Cook required for a bulk carrier trading between European and West African ports.",
    responsibilities: [
      "Plan and prepare meals for crew",
      "Manage galley stores and hygiene standards",
      "Assist with provisioning at port calls",
    ],
    requirements: [
      "Ship's Cook certificate",
      "Minimum 1 year experience as Chief Cook",
      "Valid STCW certificates",
    ],
    status: "pending",
    submittedByName: "Wallem Ship Management",
    submittedByEmail: "careers@wallem.com",
  },
  {
    id: "pending-3",
    title: "Ordinary Seaman (OS)",
    company: "V.Group",
    location: "Mumbai, India",
    rank: "Ordinary Seaman",
    vesselType: "Tanker",
    contractLength: "9 months",
    salary: "$900 - $1,100 / month",
    salaryMin: 900,
    minExperienceYears: 0,
    type: "Contract",
    category: "Ship",
    postedAt: "2026-07-01",
    tags: ["Tanker", "Entry level", "Immediate joining"],
    description:
      "Reputable tanker operator hiring Ordinary Seamen for crude oil tankers on the Middle East to Asia route.",
    responsibilities: [
      "Deck maintenance and mooring assistance",
      "General housekeeping and safety duties",
      "Assist officers during navigation watch",
    ],
    requirements: [
      "Valid OS certificate",
      "Tanker familiarization (Basic)",
      "Valid STCW and medical certificates",
    ],
    status: "pending",
    submittedByName: "V.Group",
    submittedByEmail: "recruitment@vgroup.com",
  },
];

function vshipsJob(overrides: Partial<StoredJob> & { id: string; title: string }): StoredJob {
  return {
    company: VSHIPS,
    location: "Mumbai, India",
    rank: "AB",
    department: "Deck",
    vesselType: "Container",
    contractLength: "6 months",
    salary: "$0 - $0",
    salaryMin: 0,
    salaryFrom: 0,
    salaryTo: 0,
    currency: "USD",
    salaryNegotiable: false,
    minExperienceYears: 0,
    type: "Contract",
    category: "Ship",
    postedAt: "2026-07-13",
    joiningDate: "TBD",
    tags: [],
    description: "",
    responsibilities: [],
    requirements: [],
    itfApproved: false,
    rpslValid: false,
    status: "draft",
    submittedByName: VSHIPS,
    submittedByEmail: MOCK_EMPLOYER_EMAIL,
    ...overrides,
  };
}

// Demo employer's own job postings, seeded so Manage Jobs / Applications /
// Analytics have real, internally-consistent data to show on first login.
const seedEmployerJobs: StoredJob[] = [
  vshipsJob({
    id: "vs-1",
    title: "AB required for Container",
    rank: "AB",
    department: "Deck",
    vesselType: "Container",
    status: "live",
  }),
  vshipsJob({
    id: "vs-2",
    title: "Oiler required for Bulk Carrier",
    rank: "Oiler",
    department: "Engine",
    vesselType: "Bulk Carrier",
    status: "paused",
  }),
  vshipsJob({
    id: "vs-3",
    title: "AB required for Tanker",
    rank: "AB",
    department: "Deck",
    vesselType: "Tanker",
    status: "draft",
  }),
  vshipsJob({
    id: "vs-4",
    title: "TEST 3rd Officer Container",
    rank: "3rd Officer",
    department: "Deck",
    vesselType: "Container",
    joiningDate: "2026-02-01",
    salary: "$5,000 - $7,000",
    salaryFrom: 5000,
    salaryTo: 7000,
    salaryMin: 5000,
    status: "live",
  }),
  vshipsJob({
    id: "vs-5",
    title: "3rd Officer",
    rank: "3rd Officer",
    department: "Deck",
    vesselType: "Tanker",
    joiningDate: "2026-07-23",
    salary: "$3,500 - $5,000",
    salaryFrom: 3500,
    salaryTo: 5000,
    salaryMin: 3500,
    postedAt: "2026-07-07",
    status: "draft",
  }),
  vshipsJob({
    id: "vs-6",
    title: "Chief Engineer",
    rank: "Chief Engineer",
    department: "Engine",
    vesselType: "Offshore",
    joiningDate: "2026-07-16",
    salary: "$10,500 - $14,500",
    salaryFrom: 10500,
    salaryTo: 14500,
    salaryMin: 10500,
    postedAt: "2026-07-07",
    status: "draft",
  }),
  vshipsJob({
    id: "vs-7",
    title: "Deck Cadet",
    rank: "Deck Cadet",
    department: "Deck",
    vesselType: "Tanker",
    joiningDate: "2026-07-28",
    salary: "$400 - $800",
    salaryFrom: 400,
    salaryTo: 800,
    salaryMin: 400,
    postedAt: "2026-07-07",
    status: "draft",
  }),
  vshipsJob({
    id: "vs-8",
    title: "3rd Officer",
    rank: "3rd Officer",
    department: "Deck",
    vesselType: "Bulk Carrier",
    joiningDate: "2026-09-11",
    salary: "$3,500 - $5,000",
    salaryFrom: 3500,
    salaryTo: 5000,
    salaryMin: 3500,
    postedAt: "2026-07-07",
    status: "draft",
  }),
  vshipsJob({
    id: "vs-9",
    title: "Deck Cadet",
    rank: "Deck Cadet",
    department: "Deck",
    vesselType: "Tanker",
    joiningDate: "2026-09-10",
    salary: "$400 - $800",
    salaryFrom: 400,
    salaryTo: 800,
    salaryMin: 400,
    postedAt: "2026-07-07",
    status: "draft",
  }),
  vshipsJob({
    id: "vs-10",
    title: "Deck Cadet",
    rank: "Deck Cadet",
    department: "Deck",
    vesselType: "Tanker",
    joiningDate: "2026-08-03",
    salary: "$400 - $800",
    salaryFrom: 400,
    salaryTo: 800,
    salaryMin: 400,
    postedAt: "2026-07-07",
    status: "draft",
  }),
];

const seedJobs: StoredJob[] = [...seedEmployerJobs, ...seedPendingJobs];

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

function getStoredJobs(): StoredJob[] {
  return readJSON<StoredJob[]>(JOBS_KEY, seedJobs);
}

function saveStoredJobs(list: StoredJob[]) {
  writeJSON(JOBS_KEY, list);
}

function newId() {
  return `job-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

// Jobs visible on the public website: the seeded catalog plus anything an
// admin/superadmin has verified and published.
export function getLiveJobs(): Job[] {
  return [...getStoredJobs().filter((j) => j.status === "live"), ...baseJobs];
}

export function findJob(id: string): Job | undefined {
  return getLiveJobs().find((j) => j.id === id);
}

export function getJobById(id: string): StoredJob | undefined {
  return getStoredJobs().find((j) => j.id === id);
}

// Employer-submitted jobs awaiting admin verification.
export function getPendingJobs(): StoredJob[] {
  return getStoredJobs().filter((j) => j.status === "pending");
}

export function getJobsSubmittedBy(email: string): StoredJob[] {
  return getStoredJobs().filter(
    (j) => j.submittedByEmail.toLowerCase() === email.toLowerCase()
  );
}

export const getEmployerJobs = getJobsSubmittedBy;

// Employer posts a job -> enters the verification queue, not yet live.
export function submitJobForReview(
  job: Omit<Job, "id" | "postedAt">,
  submittedByName: string,
  submittedByEmail: string
): StoredJob {
  const newJob: StoredJob = {
    ...job,
    id: newId(),
    postedAt: new Date().toISOString().slice(0, 10),
    status: "pending",
    submittedByName,
    submittedByEmail,
  };
  saveStoredJobs([newJob, ...getStoredJobs()]);
  return newJob;
}

// Admin enters an already-verified job directly -> published immediately.
export function addVerifiedJob(
  job: Omit<Job, "id" | "postedAt">,
  publishedByName: string,
  publishedByEmail: string
): StoredJob {
  const newJob: StoredJob = {
    ...job,
    id: newId(),
    postedAt: new Date().toISOString().slice(0, 10),
    status: "live",
    submittedByName: publishedByName,
    submittedByEmail: publishedByEmail,
  };
  saveStoredJobs([newJob, ...getStoredJobs()]);
  return newJob;
}

// Employer saves an in-progress posting without submitting it anywhere.
export function saveJobDraft(
  job: Omit<Job, "id" | "postedAt">,
  submittedByName: string,
  submittedByEmail: string
): StoredJob {
  const newJob: StoredJob = {
    ...job,
    id: newId(),
    postedAt: new Date().toISOString().slice(0, 10),
    status: "draft",
    submittedByName,
    submittedByEmail,
  };
  saveStoredJobs([newJob, ...getStoredJobs()]);
  return newJob;
}

// Employer publishes a job: live immediately if the company is verified,
// otherwise it enters the same pending-approval queue as submitJobForReview.
export function publishEmployerJob(
  job: Omit<Job, "id" | "postedAt">,
  submittedByName: string,
  submittedByEmail: string,
  isVerified: boolean
): StoredJob {
  const newJob: StoredJob = {
    ...job,
    id: newId(),
    postedAt: new Date().toISOString().slice(0, 10),
    status: isVerified ? "live" : "pending",
    submittedByName,
    submittedByEmail,
  };
  saveStoredJobs([newJob, ...getStoredJobs()]);
  return newJob;
}

// Employer publishes an existing draft.
export function publishDraftJob(id: string, isVerified: boolean) {
  saveStoredJobs(
    getStoredJobs().map((j) =>
      j.id === id ? { ...j, status: (isVerified ? "live" : "pending") as JobStatus } : j
    )
  );
}

export function pauseJob(id: string) {
  saveStoredJobs(
    getStoredJobs().map((j) => (j.id === id ? { ...j, status: "paused" as JobStatus } : j))
  );
}

export function reopenJob(id: string) {
  saveStoredJobs(
    getStoredJobs().map((j) => (j.id === id ? { ...j, status: "live" as JobStatus } : j))
  );
}

export function closeJob(id: string) {
  saveStoredJobs(
    getStoredJobs().map((j) => (j.id === id ? { ...j, status: "closed" as JobStatus } : j))
  );
}

// Admin/superadmin verifies a pending employer submission -> goes live on the website.
export function publishJob(id: string) {
  saveStoredJobs(
    getStoredJobs().map((j) => (j.id === id ? { ...j, status: "live" as const } : j))
  );
}

export function rejectJob(id: string) {
  saveStoredJobs(
    getStoredJobs().map((j) => (j.id === id ? { ...j, status: "rejected" as const } : j))
  );
}

export function removeJob(id: string) {
  saveStoredJobs(getStoredJobs().filter((j) => j.id !== id));
}

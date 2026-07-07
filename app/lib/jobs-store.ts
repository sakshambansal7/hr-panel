import { jobs as baseJobs, type Job } from "./mock-data";

export type JobStatus = "pending" | "live" | "rejected";

export type StoredJob = Job & {
  status: JobStatus;
  submittedByName: string;
  submittedByEmail: string;
};

const JOBS_KEY = "mnj_jobs";

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
  return readJSON<StoredJob[]>(JOBS_KEY, seedPendingJobs);
}

function saveStoredJobs(list: StoredJob[]) {
  writeJSON(JOBS_KEY, list);
}

// Jobs visible on the public website: the seeded catalog plus anything an
// admin/superadmin has verified and published.
export function getLiveJobs(): Job[] {
  return [...getStoredJobs().filter((j) => j.status === "live"), ...baseJobs];
}

export function findJob(id: string): Job | undefined {
  return getLiveJobs().find((j) => j.id === id);
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

// Employer posts a job -> enters the verification queue, not yet live.
export function submitJobForReview(
  job: Omit<Job, "id" | "postedAt">,
  submittedByName: string,
  submittedByEmail: string
): StoredJob {
  const newJob: StoredJob = {
    ...job,
    id: `job-${Date.now()}`,
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
    id: `job-${Date.now()}`,
    postedAt: new Date().toISOString().slice(0, 10),
    status: "live",
    submittedByName: publishedByName,
    submittedByEmail: publishedByEmail,
  };
  saveStoredJobs([newJob, ...getStoredJobs()]);
  return newJob;
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

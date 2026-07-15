export type ApplicationStage =
  | "applied"
  | "viewed"
  | "shortlisted"
  | "contacted"
  | "interview"
  | "selected"
  | "rejected"
  | "joined";

export type JobApplication = {
  id: string;
  jobId: string;
  candidateName: string;
  candidateRank: string;
  location: string;
  availability: string;
  stage: ApplicationStage;
  appliedAt: string;
};

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  applied: "Applied",
  viewed: "Viewed by HR",
  shortlisted: "Shortlisted",
  contacted: "Contacted",
  interview: "Interview / Discussion",
  selected: "Selected",
  rejected: "Rejected",
  joined: "Joined",
};

export const STAGE_ORDER: ApplicationStage[] = [
  "applied",
  "viewed",
  "shortlisted",
  "contacted",
  "interview",
  "selected",
  "rejected",
  "joined",
];

const APPLICATIONS_KEY = "mnj_employer_applications";

const seedApplications: JobApplication[] = [
  {
    id: "app-1",
    jobId: "vs-1",
    candidateName: "Rajesh Kumar",
    candidateRank: "2nd Officer",
    location: "Mumbai, India",
    availability: "Available Immediately",
    stage: "shortlisted",
    appliedAt: "2026-07-13",
  },
  {
    id: "app-2",
    jobId: "vs-2",
    candidateName: "Rajesh Kumar",
    candidateRank: "2nd Officer",
    location: "Mumbai, India",
    availability: "Available Immediately",
    stage: "applied",
    appliedAt: "2026-07-13",
  },
  {
    id: "app-3",
    jobId: "vs-3",
    candidateName: "Rajesh Kumar",
    candidateRank: "2nd Officer",
    location: "Mumbai, India",
    availability: "Available Immediately",
    stage: "applied",
    appliedAt: "2026-07-13",
  },
  {
    id: "app-4",
    jobId: "vs-5",
    candidateName: "Rajesh Kumar",
    candidateRank: "2nd Officer",
    location: "Mumbai, India",
    availability: "Available Immediately",
    stage: "applied",
    appliedAt: "2026-07-13",
  },
  {
    id: "app-5",
    jobId: "vs-5",
    candidateName: "TEST_User",
    candidateRank: "3rd Officer",
    location: "Chennai, India",
    availability: "Available in 30 days",
    stage: "applied",
    appliedAt: "2026-07-07",
  },
  {
    id: "app-6",
    jobId: "vs-5",
    candidateName: "TEST QuickApply",
    candidateRank: "3rd Officer",
    location: "Kochi, India",
    availability: "Available Immediately",
    stage: "applied",
    appliedAt: "2026-07-07",
  },
  {
    id: "app-7",
    jobId: "vs-5",
    candidateName: "TEST QuickApply",
    candidateRank: "3rd Officer",
    location: "Kochi, India",
    availability: "Available Immediately",
    stage: "applied",
    appliedAt: "2026-07-07",
  },
  {
    id: "app-8",
    jobId: "vs-5",
    candidateName: "TEST_User",
    candidateRank: "3rd Officer",
    location: "Chennai, India",
    availability: "Available in 30 days",
    stage: "applied",
    appliedAt: "2026-07-07",
  },
  {
    id: "app-9",
    jobId: "vs-5",
    candidateName: "Seafarer",
    candidateRank: "3rd Officer",
    location: "—",
    availability: "—",
    stage: "applied",
    appliedAt: "2026-07-07",
  },
  {
    id: "app-10",
    jobId: "vs-5",
    candidateName: "Seafarer",
    candidateRank: "3rd Officer",
    location: "—",
    availability: "—",
    stage: "applied",
    appliedAt: "2026-07-07",
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

function getStoredApplications(): JobApplication[] {
  return readJSON<JobApplication[]>(APPLICATIONS_KEY, seedApplications);
}

function saveStoredApplications(list: JobApplication[]) {
  writeJSON(APPLICATIONS_KEY, list);
}

export function getApplicationsForJob(jobId: string): JobApplication[] {
  return getStoredApplications().filter((a) => a.jobId === jobId);
}

export function getApplicationsForJobs(jobIds: string[]): JobApplication[] {
  const set = new Set(jobIds);
  return getStoredApplications().filter((a) => set.has(a.jobId));
}

export function countApplicationsForJob(jobId: string): number {
  return getApplicationsForJob(jobId).length;
}

export function countNewForJob(jobId: string): number {
  return getApplicationsForJob(jobId).filter((a) => a.stage === "applied").length;
}

export function setApplicationStage(id: string, stage: ApplicationStage) {
  saveStoredApplications(
    getStoredApplications().map((a) => (a.id === id ? { ...a, stage } : a))
  );
}

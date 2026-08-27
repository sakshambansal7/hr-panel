export interface Job {
  id: string; 
  title?: string;
  rank?: string;
  vessel_type?: string;
  department?: string;
  [key: string]: any; 
}

export type JobStatus = "draft" | "pending" | "live" | "paused" | "closed" | "rejected";

export type StoredJob = Job & {
  status: JobStatus;
  submittedByName: string;
  submittedByEmail: string;
};

const JOBS_KEY = "mnj_jobs";

const readJSON = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = <T>(key: string, value: T) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const getStoredJobs = (): StoredJob[] => {
  return readJSON<StoredJob[]>(JOBS_KEY, []);
};

const saveStoredJobs = (list: StoredJob[]) => {
  writeJSON(JOBS_KEY, list);
};

const newId = () => {
  return `job-${Date.now()}-${Math.round(Math.random() * 1000)}`;
};

export function getLiveJobs(): Job[] {
  return [...getStoredJobs().filter((j) => j.status === "live")]; 
}

export function findJob(id: string): Job | undefined {
  return getLiveJobs().find((j) => j.id === id);
}

export function getJobById(id: string): StoredJob | undefined {
  return getStoredJobs().find((j) => j.id === id);
}

export function getPendingJobs(): StoredJob[] {
  return getStoredJobs().filter((j) => j.status === "pending");
}

export function getJobsSubmittedBy(email: string): StoredJob[] {
  return getStoredJobs().filter(
    (j) => j.submittedByEmail.toLowerCase() === email.toLowerCase()
  );
}

export const getEmployerJobs = getJobsSubmittedBy;

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
export type CandidateProfile = {
  phone: string;
  rank: string;
  experienceYears: number | null;
  certificates: string[];
  resumeFileName: string;
  passportFileName: string;
  cdcFileName: string;
  photoFileName: string;
};

export const emptyProfile: CandidateProfile = {
  phone: "",
  rank: "",
  experienceYears: null,
  certificates: [],
  resumeFileName: "",
  passportFileName: "",
  cdcFileName: "",
  photoFileName: "",
};

export function profileCompletionPercent(profile: CandidateProfile): number {
  const checks = [
    !!profile.phone,
    !!profile.rank,
    profile.experienceYears !== null,
    profile.certificates.length > 0,
    !!profile.resumeFileName,
    !!profile.passportFileName,
    !!profile.cdcFileName,
    !!profile.photoFileName,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export type ApplicationStatus = "Submitted" | "Reviewed" | "Interview" | "Rejected" | "Hired";

export type Application = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: ApplicationStatus;
  comment: string;
};

export type NotificationItem = {
  id: string;
  message: string;
  createdAt: string;
};

function profileKey(email: string) {
  return `mnj_profile_${email.toLowerCase()}`;
}
function applicationsKey(email: string) {
  return `mnj_applications_${email.toLowerCase()}`;
}
function savedJobsKey(email: string) {
  return `mnj_saved_jobs_${email.toLowerCase()}`;
}
function notificationsKey(email: string) {
  return `mnj_notifications_${email.toLowerCase()}`;
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

export function getProfile(email: string): CandidateProfile {
  return readJSON(profileKey(email), emptyProfile);
}

export function saveProfile(email: string, profile: CandidateProfile) {
  writeJSON(profileKey(email), profile);
}

export function getApplications(email: string): Application[] {
  return readJSON(applicationsKey(email), []);
}

export function hasApplied(email: string, jobId: string): boolean {
  return getApplications(email).some((a) => a.jobId === jobId);
}

export function addApplication(
  email: string,
  application: Omit<Application, "id" | "appliedAt" | "status">
): Application {
  const applications = getApplications(email);
  const newApplication: Application = {
    ...application,
    id: `app-${Date.now()}`,
    appliedAt: new Date().toISOString(),
    status: "Submitted",
  };
  writeJSON(applicationsKey(email), [newApplication, ...applications]);
  return newApplication;
}

export function getSavedJobIds(email: string): string[] {
  return readJSON(savedJobsKey(email), []);
}

export function toggleSavedJob(email: string, jobId: string): string[] {
  const saved = getSavedJobIds(email);
  const next = saved.includes(jobId)
    ? saved.filter((id) => id !== jobId)
    : [...saved, jobId];
  writeJSON(savedJobsKey(email), next);
  return next;
}

export function getNotifications(email: string): NotificationItem[] {
  return readJSON(notificationsKey(email), []);
}

export function addNotifications(email: string, messages: string[]) {
  const existing = getNotifications(email);
  const newItems: NotificationItem[] = messages.map((message, i) => ({
    id: `notif-${Date.now()}-${i}`,
    message,
    createdAt: new Date().toISOString(),
  }));
  writeJSON(notificationsKey(email), [...newItems, ...existing]);
}

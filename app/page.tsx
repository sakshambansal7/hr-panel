import Link from "next/link";
import { companies, jobs, testimonials } from "./lib/mock-data"; 
import {
  ShipIllustration,
  ShipWheelIcon,
} from "./components/icons";

const RECRUITER_LINKS = [
  { label: "Find Officers", category: "Officer" },
  { label: "Find Engineers", category: "Engineer" },
  { label: "Find Ratings/Crew", category: "Crew" },
] as const;

function jobInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function RecruiterHome() {
  // Using the existing jobs structure as available "talent profiles" for now
  const featuredTalent = jobs.slice(0, 4);

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-4 border-blue-600 bg-linear-to-br from-slate-950 via-slate-900 to-slate-900 pb-24 pt-20 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <div className="absolute left-1/4 top-1/2 h-150 w-150 -translate-y-1/2 rounded-full bg-blue-600 blur-[160px]" />
          <div className="absolute bottom-0 right-10 h-150 w-150 rounded-full bg-cyan-500 blur-[140px]" />
        </div>
        <ShipIllustration className="pointer-events-none absolute bottom-6 right-0 hidden h-40 w-72 text-white/10 sm:block sm:h-56 sm:w-96" />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <ShipWheelIcon className="h-3.5 w-3.5" />
            Crewing & Maritime Recruitment Hub
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            Source Certified Seafarers Globally
          </h1>
          <p className="mt-3 text-slate-300">
            Instantly connect with compliant merchant navy officers, engineers, and crew verified and ready for deployment.
          </p>

          {/* Search Talent Pool */}
          <form
            action="/candidates"
            className="mt-8 flex flex-col gap-2 rounded-lg bg-white p-2 shadow-xl sm:flex-row"
          >
            <input
              type="text"
              name="rank"
              placeholder="Desired rank (e.g., Master Mariner, Chief Engineer)"
              className="flex-1 px-4 py-3 text-sm border-r border-slate-200 text-zinc-900 focus:outline-none"
            />
            <input
              type="text"
              name="vesselType"
              placeholder="Vessel experience (e.g., Oil Tanker)"
              className="flex-1 rounded-md px-4 py-3 text-sm text-zinc-900 focus:outline-none sm:max-w-55"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Search Talent
            </button>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {RECRUITER_LINKS.map((c) => (
              <Link
                key={c.category}
                href={`/candidates?category=${c.category}`}
                className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/20"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto -mt-8 relative z-10 w-full max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:grid-cols-4">
          <div>
            <p className="text-2xl font-black text-blue-600">45k+</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Seafarers</p>
          </div>
          <div>
            <p className="text-2xl font-black text-blue-600">98.4%</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Vetting Pass Rate</p>
          </div>
          <div>
            <p className="text-2xl font-black text-blue-600">&lt; 5 Days</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Avg. Time to Hire</p>
          </div>
          <div>
            <p className="text-2xl font-black text-blue-600">120+</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Shipping Lines Onboard</p>
          </div>
        </div>
      </section>

      {/* Featured Talent Profiles Section */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Immediately Available Talent</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Verified certificates (STCW, CoC) and active medicals.</p>
          </div>
          <Link href="/candidates" className="text-sm font-semibold text-blue-600 hover:underline">
            Browse pool &rarr;
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTalent.map((talent) => (
            <div
              key={talent.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-slate-800 to-slate-950 text-sm font-extrabold text-white">
                      {jobInitials(talent.title)}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-snug text-zinc-900">
                        {talent.title}
                      </p>
                      <p className="text-xs text-zinc-500">{talent.location}</p>
                    </div>
                  </div>
                  <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 border border-emerald-200">
                    Ready
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-zinc-100 pt-3 text-xs text-zinc-600">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Vessel Focus</span>
                    <span className="font-semibold text-zinc-800 truncate max-w-28 text-right">{talent.vesselType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Target Salary</span>
                    <span className="font-semibold text-zinc-800">{talent.salary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Availability</span>
                    <span className="font-semibold text-blue-600">Immediate</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-3">
                <Link
                  href={`/candidates/${talent.id}`}
                  className="block rounded-md bg-slate-900 py-1.5 text-center text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  Review Passport & CV
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recruiter Value Banner */}
      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border-l-4 border-blue-600 bg-slate-900 p-8 text-white shadow-sm sm:flex-row">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Smart Compliance Vetting
            </span>
            <h2 className="text-xl font-bold sm:text-2xl">
              Automate STCW verification and document tracking
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Stop digging through fragmented PDFs. Use our built-in credential ledger to screen certifications, flag expirations, and verify endorsements instantly.
            </p>
          </div>
          <Link
            href="/recruiter/features"
            className="w-full shrink-0 rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-blue-500 sm:w-auto transition-colors"
          >
            Explore Employer Tools
          </Link>
        </div>
      </section>

      {/* Placement Testimonials */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-zinc-900">
            Trusted by Crewhouses & Ship Managers
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            How maritime recruiters optimize their mobilization metrics.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <p className="text-sm italic leading-relaxed text-zinc-600">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                <div>
                  <p className="text-sm font-bold text-zinc-900">{t.name}</p>
                  <p className="text-xs text-zinc-500">
                    Crewing Manager &middot; {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Recruiter Conversion Area */}
      <section className="relative overflow-hidden bg-slate-900 px-4 py-16 mb-6 text-white sm:px-6">
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-white">
            Ready to accelerate your crewing pipeline?
          </h2>
          <p className="mt-2 text-slate-300 max-w-lg mx-auto text-sm">
            Post vacancies, source specific crew complements, and handle rosters from a single unified workspace.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/post-job"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Create Crew Vacancy
            </Link>
            <Link
              href="/pricing"
              className="inline-block rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              View Enterprise Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import DashboardShell from "../components/DashboardShell";

type Review = {
  id: string;
  name: string;
  rank: string;
  rating: number;
  date: string;
  comment: string;
};

const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Arjun Nair",
    rank: "Third Officer",
    rating: 5,
    date: "2026-06-18",
    comment:
      "Smooth onboarding process and salary was credited on time every month. Would sail with V.Ships again.",
  },
  {
    id: "r2",
    name: "Deepak Rao",
    rank: "Able Seaman",
    rating: 4,
    date: "2026-05-30",
    comment:
      "Good vessel maintenance and communication from the crewing team. Sign-off took a bit longer than expected.",
  },
  {
    id: "r3",
    name: "Marco Silva",
    rank: "Second Engineer",
    rating: 4,
    date: "2026-05-02",
    comment: "Professional management and clear contract terms from the start.",
  },
];

const RATING_BREAKDOWN = [
  { stars: 5, count: 1 },
  { stars: 4, count: 2 },
  { stars: 3, count: 0 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-[#F5B61A] text-[#F5B61A]" : "text-slate-200"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function ReviewsClient() {
  const total = REVIEWS.length;
  const average = total ? REVIEWS.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const maxCount = Math.max(...RATING_BREAKDOWN.map((b) => b.count), 1);

  return (
    <DashboardShell pageTitle="Reviews">
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
          Reviews
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
          Company Reviews
        </h1>
        <p className="text-sm text-slate-500">
          What seafarers who've sailed with your company are saying.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-fit space-y-5 rounded-[20px] border border-[#E7EAF1] bg-white p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
        >
          <div className="text-center">
            <p className="text-4xl font-extrabold text-[#0F1E35]">{average.toFixed(1)}</p>
            <div className="mt-1 flex justify-center">
              <Stars rating={Math.round(average)} />
            </div>
            <p className="mt-1 text-xs font-medium text-slate-400">{total} reviews</p>
          </div>

          <div className="space-y-2">
            {RATING_BREAKDOWN.map((b) => (
              <div key={b.stars} className="flex items-center gap-2 text-xs">
                <span className="w-8 shrink-0 font-semibold text-slate-500">{b.stars}★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#F5B61A]"
                    style={{ width: `${(b.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-4 shrink-0 text-right font-semibold text-slate-400">
                  {b.count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-3">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F1E35] text-sm font-bold text-white">
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#0F1E35]">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.rank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Stars rating={r.rating} />
                  <p className="mt-1 text-[10px] font-medium text-slate-400">{r.date}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.comment}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

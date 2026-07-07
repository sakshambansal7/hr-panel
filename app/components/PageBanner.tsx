import type { ReactNode } from "react";
import { WaveDivider } from "./icons";

export default function PageBanner({
  icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 pb-24 pt-20  text-white sm:px-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="relative mx-auto max-w-3xl text-center">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-yellow-300">
            {icon}
            {eyebrow}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-3 text-blue-200">{subtitle}</p>}
      </div>
      <WaveDivider className="absolute bottom-0 left-0 h-14 w-full text-white" />
    </div>
  );
}

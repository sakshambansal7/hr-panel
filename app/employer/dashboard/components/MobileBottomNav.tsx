"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV_ITEMS, IMPLEMENTED_HREFS } from "../nav-items";

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[#E7EAF1] bg-white/95 px-1 py-2 backdrop-blur-md lg:hidden">
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        const isImplemented = IMPLEMENTED_HREFS.has(item.href);
        const content = (
          <>
            <Icon
              className={`h-5 w-5 ${isActive ? "text-[#F5B61A]" : "text-slate-400"}`}
              strokeWidth={2}
            />
            <span
              className={`text-[10px] font-semibold ${
                isActive ? "text-[#0F1E35]" : "text-slate-400"
              }`}
            >
              {item.label}
            </span>
          </>
        );
        return isImplemented ? (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5"
          >
            {content}
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5"
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}

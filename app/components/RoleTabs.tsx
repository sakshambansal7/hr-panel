"use client";

import type { Role } from "../context/auth-context";

export default function RoleTabs({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <div className="mb-6 grid grid-cols-2 rounded-full bg-zinc-100 p-1 text-sm font-medium">
     
      <button
        type="button"
        onClick={() => onChange("employer")}
        className={`rounded-full py-2 transition-colors ${
          role === "employer"
            ? "bg-white text-blue-950 shadow"
            : "text-zinc-600 hover:text-zinc-900"
        }`}
      >
        Employer
      </button>
       <button
        type="button"
        onClick={() => onChange("seeker")}
        className={`rounded-full py-2 transition-colors ${
          role === "seeker"
            ? "bg-white text-blue-950 shadow"
            : "text-zinc-600 hover:text-zinc-900"
        }`}
      >
        Job seeker
      </button>
    </div>
  );
}

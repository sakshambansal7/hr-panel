"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/auth-context";
import RoleTabs from "../components/RoleTabs";
import type { Role } from "../context/auth-context";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "employer" ? "employer" : "seeker";

  const { login } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = login(email, password, role);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const next = searchParams.get("next");
    router.push(next || (role === "employer" ? "/employer/dashboard" : "/dashboard"));
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">Sign in</h1>
        <p className="mb-6 text-sm text-zinc-500">
          Get hired, or find your next crew member.
        </p>

        <RoleTabs role={role} onChange={setRole} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-yellow-400 py-2.5 text-sm font-semibold text-blue-950 hover:bg-yellow-300"
          >
            Sign in as {role === "employer" ? "employer" : "job seeker"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          New to MerchantNavyJobs?{" "}
          <Link
            href={`/signup${role === "employer" ? "?role=employer" : ""}`}
            className="font-medium text-blue-900 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

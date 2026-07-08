"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../context/auth-context";
import RoleTabs from "../components/RoleTabs";
import type { Role } from "../context/auth-context";

export default function SignupForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "employer" ? "employer" : "seeker";

  const { signup } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState(""); // Used for Full Name (Seeker) or Contact Person Name (Employer)
  const [companyName, setCompanyName] = useState(""); // Explicitly for Recruiter/Employer
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Auto-redirect job seekers away from the recruiter app to your live seafarer frontend app link
  useEffect(() => {
    if (role === "seeker") {
      window.location.href = "https://nznf4dcd-3000.inc1.devtunnels.ms/signup";
    }
  }, [role]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Pass contact name down. If employer, you can store your custom companyName field via metadata payload configurations
    const result = signup(name, email, password, role);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    // Optional structure sync placeholder: If backend save handles object modifications, save local storage profiles here
    if (role === "employer") {
      const employerPayload = {
        companyName: companyName.trim(),
        contactName: name.trim(),
        email: email.trim()
      };
      localStorage.setItem(`employer_meta_${email}`, JSON.stringify(employerPayload));
    }

    router.push(role === "employer" ? "/employer/dashboard" : "/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">Create your account</h1>
        <p className="mb-6 text-sm text-zinc-500">
          {role === "employer"
            ? "Post jobs and find qualified seafarers."
            : "Get matched with maritime employers."}
        </p>

        <RoleTabs role={role} onChange={setRole} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Conditional Fields depending on selected active Tab */}
          {role === "employer" ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-md  text-gray-800 border border-zinc-300 px-3 py-2 text-sm focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  User Name / Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border text-gray-800 border-zinc-300 px-3 py-2 text-sm focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950"
                  placeholder=" Company Admin"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Full name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border text-gray-800 border-zinc-300 px-3 py-2 text-sm focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950"
                placeholder="Jane Seafarer"
              />
            </div>
          )}

          {/* 2. Common Fields */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-300 text-gray-800 px-3 py-2 text-sm focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950"
              placeholder="recruiter@company.com"
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
              className="w-full rounded-md border border-zinc-300 px-3  text-gray-800 py-2 text-sm focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Confirm password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300   text-gray-800 px-3 py-2 text-sm focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-yellow-400 py-2.5 text-sm font-semibold text-blue-950 hover:bg-yellow-300"
          >
            Create {role === "employer" ? "employer" : "job seeker"} account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            href={role === "seeker" ? "https://nznf4dcd-3000.inc1.devtunnels.ms/login" : "/login?role=employer"}
            className="font-medium text-blue-900 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
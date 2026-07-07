"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/auth-context";
import type { Role } from "../context/auth-context";
import { AnchorIcon, CloseIcon, LogoutIcon, MenuIcon, UserIcon } from "./icons";



function roleLabel(role: Role) {
  switch (role) {
    case "superadmin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "employer":
      return "Employer";
    case "seeker":
      return "Seafarer";
  }
}

function dashboardHref(role: Role) {
  if (role === "employer") return "/employer/dashboard";
  if (role === "admin" || role === "superadmin") return "/admin";
  return "/dashboard";
}

export default function Header() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setMobileNavOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white  text-black  shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt="Merchant Navy Decoded Jobs Logo"
              width={180}
              height={60}
              priority
              className="h-12 w-auto transition-transform group-hover:scale-105"
            />
          </Link>
         

          <div className="hidden items-center gap-4 lg:flex">
            {!ready ? null : user ? (
              <div className="flex items-center gap-3 rounded-xl border border-blue-900 bg-blue-900 px-3 py-1.5">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-blue-50">{user.name}</span>
                  <span className="justify-end text-[10px] font-bold uppercase tracking-wider text-white">
                    {roleLabel(user.role)}
                  </span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className={`rounded-lg p-1.5 text-white transition-colors hover:bg-blue-950 hover:text-white ${isActive(dashboardHref(user.role)) ? "bg-white font-bold text-blue-950 hover:bg-yellow-300" : ""
                      }`}
                    title="Dashboard"
                  >
                    <UserIcon className="h-4.5 w-4.5" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border-blue-800 bg-white py-1 shadow-lg">
                      <div className="border-b border-gray-200 px-4 py-2">
                        <p className="truncate text-sm font-medium text-blue-900">{user.email}</p>
                        <p className="text-xs text-black">{roleLabel(user.role)} account</p>
                      </div>
                      <Link
                        href={dashboardHref(user.role)}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-black hover:bg-blue-900 hover:text-white"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-black hover:bg-blue-900 hover:text-white"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-lg p-1.5 text-white transition-colors hover:bg-red-950 hover:text-red-400"
                  title="Sign out"
                >
                  <LogoutIcon className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold text-black transition-colors hover:text-blue-900">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-blue-900 text-white px-5 py-2 text-sm font-extrabold  shadow-sm transition-all hover:bg-blue-950"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {ready && user && (
              <Link
                href={dashboardHref(user.role)}
                onClick={() => setMobileNavOpen(false)}
                className={`rounded-lg p-2 text-blue-200 ${isActive(dashboardHref(user.role)) ? "bg-yellow-400 text-blue-950" : "bg-blue-900"
                  }`}
              >
                <UserIcon className="h-4.5 w-4.5" />
              </Link>
            )}
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle menu"
              className="rounded-lg  p-2 text-black transition-colors  hover:text-blue-900"
            >
              {mobileNavOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="space-y-3 border-t border-gray-200  bg-white px-4 py-4 lg:hidden">
          

          <div className=" border-blue-900 ">
            {!ready ? null : user ? (
              <div className="space-y-2">
                <div className="rounded-lg bg-blue-900 px-4 py-2">
                  <p className="text-xs text-blue-300">Signed in as</p>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-yellow-400">{roleLabel(user.role)}</p>
                </div>

                <Link
                  href={dashboardHref(user.role)}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  <UserIcon className="h-4 w-4" />
                  My Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg  px-4 py-2.5 text-sm font-semibold text-red-500 "
                >
                  <LogoutIcon className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2">
                <Link
                  href="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="w-full rounded-lg border border-blue-900 py-2.5 text-center text-sm font-bold text-blue-900 hover:border-blue-500"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileNavOpen(false)}
                  className="w-full rounded-lg bg-blue-900 py-2.5 text-center text-sm font-bold text-white shadow-md hover:bg-blue-950"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

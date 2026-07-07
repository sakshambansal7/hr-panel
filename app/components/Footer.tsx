import Link from "next/link";
import { AnchorIcon, WaveDivider } from "./icons";

export default function Footer() {
  return (
    <footer className="relative bg-blue-950 mt-10 text-zinc-300">
      <WaveDivider className="absolute -top-14.75 left-0 h-15 w-full text-blue-950" />

      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <div className="flex items-center gap-2 pb-6">
          <AnchorIcon className="h-6 w-6 text-yellow-400" />
          <span className="text-lg font-bold text-white">MerchantNavyJobs</span>
        </div>

        <div className="grid grid-cols-2 gap-8 pb-12 sm:grid-cols-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Job seekers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs" className="hover:text-yellow-300">Browse jobs</Link></li>
              <li><Link href="/companies" className="hover:text-yellow-300">Research companies</Link></li>
              <li><Link href="/signup" className="hover:text-yellow-300">Create an account</Link></li>
              <li><Link href="/dashboard" className="hover:text-yellow-300">Your dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Employers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup?role=employer" className="hover:text-yellow-300">Post a job</Link></li>
              <li><Link href="/employer/dashboard" className="hover:text-yellow-300">Recruiter panel</Link></li>
              <li><Link href="/login?role=employer" className="hover:text-yellow-300">Employer sign in</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-yellow-300">About us</Link></li>
              <li><Link href="/blog" className="hover:text-yellow-300">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-300">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-yellow-300">Privacy policy</Link></li>
              <li><Link href="/terms" className="hover:text-yellow-300">Terms of service</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-blue-900 px-4 py-6 text-center text-xs text-zinc-500 sm:px-6">
        © {new Date().getFullYear()} MerchantNavyJobs. All rights reserved.
      </div>
    </footer>
  );
}

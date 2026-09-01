import {
  LayoutDashboard,
  CirclePlus,
  Briefcase,
  Users,
  Sparkles,
  FileText,
  BookmarkCheck,
  Calendar,
  ChartColumn,
  Building2,
  Star,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
  { label: "Post New Job", href: "/employer/dashboard/post-job", icon: CirclePlus },
  { label: "Manage Jobs", href: "/employer/dashboard/jobs", icon: Briefcase },
  // { label: "Maritime Talent", href: "/employer/dashboard/talent", icon: Users },
  // { label: "Smart Sourcing", href: "/employer/dashboard/smart-sourcing", icon: Sparkles },
  { label: "Applications", href: "/employer/dashboard/applications", icon: FileText },
  { label: "Shortlisted", href: "/employer/dashboard/shortlisted", icon: BookmarkCheck },
  // { label: "Interviews", href: "/employer/dashboard/interviews", icon: Calendar },
  // { label: "Analytics", href: "/employer/dashboard/analytics", icon: ChartColumn },
  { label: "Company Profile", href: "/employer/dashboard/company", icon: Building2 },
  // { label: "Reviews", href: "/employer/dashboard/reviews", icon: Star },
  // { label: "Billing / Plans", href: "/employer/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/employer/dashboard/settings", icon: Settings },
];

export const IMPLEMENTED_HREFS = new Set<string>(NAV_ITEMS.map((item) => item.href));

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
  { label: "Post Job", href: "/employer/dashboard/post-job", icon: CirclePlus },
  { label: "Jobs", href: "/employer/dashboard/jobs", icon: Briefcase },
  { label: "Applications", href: "/employer/dashboard/applications", icon: FileText },
  { label: "Talent", href: "/employer/dashboard/talent", icon: Users },
];

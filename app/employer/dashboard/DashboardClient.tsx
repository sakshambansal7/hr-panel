"use client";

import DashboardShell from "./components/DashboardShell";
import { useAuth } from "../../context/auth-context";
import HeroSection from "./components/HeroSection";
import StatsGrid from "./components/StatsGrid";
import SubscriptionCard from "./components/SubscriptionCard";
import TalentDatabaseCard from "./components/TalentDatabaseCard";
import QuickActions from "./components/QuickActions";
import RightPanels from "./components/RightPanels";

export default function DashboardClient() {
  const { user } = useAuth();
  const displayName = user?.name || "there";

  return (
    <DashboardShell pageTitle="Dashboard">
      <HeroSection displayName={displayName} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <StatsGrid />
          <SubscriptionCard />
          <TalentDatabaseCard />
          <QuickActions />
        </div>

        <aside className="hidden xl:block">
          <RightPanels />
        </aside>
      </div>
    </DashboardShell>
  );
}

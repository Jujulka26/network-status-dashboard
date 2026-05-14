"use client";

import { useNetworkData } from "@/hooks/use-network-data";
import { NetworkSummary } from "./network-summary";
import { ZoneCardCompact } from "./zone-card-compact";
import { AlertsCompact } from "./alerts-compact";
import { DashboardHeader } from "./dashboard-header";

export function NetworkDashboard() {
  const { zones, alerts } = useNetworkData();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <DashboardHeader />

        {/* Summary Card - Glanceable Overview */}
        <NetworkSummary zones={zones} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zones List - Progressive Disclosure */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-medium text-muted-foreground">
                Network Zones
              </h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Optimal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Critical</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {zones.map((zone) => (
                <ZoneCardCompact key={zone.id} zone={zone} />
              ))}
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-medium text-muted-foreground px-1 mb-3">
              Notifications
            </h2>
            <AlertsCompact alerts={alerts} maxVisible={5} />
          </div>
        </div>
      </div>
    </div>
  );
}

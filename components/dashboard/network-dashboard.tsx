"use client"

import { useNetworkData } from "@/lib/network-data"
import { DashboardHeader } from "./dashboard-header"
import { OverviewStats } from "./overview-stats"
import { FloorView } from "./floor-view"
import { BandwidthChart } from "./bandwidth-chart"
import { AlertsPanel } from "./alerts-panel"
import { NetworkTopology } from "./network-topology"
import { NavSidebar } from "./nav-sidebar"

export function NetworkDashboard() {
  const { floors, alerts, bandwidthHistory, lastUpdated } = useNetworkData()
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader lastUpdated={lastUpdated} />

      <div className="flex">
      <NavSidebar />
      <main className="flex-1 min-w-0 px-6 py-6 space-y-6">
        {/* Overview Statistics */}
        <section id="section-overview" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="sr-only">Network Overview</h2>
          <OverviewStats floors={floors} />
        </section>

        {/* Charts and Alerts Row */}
        <section id="section-bandwidth" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BandwidthChart data={bandwidthHistory} />
          </div>
          <div className="lg:col-span-1">
            <AlertsPanel alerts={alerts} />
          </div>
        </section>

        {/* Network Topology */}
        <section id="section-topology" aria-labelledby="topology-heading">
          <h2 id="topology-heading" className="sr-only">Network Topology</h2>
          <NetworkTopology floors={floors} />
        </section>

        {/* Floor-by-Floor View */}
        <section id="section-floors" aria-labelledby="floors-heading">
          <FloorView floors={floors} />
        </section>
      </main>
      </div>
      
    </div>
  )
}

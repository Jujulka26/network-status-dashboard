"use client"

import { useNetworkData } from "@/lib/network-data"
import { DashboardHeader } from "./dashboard-header"
import { OverviewStats } from "./overview-stats"
import { FloorView } from "./floor-view"
import { BandwidthChart } from "./bandwidth-chart"
import { AlertsPanel } from "./alerts-panel"
import { NetworkTopology } from "./network-topology"

export function NetworkDashboard() {
  const { floors, alerts, bandwidthHistory, lastUpdated } = useNetworkData()
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader lastUpdated={lastUpdated} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Overview Statistics */}
        <section aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="sr-only">Network Overview</h2>
          <OverviewStats floors={floors} />
        </section>
        
        {/* Charts and Alerts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BandwidthChart data={bandwidthHistory} />
          </div>
          <div className="lg:col-span-1">
            <AlertsPanel alerts={alerts} />
          </div>
        </section>
        
        {/* Network Topology */}
        <section aria-labelledby="topology-heading">
          <h2 id="topology-heading" className="sr-only">Network Topology</h2>
          <NetworkTopology floors={floors} />
        </section>

        {/* Floor-by-Floor View */}
        <section aria-labelledby="floors-heading">
          <FloorView floors={floors} />
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>NetWatch Network Monitoring Dashboard</p>
            <p>Data refreshes automatically every 5 seconds</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useNetworkData } from "@/lib/network-data"
import { DashboardHeader } from "./dashboard-header"
import { OverviewStats } from "./overview-stats"
import { FloorView } from "./floor-view"
import { BandwidthChart } from "./bandwidth-chart"
import { AlertsPanel } from "./alerts-panel"
import { NetworkTopology } from "./network-topology"
import { NavSidebar } from "./nav-sidebar"
import { EventsTimeline } from "./events-timeline"
import { useDashboardPreferences } from "./dashboard-preferences"

export function NetworkDashboard() {
  const { refreshInterval, compactView, t } = useDashboardPreferences()
  const { floors, alerts, bandwidthHistory, maintenanceEvents, lastUpdated, refreshNow } = useNetworkData(refreshInterval * 1000)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const allDevices = useMemo(() => floors.flatMap((floor) => floor.devices), [floors])

  function selectDevice(deviceId: string) {
    setSelectedDeviceId(deviceId)
    const device = allDevices.find((item) => item.id === deviceId)
    if (!device) return

    window.dispatchEvent(new CustomEvent("expand-floors", { detail: { floor: device.floor } }))
    window.setTimeout(() => {
      const el = document.getElementById(`floor-${device.floor}`) ?? document.getElementById("section-floors")
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: "smooth" })
    }, 100)
  }

  useEffect(() => {
    const sectionId = window.location.hash.replace("#", "")
    if (!sectionId) return
    window.setTimeout(() => {
      const floor = sectionId.startsWith("floor-") ? Number(sectionId.replace("floor-", "")) : null
      if (floor !== null && Number.isFinite(floor)) {
        window.dispatchEvent(new CustomEvent("expand-floors", { detail: { floor } }))
      }

      const el = document.getElementById(sectionId)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: "smooth" })
      if (sectionId === "section-topology") window.dispatchEvent(new CustomEvent("expand-topology"))
      if (sectionId === "section-floors") window.dispatchEvent(new CustomEvent("expand-floors"))
    }, 100)
  }, [])
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader lastUpdated={lastUpdated} floors={floors} onRefresh={refreshNow} />

      <div className="flex">
      <NavSidebar floors={floors} />
      <main className={`flex-1 min-w-0 px-4 py-5 md:px-6 md:py-6 ${compactView ? "space-y-4" : "space-y-6"}`}>
        {/* Overview Statistics */}
        <section id="section-overview" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="sr-only">{t("overview")}</h2>
          <OverviewStats floors={floors} />
        </section>

        {/* Charts and Alerts Row */}
        <section id="section-bandwidth" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BandwidthChart data={bandwidthHistory} />
          </div>
          <div className="lg:col-span-1">
            <AlertsPanel alerts={alerts} onSelectDevice={selectDevice} />
          </div>
        </section>

        {/* Network Topology */}
        <section id="section-topology" aria-labelledby="topology-heading">
          <h2 id="topology-heading" className="sr-only">{t("networkTopology")}</h2>
          <NetworkTopology floors={floors} selectedDeviceId={selectedDeviceId} onSelectDevice={selectDevice} />
        </section>

        {/* Floor-by-Floor View */}
        <section id="section-floors" aria-labelledby="floors-heading">
          <FloorView floors={floors} selectedDeviceId={selectedDeviceId} onSelectDevice={selectDevice} />
        </section>

        <section id="section-events" aria-labelledby="events-heading">
          <h2 id="events-heading" className="sr-only">{t("events")}</h2>
          <EventsTimeline events={maintenanceEvents} devices={allDevices} onSelectDevice={selectDevice} />
        </section>
      </main>
      </div>
    </div>
  )
}

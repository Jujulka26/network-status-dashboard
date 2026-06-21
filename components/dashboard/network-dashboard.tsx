"use client"

import { useEffect, useMemo, useState } from "react"
import { Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  const [showHoverHint, setShowHoverHint] = useState(false)

  const allDevices = useMemo(() => floors.flatMap((floor) => floor.devices), [floors])

  useEffect(() => {
    setShowHoverHint(window.localStorage.getItem("netwatch-hover-hint-dismissed") !== "true")
  }, [])

  function dismissHoverHint() {
    setShowHoverHint(false)
    window.localStorage.setItem("netwatch-hover-hint-dismissed", "true")
  }

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

        {showHoverHint && (
          <section className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3" aria-label={t("hoverHintTitle")}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-primary/10 p-1.5">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t("hoverHintTitle")}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t("hoverHintBody")}</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={dismissHoverHint} aria-label={t("dismiss")}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </section>
        )}

        {/* Charts and Alerts Row */}
        <section id="section-bandwidth" className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2.4fr)_minmax(320px,0.85fr)]">
          <div className="min-w-0">
            <BandwidthChart data={bandwidthHistory} />
          </div>
          <div className="min-w-0">
            <AlertsPanel alerts={alerts} onSelectDevice={selectDevice} />
          </div>
        </section>

        {/* Network Topology */}
        <section id="section-topology" aria-labelledby="topology-heading">
          <h2 id="topology-heading" className="sr-only">{t("networkTopology")}</h2>
          <NetworkTopology floors={floors} selectedDeviceId={selectedDeviceId} onSelectDevice={selectDevice} />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div id="section-floors" aria-labelledby="floors-heading" className="min-w-0">
            <FloorView floors={floors} selectedDeviceId={selectedDeviceId} onSelectDevice={selectDevice} />
          </div>
          <div id="section-events" aria-labelledby="events-heading" className="min-w-0">
            <h2 id="events-heading" className="sr-only">{t("events")}</h2>
            <EventsTimeline events={maintenanceEvents} devices={allDevices} onSelectDevice={selectDevice} />
          </div>
        </section>
      </main>
      </div>
    </div>
  )
}

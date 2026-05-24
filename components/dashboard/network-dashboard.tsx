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
import { DeviceDetailsSheet } from "./device-details-sheet"
import { EventsTimeline } from "./events-timeline"
import { useDashboardPreferences } from "./dashboard-preferences"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Device } from "@/lib/network-data"

export function NetworkDashboard() {
  const { refreshInterval, compactView, t } = useDashboardPreferences()
  const { floors, alerts, bandwidthHistory, maintenanceEvents, lastUpdated, refreshNow } = useNetworkData(refreshInterval * 1000)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<Device["status"] | "all">("all")
  const [typeFilter, setTypeFilter] = useState<Device["type"] | "all">("all")

  const allDevices = useMemo(() => floors.flatMap((floor) => floor.devices), [floors])
  const selectedDevice = allDevices.find((device) => device.id === selectedDeviceId) ?? null
  const connectedDevices = selectedDevice
    ? allDevices.filter((device) => selectedDevice.connectedTo.includes(device.id) || device.connectedTo.includes(selectedDevice.id))
    : []

  const filteredFloors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return floors
      .map((floor) => ({
        ...floor,
        devices: floor.devices.filter((device) => {
          const matchesSearch = !query || [
            device.name,
            device.zone,
            device.room,
            device.rack,
            device.ipAddress,
            device.macAddress,
            device.model,
          ].filter((value): value is string => Boolean(value)).some((value) => value.toLowerCase().includes(query))
          const matchesStatus = statusFilter === "all" || device.status === statusFilter
          const matchesType = typeFilter === "all" || device.type === typeFilter
          return matchesSearch && matchesStatus && matchesType
        }),
      }))
      .filter((floor) => floor.devices.length > 0)
  }, [floors, searchQuery, statusFilter, typeFilter])

  function openDevice(deviceId: string) {
    setSelectedDeviceId(deviceId)
    setDetailsOpen(true)
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

        <section aria-label="Device filters" className="grid gap-3 rounded-lg border border-border bg-card p-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("searchDevices")}
            className="bg-background"
          />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Device["status"] | "all")}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              <SelectItem value="healthy">{t("healthy")}</SelectItem>
              <SelectItem value="warning">{t("warning")}</SelectItem>
              <SelectItem value="critical">{t("critical")}</SelectItem>
              <SelectItem value="offline">{t("offline")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as Device["type"] | "all")}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTypes")}</SelectItem>
              <SelectItem value="access_point">{t("accessPoint")}</SelectItem>
              <SelectItem value="switch">{t("switch")}</SelectItem>
              <SelectItem value="router">{t("router")}</SelectItem>
              <SelectItem value="server">{t("server")}</SelectItem>
            </SelectContent>
          </Select>
        </section>

        {/* Charts and Alerts Row */}
        <section id="section-bandwidth" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BandwidthChart data={bandwidthHistory} />
          </div>
          <div className="lg:col-span-1">
            <AlertsPanel alerts={alerts} onSelectDevice={openDevice} />
          </div>
        </section>

        {/* Network Topology */}
        <section id="section-topology" aria-labelledby="topology-heading">
          <h2 id="topology-heading" className="sr-only">{t("networkTopology")}</h2>
          <NetworkTopology floors={floors} selectedDeviceId={selectedDeviceId} onSelectDevice={openDevice} />
        </section>

        {/* Floor-by-Floor View */}
        <section id="section-floors" aria-labelledby="floors-heading">
          <FloorView floors={filteredFloors} selectedDeviceId={selectedDeviceId} onSelectDevice={openDevice} />
        </section>

        <section id="section-events" aria-labelledby="events-heading">
          <h2 id="events-heading" className="sr-only">{t("events")}</h2>
          <EventsTimeline events={maintenanceEvents} devices={allDevices} onSelectDevice={openDevice} />
        </section>
      </main>
      </div>

      <DeviceDetailsSheet
        device={selectedDevice}
        connectedDevices={connectedDevices}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onSelectDevice={openDevice}
      />
    </div>
  )
}

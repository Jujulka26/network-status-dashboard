"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Building2, Camera, ChevronLeft, ChevronRight, Loader2, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Device, FloorData } from "@/lib/network-data"
import { cn } from "@/lib/utils"
import { useDashboardPreferences } from "./dashboard-preferences"
import { DEVICE_ICON, DEVICE_TYPE_LABEL, DeviceMetricGrid, DeviceStatusBadge, STATUS_BADGE, STATUS_DOT, STATUS_ICON_TEXT, STATUS_RING } from "./device-ui"

interface FloorViewProps {
  floors: FloorData[]
  selectedDeviceId?: string | null
  onSelectDevice?: (deviceId: string) => void
}

const FLOOR_ROOMS: Record<number, Array<{ label: string; x: number; y: number; w: number; h: number }>> = {
  1: [
    { label: "Reception", x: 8, y: 18, w: 32, h: 34 },
    { label: "Lobby", x: 42, y: 18, w: 42, h: 34 },
    { label: "Visitor Lounge", x: 8, y: 58, w: 48, h: 26 },
    { label: "F1 IT Closet", x: 64, y: 58, w: 22, h: 26 },
  ],
  2: [
    { label: "Open Office A", x: 8, y: 16, w: 48, h: 38 },
    { label: "Hot Desk Zone", x: 58, y: 16, w: 30, h: 38 },
    { label: "Meeting Rooms", x: 42, y: 60, w: 46, h: 25 },
    { label: "2F IT Closet", x: 8, y: 60, w: 24, h: 25 },
  ],
  3: [
    { label: "Executive Suite", x: 8, y: 18, w: 38, h: 34 },
    { label: "HR Department", x: 50, y: 18, w: 38, h: 34 },
    { label: "Secure Corridor", x: 8, y: 60, w: 58, h: 22 },
    { label: "3F IT Closet", x: 72, y: 60, w: 16, h: 22 },
  ],
  4: [
    { label: "IT Department", x: 8, y: 16, w: 34, h: 32 },
    { label: "Core Rack S1", x: 48, y: 18, w: 20, h: 30 },
    { label: "Server Rack S2", x: 70, y: 18, w: 18, h: 55 },
    { label: "Server Room", x: 45, y: 52, w: 43, h: 30 },
  ],
}

function getStatusHelp(t: ReturnType<typeof useDashboardPreferences>["t"], status: Device["status"]) {
  if (status === "healthy") return t("statusHealthyHelp")
  if (status === "degraded") return t("statusLatencyHelp")
  return t("statusDownHelp")
}

function DeviceCard({
  device,
  selected,
  onSelect,
}: {
  device: Device
  selected: boolean
  onSelect?: (deviceId: string) => void
}) {
  const { t, compactView } = useDashboardPreferences()
  const Icon = DEVICE_ICON[device.type]

  return (
    <button
      type="button"
      onClick={() => onSelect?.(device.id)}
      className={cn(
        "rounded-lg border border-border bg-secondary/30 text-left transition-colors hover:bg-secondary/50",
        compactView ? "p-3" : "p-4",
        selected && "border-primary bg-primary/5 ring-1 ring-primary/30"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-background shadow-sm", STATUS_RING[device.status])}>
            <Icon className={cn("h-4 w-4", STATUS_ICON_TEXT[device.status])} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{device.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {device.zone} • {device.room}
            </p>
          </div>
        </div>
        <DeviceStatusBadge status={device.status} label={t(device.status)} description={getStatusHelp(t, device.status)} />
      </div>

      <DeviceMetricGrid device={device} />

      {!compactView && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span>{device.ipAddress}</span>
          <span className="text-right">{device.rack ?? device.model}</span>
        </div>
      )}
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === "") return null

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

function DeviceDetailsPanel({
  device,
}: {
  device?: Device
}) {
  const { t } = useDashboardPreferences()

  if (!device) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        {t("noDevicesMatch")}
      </div>
    )
  }

  const Icon = DEVICE_ICON[device.type]

  return (
    <aside className="rounded-lg border border-border bg-card">
      <div className="space-y-4 p-4">
        <section className="space-y-3 rounded-lg border border-border bg-secondary/20 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background shadow-sm", STATUS_RING[device.status])}>
                <Icon className={cn("h-5 w-5", STATUS_ICON_TEXT[device.status])} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold">{device.name}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {DEVICE_TYPE_LABEL[device.type]} • {device.ipAddress}
                </p>
              </div>
            </div>
            <DeviceStatusBadge status={device.status} label={t(device.status)} description={getStatusHelp(t, device.status)} />
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Camera className="h-4 w-4 text-muted-foreground" />
              {t("cameraPreview")}
            </h4>
            <p className="mt-1 truncate text-xs text-muted-foreground">{device.camera.label}</p>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-secondary/30">
            <div className="relative aspect-video">
              <Image
                src={device.camera.image}
                alt={`${device.camera.label} preview`}
                fill
                sizes="(max-width: 1024px) 100vw, 350px"
                className="object-cover opacity-75"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                <p className="text-sm font-medium">{device.camera.label}</p>
                <p className="text-xs opacity-80">{device.camera.angle}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {t("location")}
          </h4>
          <div className="space-y-2 rounded-lg border border-border bg-secondary/20 p-3">
            <InfoRow label="Floor" value={device.floor} />
            <InfoRow label="Zone" value={device.zone} />
            <InfoRow label="Room" value={device.room} />
            <InfoRow label="Rack" value={device.rack ?? "N/A"} />
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-sm font-semibold">{t("metrics")}</h4>
          <DeviceMetricGrid device={device} />
        </section>
      </div>
    </aside>
  )
}

function FloorPlan({
  floor,
  selectedDeviceId,
  onSelectDevice,
}: {
  floor: FloorData
  selectedDeviceId?: string | null
  onSelectDevice?: (deviceId: string) => void
}) {
  const { t } = useDashboardPreferences()
  const selectedDevice = floor.devices.find((device) => device.id === selectedDeviceId) ?? floor.devices[0]

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_350px]">
      <div className="relative min-h-[280px] overflow-hidden rounded-lg border border-border bg-secondary/20">
        <div className="absolute inset-4 rounded-md border-4 border-foreground/20 bg-[linear-gradient(90deg,var(--border)_1px,transparent_1px),linear-gradient(0deg,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />
        <div className="absolute left-[6%] right-[6%] top-[52%] h-[8%] border-y-2 border-foreground/15 bg-background/40" />
        {(FLOOR_ROOMS[floor.floor] ?? []).map((room) => (
          <div
            key={room.label}
            className="absolute rounded-sm border-2 border-foreground/25 bg-card/75 shadow-sm"
            style={{ left: `${room.x}%`, top: `${room.y}%`, width: `${room.w}%`, height: `${room.h}%` }}
          >
            <span className="absolute left-2 top-2 max-w-[90%] truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {room.label}
            </span>
            <span className="absolute bottom-[-3px] left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-background" />
          </div>
        ))}
        {floor.devices.map((device) => {
          const Icon = DEVICE_ICON[device.type]
          const selected = device.id === selectedDeviceId

          return (
            <Tooltip key={device.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onSelectDevice?.(device.id)}
                  className={cn(
                    "absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-background shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    STATUS_RING[device.status],
                    selected && "scale-110 ring-2 ring-primary/30"
                  )}
                  style={{ left: `${device.location.x}%`, top: `${device.location.y}%` }}
                  aria-label={`${device.name}: ${t(device.status)}`}
                >
                  <Icon className={cn("h-4 w-4", STATUS_ICON_TEXT[device.status])} />
                  <span className={cn("absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full", STATUS_DOT[device.status])} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-64">
                <div className="space-y-1">
                  <p className="font-medium">{device.name} • {t(device.status)}</p>
                  <p className="text-background/80">{t("floorDeviceMarkerHelp")}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      <DeviceDetailsPanel device={selectedDevice} />
    </div>
  )
}

function FloorStatusPills({ floor }: { floor: FloorData }) {
  const { t } = useDashboardPreferences()
  const latencyCount = floor.devices.filter(d => d.status === "degraded").length
  const downCount = floor.devices.filter(d => d.status === "down").length

  return (
    <div className="flex flex-wrap items-center gap-2">
      {latencyCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-help">
              <Badge variant="outline" className={STATUS_BADGE.degraded}>
                {latencyCount} {t("degraded")}
              </Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-64">{t("statusLatencyHelp")}</TooltipContent>
        </Tooltip>
      )}
      {downCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-help">
              <Badge variant="outline" className={STATUS_BADGE.down}>
                {downCount} {t("down")}
              </Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-64">{t("statusDownHelp")}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

function BuildingFloorSelector({
  floors,
  selectedFloor,
  onSelectFloor,
}: {
  floors: FloorData[]
  selectedFloor: number
  onSelectFloor: (floor: number) => void
}) {
  const { t } = useDashboardPreferences()
  const orderedFloors = [...floors].sort((a, b) => b.floor - a.floor)

  return (
    <div className="flex min-h-[570px] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Building Floors</h3>
        </div>
        <span className="text-xs text-muted-foreground">Click a floor</span>
      </div>
      <div className="relative flex min-h-[520px] flex-1 items-center bg-[radial-gradient(circle_at_top,var(--secondary),transparent_42%),linear-gradient(180deg,var(--background),var(--secondary))] px-5 py-8">
        <div className="mx-auto flex w-full max-w-[820px] flex-col-reverse gap-0">
          {orderedFloors.reverse().map((floor) => {
          const latencyCount = floor.devices.filter(d => d.status === "degraded").length
          const downCount = floor.devices.filter(d => d.status === "down").length
          const status = downCount > 0 ? "down" : latencyCount > 0 ? "degraded" : "healthy"
          const selected = selectedFloor === floor.floor
          const offset = (floor.floor - 1) * 22

          return (
            <Tooltip key={floor.floor}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onSelectFloor(floor.floor)}
                  className={cn(
                    "group relative min-h-[92px] w-full -skew-x-6 rounded-lg border bg-background text-left shadow-md transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected ? "border-primary ring-2 ring-primary/20" : "border-border",
                    status === "healthy" && "hover:border-status-healthy/50",
                    status === "degraded" && "hover:border-status-degraded/70",
                    status === "down" && "hover:border-status-down/70"
                  )}
                  style={{ marginLeft: `${offset}px`, width: `calc(100% - ${offset}px)` }}
                  aria-label={`${floor.name}: ${t("openFloorHelp")}`}
                >
                  <div className={cn("absolute inset-y-4 left-4 w-1.5 rounded-full", STATUS_DOT[status])} />
                  <div className="absolute -bottom-3 left-6 right-3 h-3 rounded-b-lg border-x border-b border-border/70 bg-secondary/60" />
                  <div className="flex h-full skew-x-6 items-center gap-4 px-8 py-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-muted-foreground">
                      F{floor.floor}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{floor.shortName}</p>
                        <p className="truncate text-xs text-muted-foreground">{floor.mapLabel}</p>
                      </div>
                      <div className="mt-2">
                        <FloorStatusPills floor={floor} />
                      </div>
                    </div>
                    <div className="hidden rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground sm:block">
                      Open
                    </div>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-72">
                <div className="space-y-1">
                  <p className="font-medium">{floor.name}</p>
                  <p className="text-background/80">{t("openFloorHelp")}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
        </div>
      </div>
    </div>
  )
}

function SelectedFloorPanel({
  floor,
  selectedDeviceId,
  onSelectDevice,
}: {
  floor: FloorData
  selectedDeviceId?: string | null
  onSelectDevice?: (deviceId: string) => void
}) {
  const { t, compactView } = useDashboardPreferences()

  return (
    <Card id={`floor-${floor.floor}`} className="bg-card border-border scroll-mt-24">
      <CardHeader className={cn("pb-2", compactView && "py-3")}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{floor.name}</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {floor.devices.length} {t("devicesMonitored")} • {floor.totalClients} clients • {floor.bandwidth.up + floor.bandwidth.down} Mbps total
              </p>
            </div>
          </div>
          <FloorStatusPills floor={floor} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <FloorPlan floor={floor} selectedDeviceId={selectedDeviceId} onSelectDevice={onSelectDevice} />
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {floor.devices.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              selected={device.id === selectedDeviceId}
              onSelect={onSelectDevice}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function FloorView({ floors, selectedDeviceId, onSelectDevice }: FloorViewProps) {
  const { t } = useDashboardPreferences()
  const [selectedFloor, setSelectedFloor] = useState(() => floors[0]?.floor ?? 1)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailReady, setDetailReady] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      floors.forEach((floor) => {
        const image = floor.devices[0]?.camera.image
        if (!image) return
        const preload = new window.Image()
        preload.src = image
      })
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [floors])

  useEffect(() => {
    if (!detailOpen) {
      setDetailReady(false)
      return
    }

    setDetailReady(false)
    const timeout = window.setTimeout(() => setDetailReady(true), 90)
    return () => window.clearTimeout(timeout)
  }, [detailOpen, selectedFloor])

  useEffect(() => {
    const handler = (event: Event) => {
      const floor = (event as CustomEvent<{ floor?: number }>).detail?.floor

      if (typeof floor === "number") {
        setSelectedFloor(floor)
        setDetailOpen(true)
      }
    }
    window.addEventListener("expand-floors", handler)
    return () => window.removeEventListener("expand-floors", handler)
  }, [])

  useEffect(() => {
    const device = floors.flatMap((floor) => floor.devices).find((item) => item.id === selectedDeviceId)
    if (device) {
      setSelectedFloor(device.floor)
      setDetailOpen(true)
    }
  }, [floors, selectedDeviceId])

  const visibleDeviceCount = useMemo(
    () => floors.reduce((total, floor) => total + floor.devices.length, 0),
    [floors]
  )
  const floorOrder = useMemo(() => [...floors].sort((a, b) => a.floor - b.floor), [floors])
  const activeFloor = floors.find((floor) => floor.floor === selectedFloor) ?? floors[0]
  const activeFloorIndex = floorOrder.findIndex((floor) => floor.floor === activeFloor?.floor)
  const previousFloor = activeFloorIndex > 0 ? floorOrder[activeFloorIndex - 1] : null
  const nextFloor = activeFloorIndex >= 0 && activeFloorIndex < floorOrder.length - 1 ? floorOrder[activeFloorIndex + 1] : null
  const openFloor = (floor: number) => {
    setSelectedFloor(floor)
    setDetailOpen(true)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{t("floorplanCamera")}</h2>
        <p className="text-sm text-muted-foreground">
          {floors.length} {t("floorsMonitored")} • {visibleDeviceCount} {t("devicesMonitored")}
        </p>
      </div>
      {activeFloor && (
        <>
          <BuildingFloorSelector floors={floors} selectedFloor={activeFloor.floor} onSelectFloor={openFloor} />
          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-h-[92vh] overflow-y-auto p-0 duration-150 sm:max-w-[min(1180px,calc(100vw-2rem))]">
              <DialogHeader className="border-b border-border bg-secondary/30 px-6 py-4">
                <div className="flex flex-col gap-3 pr-8 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="bg-background">
                        {t("currentFloor")}: F{activeFloor.floor}
                      </Badge>
                      <FloorStatusPills floor={activeFloor} />
                    </div>
                    <DialogTitle>{activeFloor.name}</DialogTitle>
                    <DialogDescription>
                      {activeFloor.devices.length} {t("devicesMonitored")} • {activeFloor.totalClients} clients • {activeFloor.bandwidth.up + activeFloor.bandwidth.down} Mbps total
                    </DialogDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!previousFloor}
                      onClick={() => previousFloor && setSelectedFloor(previousFloor.floor)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t("previousFloor")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!nextFloor}
                      onClick={() => nextFloor && setSelectedFloor(nextFloor.floor)}
                    >
                      {t("nextFloor")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setDetailOpen(false)}>
                      {t("backToBuilding")}
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="p-4 md:p-6">
                {detailReady ? (
                  <SelectedFloorPanel
                    floor={activeFloor}
                    selectedDeviceId={selectedDeviceId}
                    onSelectDevice={onSelectDevice}
                  />
                ) : (
                  <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-border bg-secondary/20 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("loadingFloorDetails")}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
      {visibleDeviceCount === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t("noDevicesMatch")}
        </div>
      )}
    </div>
  )
}

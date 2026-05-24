"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Camera, ChevronDown, ChevronUp, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Device, FloorData } from "@/lib/network-data"
import { cn } from "@/lib/utils"
import { useDashboardPreferences } from "./dashboard-preferences"
import { DEVICE_ICON, DEVICE_TYPE_LABEL, DeviceMetricGrid, DeviceStatusBadge, STATUS_DOT, STATUS_ICON_TEXT } from "./device-ui"

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
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className={cn("h-4 w-4", STATUS_ICON_TEXT[device.status])} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{device.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {device.zone} • {device.room}
            </p>
          </div>
        </div>
        <DeviceStatusBadge status={device.status} label={t(device.status)} />
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
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className={cn("h-5 w-5", STATUS_ICON_TEXT[device.status])} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold">{device.name}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {DEVICE_TYPE_LABEL[device.type]} • {device.ipAddress}
                </p>
              </div>
            </div>
            <DeviceStatusBadge status={device.status} label={t(device.status)} />
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
            <button
              key={device.id}
              type="button"
              onClick={() => onSelectDevice?.(device.id)}
              className={cn(
                "absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-background shadow-sm transition-transform hover:scale-110",
                selected && "scale-110 border-primary ring-2 ring-primary/30",
                !selected && "border-border"
              )}
              style={{ left: `${device.location.x}%`, top: `${device.location.y}%` }}
              title={device.name}
            >
              <Icon className={cn("h-4 w-4", STATUS_ICON_TEXT[device.status])} />
              <span className={cn("absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full", STATUS_DOT[device.status])} />
            </button>
          )
        })}
      </div>

      <DeviceDetailsPanel device={selectedDevice} />
    </div>
  )
}

function FloorCard({
  floor,
  expandTrigger,
  targetFloor,
  selectedDeviceId,
  onSelectDevice,
}: {
  floor: FloorData
  expandTrigger: number
  targetFloor: { floor: number; version: number } | null
  selectedDeviceId?: string | null
  onSelectDevice?: (deviceId: string) => void
}) {
  const { t, compactView } = useDashboardPreferences()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (expandTrigger > 0) setExpanded(true)
  }, [expandTrigger])

  useEffect(() => {
    if (targetFloor) setExpanded(targetFloor.floor === floor.floor)
  }, [floor.floor, targetFloor])

  const healthyCount = floor.devices.filter(d => d.status === "healthy").length
  const degradedCount = floor.devices.filter(d => d.status === "degraded").length
  const downCount = floor.devices.filter(d => d.status === "down").length
  const overallStatus = downCount > 0 ? "down" : degradedCount > 0 ? "degraded" : "healthy"

  return (
    <Card id={`floor-${floor.floor}`} className="bg-card border-border scroll-mt-24">
      <CardHeader className={cn("pb-2", compactView && "py-3")}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={cn("h-3 w-3 rounded-full", STATUS_DOT[overallStatus])} />
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{floor.name}</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {floor.devices.length} {t("devicesMonitored")} • {floor.totalClients} clients • {floor.bandwidth.up + floor.bandwidth.down} Mbps total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-xs sm:flex">
              {healthyCount > 0 && <span className="text-status-healthy">{healthyCount} {t("healthy").toLowerCase()}</span>}
              {degradedCount > 0 && <span className="text-status-degraded">{degradedCount} {t("degraded").toLowerCase()}</span>}
              {downCount > 0 && <span className="text-status-down">{downCount} {t("down").toLowerCase()}</span>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label={expanded ? `Collapse ${floor.shortName}` : `Expand ${floor.shortName}`}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <FloorPlan floor={floor} selectedDeviceId={selectedDeviceId} onSelectDevice={onSelectDevice} />
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
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
      )}
    </Card>
  )
}

export function FloorView({ floors, selectedDeviceId, onSelectDevice }: FloorViewProps) {
  const { t } = useDashboardPreferences()
  const [expandTrigger, setExpandTrigger] = useState(0)
  const [targetFloor, setTargetFloor] = useState<{ floor: number; version: number } | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      const floor = (event as CustomEvent<{ floor?: number }>).detail?.floor

      if (typeof floor === "number") {
        setTargetFloor((current) => ({ floor, version: (current?.version ?? 0) + 1 }))
        return
      }

      setExpandTrigger(t => t + 1)
    }
    window.addEventListener("expand-floors", handler)
    return () => window.removeEventListener("expand-floors", handler)
  }, [])

  const visibleDeviceCount = useMemo(
    () => floors.reduce((total, floor) => total + floor.devices.length, 0),
    [floors]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{t("floorplanCamera")}</h2>
        <p className="text-sm text-muted-foreground">
          {floors.length} {t("floorsMonitored")} • {visibleDeviceCount} {t("devicesMonitored")}
        </p>
      </div>
      <div className="space-y-4">
        {floors.map(floor => (
          <FloorCard
            key={floor.floor}
            floor={floor}
            expandTrigger={expandTrigger}
            targetFloor={targetFloor}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={onSelectDevice}
          />
        ))}
      </div>
      {visibleDeviceCount === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t("noDevicesMatch")}
        </div>
      )}
    </div>
  )
}

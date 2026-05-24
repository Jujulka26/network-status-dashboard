"use client"

import Image from "next/image"
import { Camera, CircleDot, MapPin, Network, ServerCog } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import type { Device } from "@/lib/network-data"
import { DEVICE_ICON, DEVICE_TYPE_LABEL, DeviceMetricGrid, DeviceStatusBadge, STATUS_DOT, STATUS_ICON_TEXT, STATUS_RING } from "./device-ui"
import { useDashboardPreferences } from "./dashboard-preferences"
import { cn } from "@/lib/utils"

interface DeviceDetailsSheetProps {
  device: Device | null
  connectedDevices: Device[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectDevice?: (deviceId: string) => void
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === "") return null

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

export function DeviceDetailsSheet({
  device,
  connectedDevices,
  open,
  onOpenChange,
  onSelectDevice,
}: DeviceDetailsSheetProps) {
  const { t } = useDashboardPreferences()

  if (!device) {
    return <Sheet open={open} onOpenChange={onOpenChange} />
  }

  const Icon = DEVICE_ICON[device.type]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <div className="flex items-start gap-3 pr-8">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background shadow-sm", STATUS_RING[device.status])}>
              <Icon className={cn("h-5 w-5", STATUS_ICON_TEXT[device.status])} />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">{device.name}</SheetTitle>
              <SheetDescription>
                {DEVICE_TYPE_LABEL[device.type]} • {device.ipAddress}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 p-5">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{t("deviceDetails")}</h3>
              <DeviceStatusBadge status={device.status} label={t(device.status)} />
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-card p-3">
              <InfoRow label="Model" value={device.model} />
              <InfoRow label="Firmware" value={device.firmware} />
              <InfoRow label="MAC" value={device.macAddress} />
              <InfoRow label="Uptime" value={device.uptime} />
              <InfoRow label="Last seen" value={device.lastSeen} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {t("location")}
            </h3>
            <div className="space-y-2 rounded-lg border border-border bg-card p-3">
              <InfoRow label="Floor" value={device.floor} />
              <InfoRow label="Zone" value={device.zone} />
              <InfoRow label="Room" value={device.room} />
              <InfoRow label="Rack" value={device.rack ?? "N/A"} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Camera className="h-4 w-4 text-muted-foreground" />
              {t("cameraPreview")}
            </h3>
            <div className="overflow-hidden rounded-lg border border-border bg-secondary/30">
              <div className="relative aspect-video">
                <Image
                  src={device.camera.image}
                  alt={`${device.camera.label} preview`}
                  fill
                  sizes="(max-width: 640px) 100vw, 384px"
                  className="object-cover opacity-70"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                  <p className="text-sm font-medium">{device.camera.label}</p>
                  <p className="text-xs opacity-80">{device.camera.angle}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <ServerCog className="h-4 w-4 text-muted-foreground" />
              {t("metrics")}
            </h3>
            <DeviceMetricGrid device={device} />
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Network className="h-4 w-4 text-muted-foreground" />
              {t("connectedDevices")}
            </h3>
            <div className="space-y-2">
              {connectedDevices.map((connectedDevice) => (
                <button
                  key={connectedDevice.id}
                  type="button"
                  onClick={() => onSelectDevice?.(connectedDevice.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-secondary/50"
                >
                  <div>
                    <p className="text-sm font-medium">{connectedDevice.name}</p>
                    <p className="text-xs text-muted-foreground">{connectedDevice.ipAddress}</p>
                  </div>
                  <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[connectedDevice.status])} />
                </button>
              ))}
              {connectedDevices.length === 0 && (
                <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                  No direct connection mapped.
                </p>
              )}
            </div>
          </section>

          <Separator />

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <CircleDot className="h-4 w-4 text-muted-foreground" />
              {t("maintenanceNotes")}
            </h3>
            <p className="rounded-lg bg-secondary/30 p-3 text-sm text-muted-foreground">
              {device.maintenanceNotes}
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

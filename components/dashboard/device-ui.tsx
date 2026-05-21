"use client"

import type { ElementType } from "react"
import { Cpu, HardDrive, MemoryStick, Router, Server, Thermometer, Users, Wifi, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Device } from "@/lib/network-data"
import { cn } from "@/lib/utils"

export const DEVICE_ICON: Record<Device["type"], ElementType> = {
  access_point: Wifi,
  switch: HardDrive,
  router: Router,
  server: Server,
}

export const DEVICE_TYPE_LABEL: Record<Device["type"], string> = {
  access_point: "Access Point",
  switch: "Switch",
  router: "Router",
  server: "Server",
}

export const STATUS_RING: Record<Device["status"], string> = {
  healthy: "border-emerald-400 shadow-emerald-400/30",
  warning: "border-amber-400 shadow-amber-400/30",
  critical: "border-red-400 shadow-red-400/30",
  offline: "border-slate-500 shadow-slate-500/20",
}

export const STATUS_DOT: Record<Device["status"], string> = {
  healthy: "bg-status-healthy",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
  offline: "bg-status-offline",
}

export function DeviceStatusBadge({ status, label }: { status: Device["status"]; label: string }) {
  const styles: Record<Device["status"], string> = {
    healthy: "border-status-healthy text-status-healthy bg-status-healthy/10",
    warning: "border-status-warning text-status-warning bg-status-warning/10",
    critical: "border-status-critical text-status-critical bg-status-critical/10",
    offline: "border-status-offline text-status-offline bg-status-offline/10",
  }

  return (
    <Badge variant="outline" className={cn("capitalize", styles[status])}>
      {label}
    </Badge>
  )
}

export function DeviceMetricGrid({ device }: { device: Device }) {
  const metrics = [
    device.clients !== undefined ? { label: "Clients", value: device.clients, icon: Users } : null,
    device.bandwidth ? { label: "Bandwidth", value: `↑${device.bandwidth.up} ↓${device.bandwidth.down} Mbps`, icon: Activity } : null,
    device.cpu !== undefined ? { label: "CPU", value: `${device.cpu}%`, icon: Cpu } : null,
    device.memory !== undefined ? { label: "Memory", value: `${device.memory}%`, icon: MemoryStick } : null,
    device.temperature !== undefined ? { label: "Temp", value: `${device.temperature}°C`, icon: Thermometer } : null,
  ].filter(Boolean) as { label: string; value: string | number; icon: ElementType }[]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {metrics.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-md border border-border bg-secondary/30 p-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </div>
          <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
      ))}
    </div>
  )
}

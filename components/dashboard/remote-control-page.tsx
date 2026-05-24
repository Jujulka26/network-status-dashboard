"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Activity, CircleDot, Command, HardDrive, Keyboard, Monitor, MousePointer2, Power, Wifi } from "lucide-react"
import { DashboardHeader } from "./dashboard-header"
import { NavSidebar } from "./nav-sidebar"
import { useNetworkData } from "@/lib/network-data"
import { useDashboardPreferences } from "./dashboard-preferences"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DEVICE_ICON, DEVICE_TYPE_LABEL, DeviceStatusBadge, STATUS_BADGE, STATUS_DOT, STATUS_TEXT } from "./device-ui"
import { cn } from "@/lib/utils"
import type { Device } from "@/lib/network-data"

const QUICK_COMMANDS = ["status", "ping gateway", "show interfaces", "restart service"]

function buildCommandOutput(command: string, device: Device, statusLabel: string) {
  const normalized = command.trim().toLowerCase()
  if (!normalized) return ""
  if (normalized.includes("ping")) return `PING ${device.ipAddress}: 4 packets transmitted, 4 received, 0% packet loss, avg 8.4 ms`
  if (normalized.includes("interface")) return "eth0 up 1Gbps full-duplex\nwlan0 up channel 44 clients stable\nmgmt0 up secure tunnel active"
  if (normalized.includes("restart")) return "Service restart queued. Health probe returned OK after 3.2s."
  if (normalized.includes("status")) return `${device.name} network status: ${statusLabel}. Last probe: ${device.lastSeen}.`
  return `Command executed on ${device.name}. Demo remote session returned exit code 0.`
}

export function RemoteControlPage() {
  const { refreshInterval, t } = useDashboardPreferences()
  const { floors, lastUpdated, refreshNow } = useNetworkData(refreshInterval * 1000)
  const devices = useMemo(() => floors.flatMap((floor) => floor.devices), [floors])
  const [selectedDeviceId, setSelectedDeviceId] = useState("")
  const selectedDevice = devices.find((device) => device.id === selectedDeviceId) ?? devices[0]
  const [command, setCommand] = useState("")
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "NetWatch Remote Shell v1.0",
    "Secure demo tunnel established.",
    "Select a device and run a command.",
  ])

  useEffect(() => {
    setSelectedDeviceId((currentDeviceId) => {
      if (currentDeviceId && devices.some((device) => device.id === currentDeviceId)) {
        return currentDeviceId
      }

      const requestedDeviceId = new URLSearchParams(window.location.search).get("device")
      if (requestedDeviceId && devices.some((device) => device.id === requestedDeviceId)) {
        return requestedDeviceId
      }

      return devices[0]?.id ?? currentDeviceId
    })
  }, [devices])

  function runCommand(nextCommand = command) {
    if (!selectedDevice || !nextCommand.trim()) return
    const output = buildCommandOutput(nextCommand, selectedDevice, t(selectedDevice.status))
    setTerminalLines((lines) => [
      ...lines,
      `$ ${nextCommand}`,
      output,
    ])
    setCommand("")
  }

  if (!selectedDevice) {
    return null
  }

  const Icon = DEVICE_ICON[selectedDevice.type]
  const statusTextClass = STATUS_TEXT[selectedDevice.status]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader lastUpdated={lastUpdated} floors={floors} onRefresh={refreshNow} />
      <div className="flex">
        <NavSidebar floors={floors} />
        <main className="flex-1 min-w-0 px-4 py-4 md:px-6">
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t("remoteControl")}</h2>
              <p className="text-sm text-muted-foreground">
                AnyDesk-style remote session with a device home screen and terminal side by side.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                <SelectTrigger className="w-full bg-background sm:w-[320px]">
                  <SelectValue placeholder={selectedDevice.name} />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name} • {device.ipAddress}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className={cn("justify-center px-3 py-2", STATUS_BADGE[selectedDevice.status])}>
                <CircleDot className={cn("h-3.5 w-3.5", statusTextClass)} />
                {t(selectedDevice.status)}
              </Badge>
            </div>
          </div>

          <section className="grid gap-4 xl:h-[calc(100vh-205px)] xl:min-h-[520px] xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
            <div className="grid gap-4 xl:min-h-0 xl:grid-rows-[minmax(300px,0.95fr)_minmax(0,1fr)]">
              <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
                <div className="shrink-0 flex items-center justify-between border-b border-border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{t("remoteHome")}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MousePointer2 className="h-3.5 w-3.5" />
                    <Keyboard className="h-3.5 w-3.5" />
                    <Wifi className={cn("h-3.5 w-3.5", statusTextClass)} />
                  </div>
                </div>

                <div className="p-2">
                  <div className="overflow-hidden rounded-lg border border-border bg-[radial-gradient(circle_at_top_left,var(--primary),transparent_28%),linear-gradient(135deg,var(--secondary),var(--background))]">
                    <div className="flex items-center justify-between bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
                      <span>{selectedDevice.name}</span>
                      <span suppressHydrationWarning>{lastUpdated.toLocaleTimeString()}</span>
                    </div>

                    <div className="grid gap-2 p-2">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                          { label: "Status", icon: Activity },
                          { label: "Storage", icon: HardDrive },
                          { label: "Network", icon: Wifi },
                          { label: "Power", icon: Power },
                        ].map(({ label, icon: ItemIcon }) => (
                          <div key={label} className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-md bg-background/75 p-1.5 text-xs shadow-sm backdrop-blur">
                            <ItemIcon className="h-4 w-4 text-primary" />
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border border-white/20 bg-background/90 shadow-sm backdrop-blur">
                        <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
                          <Icon className="h-4 w-4 text-primary" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{selectedDevice.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{DEVICE_TYPE_LABEL[selectedDevice.type]} • {selectedDevice.ipAddress}</p>
                          </div>
                        </div>
                        <div className="grid gap-2 p-2 sm:grid-cols-4">
                          <InfoTile label="Floor" value={`Floor ${selectedDevice.floor}`} />
                          <InfoTile label="Room" value={selectedDevice.room} />
                          <InfoTile label="CPU" value={selectedDevice.cpu !== undefined ? `${selectedDevice.cpu}%` : "N/A"} />
                          <InfoTile label="Memory" value={selectedDevice.memory !== undefined ? `${selectedDevice.memory}%` : "N/A"} />
                        </div>
                        <div className="flex items-center gap-3 px-3 pb-2">
                          <DeviceStatusBadge status={selectedDevice.status} label={t(selectedDevice.status)} />
                          <span className="text-xs text-muted-foreground">12 ms • encrypted tunnel</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-black/45 px-3 py-1.5 text-white backdrop-blur">
                      <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[selectedDevice.status])} />
                      <span className="text-xs">Remote session active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
                <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Command className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{t("terminal")}</h3>
                  </div>
                  <Badge variant="outline">{selectedDevice.ipAddress}</Badge>
                </div>
                <div className="flex h-[420px] min-h-0 flex-col bg-[#060a0f] p-3 font-mono text-sm text-emerald-100 xl:h-auto xl:flex-1">
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-md border border-emerald-500/20 bg-black/45 p-3">
                    {terminalLines.map((line, index) => (
                      <pre key={`${line}-${index}`} className="whitespace-pre-wrap leading-6">
                        {line}
                      </pre>
                    ))}
                  </div>
                  <div className="mt-3 flex shrink-0 flex-wrap gap-2">
                    {QUICK_COMMANDS.map((item) => (
                      <Button
                        key={item}
                        variant="outline"
                        size="sm"
                        onClick={() => runCommand(item)}
                        className="border-emerald-500/30 bg-black text-emerald-100 hover:bg-black hover:text-emerald-100"
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-2 flex shrink-0 gap-2">
                    <Input
                      value={command}
                      onChange={(event) => setCommand(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") runCommand()
                      }}
                      placeholder={t("commandPlaceholder")}
                      className="border-emerald-500/30 bg-black/50 text-emerald-100 placeholder:text-emerald-100/40"
                    />
                    <Button onClick={() => runCommand()}>{t("sendCommand")}</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-0 overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">{t("cameraPreview")}</h3>
                </div>
                <Badge variant="outline">{selectedDevice.camera.label}</Badge>
              </div>
              <div className="h-[520px] p-3 xl:h-[calc(100%-2.375rem)]">
                <div className="relative h-full overflow-hidden rounded-lg border border-border bg-black">
                  <Image
                    src={selectedDevice.camera.image}
                    alt={`${selectedDevice.camera.label} preview`}
                    fill
                    sizes="(min-width: 1280px) 42vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-black/50 px-4 py-2.5 text-white backdrop-blur">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{selectedDevice.camera.label}</p>
                      <p className="truncate text-xs text-white/75">{selectedDevice.camera.angle}</p>
                    </div>
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", STATUS_DOT[selectedDevice.status])} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 grid gap-2 bg-black/55 p-3 text-sm text-white backdrop-blur sm:grid-cols-3">
                    <InfoTile label="Device" value={selectedDevice.name} />
                    <InfoTile label="Zone" value={selectedDevice.zone} />
                    <InfoTile label="Room" value={selectedDevice.room} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-xs font-medium">{value}</p>
    </div>
  )
}

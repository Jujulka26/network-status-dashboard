"use client"

import { useMemo, useState } from "react"
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
import { DEVICE_ICON, DEVICE_TYPE_LABEL, DeviceStatusBadge, STATUS_DOT } from "./device-ui"
import { cn } from "@/lib/utils"

const QUICK_COMMANDS = ["status", "ping gateway", "show interfaces", "restart service"]

function buildCommandOutput(command: string, deviceName: string, ipAddress: string) {
  const normalized = command.trim().toLowerCase()
  if (!normalized) return ""
  if (normalized.includes("ping")) return `PING ${ipAddress}: 4 packets transmitted, 4 received, 0% packet loss, avg 8.4 ms`
  if (normalized.includes("interface")) return "eth0 up 1Gbps full-duplex\nwlan0 up channel 44 clients stable\nmgmt0 up secure tunnel active"
  if (normalized.includes("restart")) return "Service restart queued. Health probe returned OK after 3.2s."
  if (normalized.includes("status")) return `${deviceName} is online. CPU, memory, and link state are within expected demo thresholds.`
  return `Command executed on ${deviceName}. Demo remote session returned exit code 0.`
}

export function RemoteControlPage() {
  const { refreshInterval, t } = useDashboardPreferences()
  const { floors, lastUpdated, refreshNow } = useNetworkData(refreshInterval * 1000)
  const devices = useMemo(() => floors.flatMap((floor) => floor.devices), [floors])
  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.id ?? "")
  const selectedDevice = devices.find((device) => device.id === selectedDeviceId) ?? devices[0]
  const [command, setCommand] = useState("")
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "NetWatch Remote Shell v1.0",
    "Secure demo tunnel established.",
    "Select a device and run a command.",
  ])

  function runCommand(nextCommand = command) {
    if (!selectedDevice || !nextCommand.trim()) return
    const output = buildCommandOutput(nextCommand, selectedDevice.name, selectedDevice.ipAddress)
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader lastUpdated={lastUpdated} onRefresh={refreshNow} />
      <div className="flex">
        <NavSidebar />
        <main className="flex-1 min-w-0 px-4 py-5 md:px-6 md:py-6">
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t("remoteControl")}</h2>
              <p className="text-sm text-muted-foreground">
                AnyDesk-style remote session with a device home screen and terminal side by side.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
              <Select value={selectedDevice.id} onValueChange={setSelectedDeviceId}>
                <SelectTrigger className="w-full bg-background sm:w-[320px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name} • {device.ipAddress}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="justify-center border-status-healthy bg-status-healthy/10 px-3 py-2 text-status-healthy">
                <CircleDot className="h-3.5 w-3.5" />
                {t("connected")}
              </Badge>
            </div>
          </div>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">{t("remoteHome")}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MousePointer2 className="h-3.5 w-3.5" />
                  <Keyboard className="h-3.5 w-3.5" />
                  <Wifi className="h-3.5 w-3.5 text-status-healthy" />
                </div>
              </div>

              <div className="p-4">
                <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-border bg-[radial-gradient(circle_at_top_left,var(--primary),transparent_32%),linear-gradient(135deg,var(--secondary),var(--background))]">
                  <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-black/40 px-4 py-2 text-xs text-white backdrop-blur">
                    <span>{selectedDevice.name}</span>
                    <span suppressHydrationWarning>{lastUpdated.toLocaleTimeString()}</span>
                  </div>

                  <div className="absolute left-6 top-16 grid gap-3">
                    {[
                      { label: "Status", icon: Activity },
                      { label: "Storage", icon: HardDrive },
                      { label: "Network", icon: Wifi },
                      { label: "Power", icon: Power },
                    ].map(({ label, icon: ItemIcon }) => (
                      <div key={label} className="flex w-24 flex-col items-center gap-1 rounded-md bg-background/70 p-3 text-xs shadow-sm backdrop-blur">
                        <ItemIcon className="h-5 w-5 text-primary" />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute right-6 top-16 w-[min(420px,calc(100%-160px))] rounded-lg border border-white/20 bg-background/85 shadow-lg backdrop-blur">
                    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">{selectedDevice.name}</p>
                        <p className="text-xs text-muted-foreground">{DEVICE_TYPE_LABEL[selectedDevice.type]} • {selectedDevice.ipAddress}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 p-4 sm:grid-cols-2">
                      <InfoTile label="Floor" value={`Floor ${selectedDevice.floor}`} />
                      <InfoTile label="Room" value={selectedDevice.room} />
                      <InfoTile label="CPU" value={selectedDevice.cpu !== undefined ? `${selectedDevice.cpu}%` : "N/A"} />
                      <InfoTile label="Memory" value={selectedDevice.memory !== undefined ? `${selectedDevice.memory}%` : "N/A"} />
                    </div>
                    <div className="px-4 pb-4">
                      <DeviceStatusBadge status={selectedDevice.status} label={t(selectedDevice.status)} />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-black/45 px-4 py-3 text-white backdrop-blur">
                    <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[selectedDevice.status])} />
                    <span className="text-xs">Remote session active • latency 12 ms • encrypted tunnel</span>
                  </div>

                  <div className="absolute bottom-16 right-6 h-28 w-48 overflow-hidden rounded-lg border border-white/20 bg-black">
                    <Image src={selectedDevice.camera.image} alt="" fill sizes="192px" className="object-cover opacity-80" />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Command className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">{t("terminal")}</h3>
                </div>
                <Badge variant="outline">{selectedDevice.ipAddress}</Badge>
              </div>
              <div className="flex min-h-[520px] flex-col bg-[#060a0f] p-4 font-mono text-sm text-emerald-100">
                <div className="flex-1 space-y-2 overflow-y-auto rounded-md border border-emerald-500/20 bg-black/45 p-4">
                  {terminalLines.map((line, index) => (
                    <pre key={`${line}-${index}`} className="whitespace-pre-wrap leading-6">
                      {line}
                    </pre>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK_COMMANDS.map((item) => (
                    <Button key={item} variant="outline" size="sm" onClick={() => runCommand(item)}>
                      {item}
                    </Button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
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
          </section>
        </main>
      </div>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  )
}

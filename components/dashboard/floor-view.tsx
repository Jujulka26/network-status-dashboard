"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, Server, Router, HardDrive, ChevronDown, ChevronUp, Users, Activity, Cpu, MemoryStick } from "lucide-react"
import type { FloorData, Device } from "@/lib/network-data"
import { cn } from "@/lib/utils"

interface FloorViewProps {
  floors: FloorData[]
}

function getStatusColor(status: Device["status"]) {
  switch (status) {
    case "healthy": return "bg-status-healthy"
    case "warning": return "bg-status-warning"
    case "critical": return "bg-status-critical"
    case "offline": return "bg-status-offline"
  }
}

function getStatusBadge(status: Device["status"]) {
  switch (status) {
    case "healthy": return <Badge variant="outline" className="border-status-healthy text-status-healthy bg-status-healthy/10">Healthy</Badge>
    case "warning": return <Badge variant="outline" className="border-status-warning text-status-warning bg-status-warning/10">Warning</Badge>
    case "critical": return <Badge variant="outline" className="border-status-critical text-status-critical bg-status-critical/10">Critical</Badge>
    case "offline": return <Badge variant="outline" className="border-status-offline text-status-offline bg-status-offline/10">Offline</Badge>
  }
}

function getDeviceIcon(type: Device["type"]) {
  switch (type) {
    case "access_point": return Wifi
    case "switch": return HardDrive
    case "router": return Router
    case "server": return Server
  }
}

function DeviceCard({ device }: { device: Device }) {
  const Icon = getDeviceIcon(device.type)
  
  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", "bg-primary/10")}>
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{device.name}</p>
            <p className="text-xs text-muted-foreground">{device.zone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full animate-pulse", getStatusColor(device.status))} />
          {getStatusBadge(device.status)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        {device.clients !== undefined && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{device.clients} clients</span>
          </div>
        )}
        
        {device.bandwidth && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>↑{device.bandwidth.up} ↓{device.bandwidth.down} Mbps</span>
          </div>
        )}
        
        {device.cpu !== undefined && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cpu className="h-3 w-3" />
            <span>CPU: {device.cpu}%</span>
          </div>
        )}
        
        {device.memory !== undefined && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MemoryStick className="h-3 w-3" />
            <span>Memory: {device.memory}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

function FloorCard({ floor, expandTrigger }: { floor: FloorData; expandTrigger: number }) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (expandTrigger > 0) setExpanded(true)
  }, [expandTrigger])
  
  const healthyCount = floor.devices.filter(d => d.status === "healthy").length
  const warningCount = floor.devices.filter(d => d.status === "warning").length
  const criticalCount = floor.devices.filter(d => d.status === "critical").length
  
  const overallStatus = criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "healthy"
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("h-3 w-3 rounded-full", getStatusColor(overallStatus))} />
            <div>
              <CardTitle className="text-base">{floor.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {floor.devices.length} devices • {floor.totalClients} clients • {floor.bandwidth.up + floor.bandwidth.down} Mbps total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              {healthyCount > 0 && <span className="text-status-healthy">{healthyCount} healthy</span>}
              {warningCount > 0 && <span className="text-status-warning">{warningCount} warning</span>}
              {criticalCount > 0 && <span className="text-status-critical">{criticalCount} critical</span>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 300px))" }}>
            {floor.devices.map(device => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function FloorView({ floors }: FloorViewProps) {
  const [expandTrigger, setExpandTrigger] = useState(0)

  useEffect(() => {
    const handler = () => setExpandTrigger(t => t + 1)
    window.addEventListener("expand-floors", handler)
    return () => window.removeEventListener("expand-floors", handler)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Floor-by-Floor Status</h2>
        <p className="text-sm text-muted-foreground">{floors.length} floors monitored</p>
      </div>
      <div className="space-y-4">
        {floors.map(floor => (
          <FloorCard key={floor.floor} floor={floor} expandTrigger={expandTrigger} />
        ))}
      </div>
    </div>
  )
}

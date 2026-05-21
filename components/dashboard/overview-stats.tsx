"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Server, Users, Activity, AlertTriangle, CheckCircle } from "lucide-react"
import type { FloorData } from "@/lib/network-data"

interface OverviewStatsProps {
  floors: FloorData[]
}

export function OverviewStats({ floors }: OverviewStatsProps) {
  const allDevices = floors.flatMap(f => f.devices)
  const totalClients = floors.reduce((sum, f) => sum + f.totalClients, 0)
  const totalBandwidthUp = floors.reduce((sum, f) => sum + f.bandwidth.up, 0)
  const totalBandwidthDown = floors.reduce((sum, f) => sum + f.bandwidth.down, 0)
  
  const healthyDevices = allDevices.filter(d => d.status === "healthy").length
  const warningDevices = allDevices.filter(d => d.status === "warning").length
  const criticalDevices = allDevices.filter(d => d.status === "critical").length
  
  const stats = [
    {
      title: "Total Devices",
      value: allDevices.length,
      subtitle: `${healthyDevices} healthy, ${warningDevices} warnings`,
      icon: Server,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Connected Clients",
      value: totalClients,
      subtitle: "Across all floors",
      icon: Users,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10"
    },
    {
      title: "Bandwidth Usage",
      value: `${((totalBandwidthUp + totalBandwidthDown) / 1000).toFixed(1)} Gbps`,
      subtitle: `↑ ${totalBandwidthUp} Mbps ↓ ${totalBandwidthDown} Mbps`,
      icon: Activity,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10"
    },
    {
      title: "Network Health",
      value: criticalDevices === 0 ? "Operational" : "Issues Detected",
      subtitle: criticalDevices === 0 ? "All systems normal" : `${criticalDevices} critical alerts`,
      icon: criticalDevices === 0 ? CheckCircle : AlertTriangle,
      color: criticalDevices === 0 ? "text-status-healthy" : "text-status-critical",
      bgColor: criticalDevices === 0 ? "bg-status-healthy/10" : "bg-status-critical/10"
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

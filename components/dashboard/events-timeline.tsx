"use client"

import { CalendarClock, CheckCircle2, Eye, Wrench } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Device, MaintenanceEvent } from "@/lib/network-data"
import { useDashboardPreferences } from "./dashboard-preferences"

interface EventsTimelineProps {
  events: MaintenanceEvent[]
  devices: Device[]
  onSelectDevice?: (deviceId: string) => void
}

const EVENT_STYLE = {
  completed: { icon: CheckCircle2, label: "Completed", className: "border-status-healthy text-status-healthy bg-status-healthy/10" },
  scheduled: { icon: CalendarClock, label: "Scheduled", className: "border-chart-2 text-chart-2 bg-chart-2/10" },
  monitoring: { icon: Eye, label: "Monitoring", className: "border-status-warning text-status-warning bg-status-warning/10" },
} as const

function formatEventTime(date: Date) {
  const diffMs = date.getTime() - Date.now()
  const absMinutes = Math.round(Math.abs(diffMs) / 60000)
  if (absMinutes < 60) return diffMs >= 0 ? `in ${absMinutes}m` : `${absMinutes}m ago`
  const absHours = Math.round(absMinutes / 60)
  if (absHours < 24) return diffMs >= 0 ? `in ${absHours}h` : `${absHours}h ago`
  const absDays = Math.round(absHours / 24)
  return diffMs >= 0 ? `in ${absDays}d` : `${absDays}d ago`
}

export function EventsTimeline({ events, devices, onSelectDevice }: EventsTimelineProps) {
  const { t } = useDashboardPreferences()

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("recentEvents")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => {
            const device = devices.find((item) => item.id === event.deviceId)
            const style = EVENT_STYLE[event.status]
            const Icon = style.icon

            return (
              <div key={event.id} className="flex gap-3 rounded-lg border border-border bg-secondary/20 p-3">
                <div className="mt-0.5 rounded-md bg-background p-1.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{event.title}</p>
                    <Badge variant="outline" className={style.className}>{style.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {device && (
                      <button type="button" className="font-medium text-primary hover:underline" onClick={() => onSelectDevice?.(device.id)}>
                        {device.name}
                      </button>
                    )}
                    <span>{formatEventTime(event.timestamp)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

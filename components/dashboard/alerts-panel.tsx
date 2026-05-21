"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, AlertCircle, Info, Check, Bell } from "lucide-react"
import type { Alert } from "@/lib/network-data"
import { cn } from "@/lib/utils"
import { useDashboardPreferences } from "./dashboard-preferences"

interface AlertsPanelProps {
  alerts: Alert[]
  onSelectDevice?: (deviceId: string) => void
}

function getAlertIcon(type: Alert["type"]) {
  switch (type) {
    case "critical": return AlertTriangle
    case "warning": return AlertCircle
    case "info": return Info
  }
}

function getAlertColor(type: Alert["type"]) {
  switch (type) {
    case "critical": return { text: "text-status-critical", bg: "bg-status-critical/10", border: "border-status-critical" }
    case "warning": return { text: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning" }
    case "info": return { text: "text-chart-2", bg: "bg-chart-2/10", border: "border-chart-2" }
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function AlertsPanel({ alerts, onSelectDevice }: AlertsPanelProps) {
  const { t } = useDashboardPreferences()
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(
    new Set(alerts.filter(a => a.acknowledged).map(a => a.id))
  )
  
  const unacknowledgedCount = alerts.filter(a => !acknowledgedAlerts.has(a.id)).length
  
  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]))
  }
  
  const sortedAlerts = [...alerts].sort((a, b) => {
    // Unacknowledged first, then by time
    const aAck = acknowledgedAlerts.has(a.id) ? 1 : 0
    const bAck = acknowledgedAlerts.has(b.id) ? 1 : 0
    if (aAck !== bAck) return aAck - bAck
    return b.timestamp.getTime() - a.timestamp.getTime()
  })
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("recentAlerts")}</CardTitle>
          </div>
          {unacknowledgedCount > 0 && (
            <Badge variant="outline" className="border-status-warning text-status-warning bg-status-warning/10">
              {unacknowledgedCount} {t("unread")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {sortedAlerts.map(alert => {
            const Icon = getAlertIcon(alert.type)
            const colors = getAlertColor(alert.type)
            const isAcknowledged = acknowledgedAlerts.has(alert.id)
            
            return (
              <div
                key={alert.id} 
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  isAcknowledged ? "bg-secondary/20 border-border opacity-60" : `${colors.bg} ${colors.border}`
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className={cn("p-1.5 rounded-md", colors.bg)}>
                      <Icon className={cn("h-4 w-4", colors.text)} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className={cn("text-sm font-medium", isAcknowledged && "text-muted-foreground")}>
                        {alert.deviceId ? (
                          <button type="button" className="text-left hover:underline" onClick={() => onSelectDevice?.(alert.deviceId!)}>
                            {alert.message}
                          </button>
                        ) : (
                          alert.message
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{alert.device}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  {!isAcknowledged && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 shrink-0 px-2"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      <span className="text-xs">{t("ack")}</span>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
          
          {alerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("noAlerts")}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

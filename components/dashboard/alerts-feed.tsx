'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { NetworkAlert } from '@/lib/network-types'
import { AlertTriangle, AlertCircle, Info, Bell, Clock } from 'lucide-react'

interface AlertsFeedProps {
  alerts: NetworkAlert[]
}

const alertConfig = {
  critical: {
    icon: AlertCircle,
    bgClass: 'bg-status-critical-bg',
    iconClass: 'text-status-critical',
    borderClass: 'border-l-status-critical',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-status-warning-bg',
    iconClass: 'text-status-warning',
    borderClass: 'border-l-status-warning',
  },
  info: {
    icon: Info,
    bgClass: 'bg-primary/5',
    iconClass: 'text-primary',
    borderClass: 'border-l-primary',
  },
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function AlertItem({ alert }: { alert: NetworkAlert }) {
  const config = alertConfig[alert.type]
  const Icon = config.icon
  
  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-lg border-l-2 p-3 transition-all duration-200',
        'hover:bg-accent/50',
        config.bgClass,
        config.borderClass
      )}
    >
      <div className={cn('mt-0.5 rounded-full p-1.5', config.bgClass)}>
        <Icon className={cn('h-3.5 w-3.5', config.iconClass)} />
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-sm font-medium leading-tight text-foreground">
          {alert.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {alert.zone}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <Clock className="h-3 w-3" />
        <span className="tabular-nums">{formatTimeAgo(alert.timestamp)}</span>
      </div>
    </div>
  )
}

export function AlertsFeed({ alerts }: AlertsFeedProps) {
  const criticalCount = alerts.filter((a) => a.type === 'critical').length
  const warningCount = alerts.filter((a) => a.type === 'warning').length
  
  return (
    <Card className="border-0 shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Active Alerts</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time network notifications
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-status-critical-bg px-2 py-0.5 text-xs font-medium text-status-critical">
                {criticalCount} Critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-status-warning-bg px-2 py-0.5 text-xs font-medium text-status-warning">
                {warningCount} Warning
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[380px] pr-3">
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-status-optimal-bg p-3 mb-3">
                  <Bell className="h-5 w-5 text-status-optimal" />
                </div>
                <p className="text-sm font-medium text-foreground">All Systems Normal</p>
                <p className="text-xs text-muted-foreground mt-1">No active alerts</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

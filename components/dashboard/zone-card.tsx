'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StatusIndicator } from './status-indicator'
import { cn } from '@/lib/utils'
import type { NetworkZone } from '@/lib/network-types'
import { Clock, Signal, Wifi, Users } from 'lucide-react'

interface ZoneCardProps {
  zone: NetworkZone
}

export function ZoneCard({ zone }: ZoneCardProps) {
  const connectionPercentage = Math.round((zone.connections / zone.maxConnections) * 100)
  
  const getLatencyColor = (latency: number) => {
    if (latency < 30) return 'text-status-optimal'
    if (latency < 80) return 'text-status-warning'
    return 'text-status-critical'
  }
  
  const getBandwidthColor = (bandwidth: number) => {
    if (bandwidth < 60) return 'bg-status-optimal'
    if (bandwidth < 85) return 'bg-status-warning'
    return 'bg-status-critical'
  }

  return (
    <Card className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-foreground">
              {zone.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{zone.floor}</p>
          </div>
          <StatusIndicator status={zone.status} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Latency */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Signal className="h-3 w-3" />
              <span>Latency</span>
            </div>
            <p className={cn('text-lg font-semibold tabular-nums', getLatencyColor(zone.latency))}>
              {zone.latency}<span className="text-xs font-normal text-muted-foreground ml-0.5">ms</span>
            </p>
          </div>
          
          {/* Bandwidth */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wifi className="h-3 w-3" />
              <span>Bandwidth</span>
            </div>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {zone.bandwidth}<span className="text-xs font-normal text-muted-foreground ml-0.5">%</span>
            </p>
          </div>
        </div>
        
        {/* Connections Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Connections</span>
            </div>
            <span className="text-xs font-medium tabular-nums text-foreground">
              {zone.connections}/{zone.maxConnections}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out rounded-full',
                getBandwidthColor(connectionPercentage)
              )}
              style={{ width: `${connectionPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Uptime</span>
          </div>
          <span className="text-xs font-medium tabular-nums text-status-optimal">
            {zone.uptime.toFixed(2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

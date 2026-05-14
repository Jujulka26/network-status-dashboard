'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from './status-indicator'
import type { NetworkZone } from '@/lib/network-types'
import { Building2, Layers } from 'lucide-react'

interface NetworkOverviewProps {
  zones: NetworkZone[]
}

export function NetworkOverview({ zones }: NetworkOverviewProps) {
  const statusCounts = {
    optimal: zones.filter((z) => z.status === 'optimal').length,
    warning: zones.filter((z) => z.status === 'warning').length,
    critical: zones.filter((z) => z.status === 'critical').length,
    offline: zones.filter((z) => z.status === 'offline').length,
  }
  
  const floors = [...new Set(zones.map((z) => z.floor))].sort()
  
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Building Overview</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Network infrastructure status
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-4 gap-3">
          {(['optimal', 'warning', 'critical', 'offline'] as const).map((status) => (
            <div
              key={status}
              className="flex flex-col items-center gap-2 rounded-xl bg-secondary/50 p-3"
            >
              <StatusIndicator status={status} showLabel={false} size="lg" />
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {statusCounts[status]}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {status}
              </span>
            </div>
          ))}
        </div>
        
        {/* Floor Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>Zones by Floor</span>
          </div>
          <div className="space-y-2">
            {floors.map((floor) => {
              const floorZones = zones.filter((z) => z.floor === floor)
              const floorOptimal = floorZones.filter((z) => z.status === 'optimal').length
              const floorPercentage = Math.round((floorOptimal / floorZones.length) * 100)
              
              return (
                <div
                  key={floor}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{floor}</span>
                    <span className="text-xs text-muted-foreground">
                      ({floorZones.length} zones)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {floorZones.map((zone) => (
                        <div
                          key={zone.id}
                          className={`h-2 w-2 rounded-full ${
                            zone.status === 'optimal'
                              ? 'bg-status-optimal'
                              : zone.status === 'warning'
                              ? 'bg-status-warning'
                              : zone.status === 'critical'
                              ? 'bg-status-critical'
                              : 'bg-status-offline'
                          }`}
                          title={zone.name}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {floorPercentage}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

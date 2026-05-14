"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Wifi, Activity, Users } from "lucide-react";
import type { NetworkZone } from "@/lib/network-types";
import { cn } from "@/lib/utils";

interface ZoneCardCompactProps {
  zone: NetworkZone;
}

export function ZoneCardCompact({ zone }: ZoneCardCompactProps) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    optimal: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-red-500",
    offline: "bg-gray-400",
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 cursor-pointer hover:shadow-md",
        expanded && "ring-1 ring-primary/20"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        {/* Collapsed View - Always visible */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                statusColors[zone.status]
              )}
            />
            <div>
              <p className="font-medium text-foreground">{zone.name}</p>
              <p className="text-xs text-muted-foreground">{zone.floor}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
              <Wifi className="h-3.5 w-3.5" />
              <span>{zone.devices}</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
          </div>
        </div>

        {/* Expanded View - Details on demand */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            expanded
              ? "grid-rows-[1fr] opacity-100 mt-4"
              : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{zone.latency}ms</p>
                    <p className="text-xs text-muted-foreground">Latency</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{zone.devices}</p>
                    <p className="text-xs text-muted-foreground">Devices</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{zone.connections}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Bandwidth Utilization
                  </span>
                  <span className="font-medium">{zone.bandwidth}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      zone.bandwidth > 85
                        ? "bg-red-500"
                        : zone.bandwidth > 70
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    )}
                    style={{ width: `${zone.bandwidth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

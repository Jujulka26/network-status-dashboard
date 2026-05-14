"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Activity, Wifi, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { NetworkZone } from "@/lib/network-types";

interface NetworkSummaryProps {
  zones: NetworkZone[];
}

export function NetworkSummary({ zones }: NetworkSummaryProps) {
  const totalDevices = zones.reduce((sum, z) => sum + z.devices, 0);
  const avgLatency = Math.round(
    zones.reduce((sum, z) => sum + z.latency, 0) / zones.length
  );
  const avgBandwidth = Math.round(
    zones.reduce((sum, z) => sum + z.bandwidth, 0) / zones.length
  );

  const healthyZones = zones.filter((z) => z.status === "optimal").length;
  const warningZones = zones.filter((z) => z.status === "warning").length;
  const criticalZones = zones.filter(
    (z) => z.status === "critical" || z.status === "offline"
  ).length;

  const overallStatus =
    criticalZones > 0 ? "critical" : warningZones > 0 ? "warning" : "optimal";

  const statusConfig = {
    optimal: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: CheckCircle2,
      label: "All Systems Operational",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: AlertTriangle,
      label: `${warningZones} Zone${warningZones > 1 ? "s" : ""} Need Attention`,
    },
    critical: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: AlertTriangle,
      label: `${criticalZones} Critical Issue${criticalZones > 1 ? "s" : ""}`,
    },
  };

  const config = statusConfig[overallStatus];
  const StatusIcon = config.icon;

  return (
    <Card
      className={`${config.bg} ${config.border} border-2 shadow-sm transition-all duration-500`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Status Section */}
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${overallStatus === "optimal" ? "bg-emerald-100" : overallStatus === "warning" ? "bg-amber-100" : "bg-red-100"}`}
            >
              <StatusIcon className={`h-6 w-6 ${config.text}`} />
            </div>
            <div>
              <p className={`text-lg font-semibold ${config.text}`}>
                {config.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {healthyZones} of {zones.length} zones running optimally
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {totalDevices}
                </p>
                <p className="text-xs text-muted-foreground">Devices</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {avgLatency}ms
                </p>
                <p className="text-xs text-muted-foreground">Avg Latency</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${avgBandwidth > 70 ? "bg-emerald-500" : avgBandwidth > 40 ? "bg-amber-500" : "bg-red-500"}`}
              />
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {avgBandwidth}%
                </p>
                <p className="text-xs text-muted-foreground">Bandwidth</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

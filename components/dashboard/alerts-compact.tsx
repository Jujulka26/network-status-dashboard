"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NetworkAlert } from "@/lib/network-types";
import { AlertTriangle, AlertCircle, Info, Bell } from "lucide-react";

interface AlertsCompactProps {
  alerts: NetworkAlert[];
  maxVisible?: number;
}

const alertConfig = {
  critical: {
    icon: AlertCircle,
    dotClass: "bg-red-500",
    textClass: "text-red-700",
  },
  warning: {
    icon: AlertTriangle,
    dotClass: "bg-amber-500",
    textClass: "text-amber-700",
  },
  info: {
    icon: Info,
    dotClass: "bg-blue-500",
    textClass: "text-blue-700",
  },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function AlertsCompact({ alerts, maxVisible = 5 }: AlertsCompactProps) {
  const visibleAlerts = alerts.slice(0, maxVisible);
  const remainingCount = Math.max(0, alerts.length - maxVisible);

  const criticalCount = alerts.filter((a) => a.type === "critical").length;

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </div>
          {criticalCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-100 text-xs font-medium text-red-700">
              {criticalCount}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>No active alerts</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleAlerts.map((alert) => {
              const config = alertConfig[alert.type];
              return (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
                >
                  <div
                    className={cn("h-2 w-2 rounded-full shrink-0", config.dotClass)}
                  />
                  <p className="text-sm text-foreground flex-1 truncate">
                    {alert.title}
                  </p>
                  <span
                    suppressHydrationWarning
                    className="text-xs text-muted-foreground tabular-nums shrink-0"
                  >
                    {formatTimeAgo(alert.timestamp)}
                  </span>
                </div>
              );
            })}
            {remainingCount > 0 && (
              <button className="w-full text-xs text-primary hover:text-primary/80 py-2 transition-colors">
                View {remainingCount} more alert{remainingCount > 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

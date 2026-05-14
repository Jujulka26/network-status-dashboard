"use client";

import { Network } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary p-2.5">
          <Network className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Network Monitor
          </h1>
          <p className="text-sm text-muted-foreground">
            Building Infrastructure Status
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-sm text-muted-foreground">Live</span>
      </div>
    </header>
  );
}

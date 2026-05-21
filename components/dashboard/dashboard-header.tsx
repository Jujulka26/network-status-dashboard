"use client"

import { Network, RefreshCw, Settings, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DashboardHeaderProps {
  lastUpdated: Date
  onRefresh?: () => void
}

export function DashboardHeader({ lastUpdated, onRefresh }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Network className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">NetWatch</h1>
              <p className="text-xs text-muted-foreground">Building Network Monitor</p>
            </div>
          </div>
          
          {/* Status and Actions */}
          <div className="flex items-center gap-3">
            {/* Live Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-healthy/10 border border-status-healthy/20">
              <div className="h-2 w-2 rounded-full bg-status-healthy animate-pulse" />
              <span className="text-xs font-medium text-status-healthy">Live</span>
            </div>
            
            {/* Last Updated */}
            <div className="hidden md:block text-xs text-muted-foreground" suppressHydrationWarning>
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
            
            {/* Actions */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Refresh data</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <HelpCircle className="h-4 w-4" />
                    <span className="sr-only">Help and documentation</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Help &amp; Documentation</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </header>
  )
}

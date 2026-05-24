"use client"

import { useEffect, useState } from "react"
import { HelpCircle, Languages, Monitor, Moon, Network, RefreshCw, Settings, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { NavDrawer } from "./nav-drawer"
import { useDashboardPreferences, type DashboardLanguage, type DashboardTheme } from "./dashboard-preferences"
import type { FloorData } from "@/lib/network-data"

interface DashboardHeaderProps {
  lastUpdated: Date
  floors: Pick<FloorData, "floor" | "name" | "shortName">[]
  onRefresh?: () => void
}

export function DashboardHeader({ lastUpdated, floors, onRefresh }: DashboardHeaderProps) {
  const [clockTime, setClockTime] = useState(() => new Date())
  const {
    language,
    setLanguage,
    theme,
    setThemePreference,
    refreshInterval,
    setRefreshInterval,
    compactView,
    setCompactView,
    t,
  } = useDashboardPreferences()

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClockTime(new Date())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="w-full px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <NavDrawer floors={floors} />
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <Network className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">{t("appName")}</h1>
              <p className="text-xs text-muted-foreground">{t("appSubtitle")}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-healthy/10 border border-status-healthy/20">
              <div className="h-2 w-2 rounded-full bg-status-healthy animate-pulse" />
              <span className="text-xs font-medium text-status-healthy">{t("live")}</span>
            </div>
            
            <div
              className="hidden md:block text-xs text-muted-foreground"
              title={`${t("updated")}: ${lastUpdated.toLocaleTimeString()}`}
              suppressHydrationWarning
            >
              {t("updated")}: {clockTime.toLocaleTimeString()}
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">{t("refreshData")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("refreshData")}</p>
                </TooltipContent>
              </Tooltip>
              
              <Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">{t("helpDocumentation")}</span>
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("helpDocumentation")}</p>
                  </TooltipContent>
                </Tooltip>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{t("helpDocumentation")}</DialogTitle>
                    <DialogDescription>
                      Quick guide for using the NetWatch assignment demo.
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="overview" className="mt-2">
                    <TabsList className="grid h-auto w-full grid-cols-2 gap-1 md:grid-cols-3">
                      <TabsTrigger value="overview">{t("dashboardOverview")}</TabsTrigger>
                      <TabsTrigger value="topology">{t("topologyGuide")}</TabsTrigger>
                      <TabsTrigger value="alerts">{t("alertMeanings")}</TabsTrigger>
                      <TabsTrigger value="status">{t("deviceStatus")}</TabsTrigger>
                      <TabsTrigger value="troubleshooting">{t("troubleshooting")}</TabsTrigger>
                      <TabsTrigger value="faq">{t("faq")}</TabsTrigger>
                    </TabsList>
                    {[
                      ["overview", t("helpOverviewBody")],
                      ["topology", t("helpTopologyBody")],
                      ["alerts", t("helpAlertsBody")],
                      ["status", t("helpStatusBody")],
                      ["troubleshooting", t("helpTroubleshootingBody")],
                      ["faq", t("helpFaqBody")],
                    ].map(([value, body]) => (
                      <TabsContent key={value} value={value} className="rounded-lg border border-border bg-secondary/20 p-4 text-sm leading-6 text-muted-foreground">
                        {body}
                      </TabsContent>
                    ))}
                  </Tabs>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">{t("settings")}</span>
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("settings")}</p>
                  </TooltipContent>
                </Tooltip>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("settings")}</DialogTitle>
                    <DialogDescription>{t("saveBehavior")}</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        {t("language")}
                      </label>
                      <Select value={language} onValueChange={(value) => setLanguage(value as DashboardLanguage)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="ms">Bahasa Melayu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("theme")}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "light", label: t("light"), icon: Sun },
                          { value: "dark", label: t("dark"), icon: Moon },
                          { value: "system", label: t("system"), icon: Monitor },
                        ].map(({ value, label, icon: Icon }) => (
                          <Button
                            key={value}
                            type="button"
                            variant={theme === value ? "default" : "outline"}
                            className="justify-center"
                            onClick={() => setThemePreference(value as DashboardTheme)}
                          >
                            <Icon className="h-4 w-4" />
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("refreshInterval")}</label>
                      <Select value={String(refreshInterval)} onValueChange={(value) => setRefreshInterval(Number(value))}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 30].map((seconds) => (
                            <SelectItem key={seconds} value={String(seconds)}>
                              {seconds} {t("seconds")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium">{t("compactView")}</p>
                        <p className="text-xs text-muted-foreground">Reduce card spacing for presentation screens.</p>
                      </div>
                      <Switch checked={compactView} onCheckedChange={setCompactView} />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </header>
  )
}

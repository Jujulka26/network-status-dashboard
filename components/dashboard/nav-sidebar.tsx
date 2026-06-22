"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Activity, GitBranch, Building2, Wrench, MonitorUp, ChevronDown } from "lucide-react"
import type { FloorData } from "@/lib/network-data"
import { withBasePath } from "@/lib/site-path"
import { cn } from "@/lib/utils"
import { useDashboardPreferences } from "./dashboard-preferences"

const NAV_ITEMS = [
  { labelKey: "overview", icon: LayoutDashboard, id: "section-overview", href: "/" },
  { labelKey: "bandwidthAlerts", icon: Activity, id: "section-bandwidth", href: "/" },
  { labelKey: "networkTopology", icon: GitBranch, id: "section-topology", href: "/" },
  { labelKey: "locations", icon: Building2, id: "section-floors", href: "/" },
  { labelKey: "events", icon: Wrench, id: "section-events", href: "/" },
  { labelKey: "remoteControl", icon: MonitorUp, href: "/remote-control" },
] as const

interface NavSidebarProps {
  floors: Pick<FloorData, "floor" | "name" | "shortName">[]
}

export function NavSidebar({ floors }: NavSidebarProps) {
  const { t } = useDashboardPreferences()
  const pathname = usePathname()
  const [active, setActive] = useState<string | null>(null)
  const [locationsOpen, setLocationsOpen] = useState(false)
  const [activeFloor, setActiveFloor] = useState<number | null>(null)

  function resetLocationsMenu() {
    setLocationsOpen(false)
    setActiveFloor(null)
  }

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (!el) return

    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: "smooth" })
  }

  function openLocation(floor?: number) {
    const targetId = floor ? `floor-${floor}` : "section-floors"

    if (pathname !== "/") {
      setActive("section-floors")
      setActiveFloor(floor ?? null)
      window.location.assign(withBasePath(`/#${targetId}`))
      return
    }

    setActive("section-floors")
    setActiveFloor(floor ?? null)
    window.dispatchEvent(new CustomEvent("expand-floors", floor ? { detail: { floor } } : undefined))
    window.setTimeout(() => scrollTo(targetId), 50)
  }

  function navigate(item: (typeof NAV_ITEMS)[number]) {
    if (!("id" in item)) {
      setActive(item.href)
      resetLocationsMenu()
      window.location.assign(withBasePath(item.href))
      return
    }

    if (pathname !== "/") {
      setActive(item.id)
      resetLocationsMenu()
      window.location.assign(withBasePath(`/#${item.id}`))
      return
    }

    const id = item.id
    resetLocationsMenu()
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: "smooth" })
      setActive(id)
    }
    if (id === "section-topology") window.dispatchEvent(new CustomEvent("expand-topology"))
    if (id === "section-floors")   window.dispatchEvent(new CustomEvent("expand-floors"))
  }

  return (
    <aside className="hidden w-52 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] border-r border-border bg-card/50 backdrop-blur-sm overflow-y-auto md:block">
      <nav className="p-3 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
          {t("sections")}
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const itemActive = "id" in item ? active === item.id : pathname === item.href
          if ("id" in item && item.id === "section-floors") {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    setLocationsOpen((open) => !open)
                    setActive(item.id)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                    itemActive || locationsOpen
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1">{t(item.labelKey)}</span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", !locationsOpen && "-rotate-90")} />
                </button>

                {locationsOpen && (
                  <div className="space-y-1 pl-9">
                    {floors.map((floor) => (
                      <button
                        key={floor.floor}
                        type="button"
                        onClick={() => openLocation(floor.floor)}
                        className={cn(
                          "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                          activeFloor === floor.floor
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        {floor.shortName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
          <button
            key={"id" in item ? item.id : item.href}
            onClick={() => navigate(item)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
              itemActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t(item.labelKey)}
          </button>
        )})}
      </nav>
    </aside>
  )
}

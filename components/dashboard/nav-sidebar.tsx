"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Activity, GitBranch, Building2, Wrench, MonitorUp } from "lucide-react"
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

export function NavSidebar() {
  const { t } = useDashboardPreferences()
  const pathname = usePathname()
  const router = useRouter()
  const [active, setActive] = useState<string | null>(null)

  function navigate(item: (typeof NAV_ITEMS)[number]) {
    if (!("id" in item)) {
      router.push(item.href)
      setActive(item.href)
      return
    }

    if (pathname !== "/") {
      router.push(`/#${item.id}`)
      return
    }

    const id = item.id
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

"use client"

import { useState } from "react"
import { LayoutDashboard, Activity, GitBranch, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Overview",           icon: LayoutDashboard, id: "section-overview"  },
  { label: "Bandwidth & Alerts", icon: Activity,        id: "section-bandwidth" },
  { label: "Network Topology",   icon: GitBranch,       id: "section-topology"  },
  { label: "Floor by Floor",     icon: Building2,       id: "section-floors"    },
]

export function NavSidebar() {
  const [active, setActive] = useState<string | null>(null)

  function scrollTo(id: string) {
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
    <aside className="w-52 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] border-r border-border bg-card/50 backdrop-blur-sm overflow-y-auto">
      <nav className="p-3 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
          Sections
        </p>
        {NAV_ITEMS.map(({ label, icon: Icon, id }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
              active === id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

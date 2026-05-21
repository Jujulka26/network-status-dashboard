"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, LayoutDashboard, Activity, GitBranch, Building2, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Overview",         icon: LayoutDashboard, id: "section-overview"  },
  { label: "Bandwidth & Alerts", icon: Activity,      id: "section-bandwidth" },
  { label: "Network Topology", icon: GitBranch,       id: "section-topology"  },
  { label: "Floor-by-Floor",   icon: Building2,       id: "section-floors"    },
]

export function NavDrawer() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setActive(id)
      setOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-base">Navigation</SheetTitle>
        </SheetHeader>

        <nav className="p-4 space-y-1">
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
      </SheetContent>
    </Sheet>
  )
}

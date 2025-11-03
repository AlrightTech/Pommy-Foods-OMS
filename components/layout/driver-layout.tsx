"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, CheckCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

const driverNavigation = [
  { name: "Dashboard", href: "/driver", icon: Home },
  { name: "Deliveries", href: "/driver/deliveries", icon: Package },
  { name: "Completed", href: "/driver/completed", icon: CheckCircle },
  { name: "Profile", href: "/driver/profile", icon: User },
]

export function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF4EC] via-[#FAF4EC] to-[#F5EDE0] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-dark border-b border-gold/20">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold-sm">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">Driver App</p>
              <p className="text-xs text-foreground/60">John Driver</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4">{children}</main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-gold/20">
        <nav className="flex items-center justify-around h-16 px-2">
          {driverNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all duration-300",
                  isActive
                    ? "text-gold bg-white/30"
                    : "text-foreground/60 hover:text-gold"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}


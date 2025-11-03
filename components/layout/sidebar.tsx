"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Store, 
  FileText,
  Truck,
  ChefHat,
  TrendingUp,
  Settings,
  Bell,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Stores", href: "/dashboard/stores", icon: Store },
  { name: "Kitchen", href: "/dashboard/kitchen", icon: ChefHat },
  { name: "Deliveries", href: "/dashboard/deliveries", icon: Truck },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-6 px-3 z-50">
      {/* Logo/Brand */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold-sm">
          <span className="text-2xl font-bold text-white">P</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center w-full h-16 rounded-xl transition-all duration-300",
                "hover:scale-105",
                isActive
                  ? "bg-gradient-to-br from-gold to-gold-dark text-white glow-gold-sm"
                  : "text-foreground/60 hover:text-gold hover:bg-white/50 glass"
              )}
              title={item.name}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive && "scale-110"
                )} 
              />
              <span className={cn(
                "absolute left-full ml-4 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap",
                "bg-gradient-to-br from-gold to-gold-dark text-white opacity-0 invisible",
                "group-hover:opacity-100 group-hover:visible transition-all duration-200",
                "shadow-lg glow-gold-sm"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-2 w-full">
        <Link
          href="/dashboard/notifications"
          className={cn(
            "w-full h-16 rounded-xl text-foreground/60 hover:text-gold hover:bg-white/50 glass flex items-center justify-center transition-all duration-300 hover:scale-105",
            pathname === "/dashboard/notifications" && "text-gold bg-white/50"
          )}
          title="Notifications"
        >
          <Bell className="w-6 h-6" />
        </Link>
        <Link
          href="/dashboard/settings"
          className={cn(
            "w-full h-16 rounded-xl text-foreground/60 hover:text-gold hover:bg-white/50 glass flex items-center justify-center transition-all duration-300 hover:scale-105",
            pathname === "/dashboard/settings" && "text-gold bg-white/50"
          )}
          title="Settings"
        >
          <Settings className="w-6 h-6" />
        </Link>
        <button className="w-full h-16 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-white/50 glass flex items-center justify-center transition-all duration-300 hover:scale-105">
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}


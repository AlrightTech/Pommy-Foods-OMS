"use client"

import { Header } from "./header"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const storeNavigation = [
  { name: "Dashboard", href: "/store", icon: LayoutDashboard },
  { name: "Products & Order", href: "/store/products", icon: ShoppingCart },
  { name: "Stock Management", href: "/store/stock", icon: Package },
  { name: "My Orders", href: "/store/orders", icon: ShoppingCart },
  { name: "Invoices", href: "/store/invoices", icon: FileText },
]

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 flex flex-col py-6 px-4 z-50 glass-dark border-r border-gold/20">
        {/* Logo */}
        <div className="mb-8 px-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold-sm">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <p className="text-sm font-semibold text-gradient-gold mt-2">Store Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {storeNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  "hover:scale-105",
                  isActive
                    ? "bg-gradient-to-br from-gold to-gold-dark text-white glow-gold-sm"
                    : "text-foreground/60 hover:text-gold hover:bg-white/30"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Settings */}
        <div className="px-4">
          <Link
            href="/store/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/60 hover:text-gold hover:bg-white/30 transition-all duration-300"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}


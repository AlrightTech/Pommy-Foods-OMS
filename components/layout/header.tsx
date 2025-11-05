"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, User, Settings, LogOut, ChevronDown, Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { ProfileDialog } from "@/components/profile/profile-dialog"
import { useCurrentUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"

export function Header() {
  const router = useRouter()
  const { data: user, loading } = useCurrentUser()
  const toast = useToast()
  const [showMenu, setShowMenu] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        toast.success("Logged out successfully")
        router.push("/login")
      } else {
        toast.error("Failed to logout", "Please try again")
      }
    } catch (error) {
      toast.error("Error logging out", "Please try again")
    }
  }

  const getRoleDisplay = (role?: string) => {
    if (!role) return "User"
    return role.split("_").map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(" ")
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-dark border-b border-gold/20">
      <div className="flex h-16 items-center justify-between px-8">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Search orders, products, stores..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/50 border border-gold/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all duration-300 text-sm font-medium placeholder:text-foreground/30"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationBell />

          {/* User Profile */}
          <div className="relative flex items-center gap-3 pl-4 border-l border-gold/20">
            <div className="text-right hidden sm:block">
              {loading ? (
                <>
                  <p className="text-sm font-semibold text-foreground">Loading...</p>
                  <p className="text-xs text-foreground/60">...</p>
                </>
              ) : user ? (
                <>
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-foreground/60">{getRoleDisplay(user.role)}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-foreground">User</p>
                  <p className="text-xs text-foreground/60">Unknown</p>
                </>
              )}
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-xl hover:bg-white/50 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 ml-1 text-foreground/60" />
              </Button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl glass border border-gold/20 shadow-lg glow-gold-sm z-50 overflow-hidden">
                    <div className="p-2 space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 hover:bg-white/50"
                        onClick={() => {
                          setShowMenu(false)
                          setShowProfileDialog(true)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 hover:bg-white/50"
                        onClick={() => {
                          setShowMenu(false)
                          router.push("/dashboard/settings")
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 hover:bg-white/50"
                        onClick={() => {
                          setShowMenu(false)
                          router.push("/dashboard/settings")
                        }}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Button>
                      <div className="h-px bg-gold/20 my-1" />
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 hover:bg-red-50/50 text-red-600 hover:text-red-700"
                        onClick={() => {
                          setShowMenu(false)
                          handleLogout()
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Dialog */}
      <ProfileDialog 
        open={showProfileDialog} 
        onOpenChange={setShowProfileDialog} 
      />
    </header>
  )
}


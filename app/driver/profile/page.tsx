"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DriverLayout } from "@/components/layout/driver-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Phone, Mail, LogOut, Settings, Loader2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"

export default function DriverProfilePage() {
  const router = useRouter()
  const { data: user, loading } = useCurrentUser()
  const toast = useToast()

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
      router.push("/login")
    }
  }

  const handleChangePassword = () => {
    router.push("/dashboard/settings")
  }

  const handleNotificationSettings = () => {
    router.push("/dashboard/settings")
  }

  if (loading) {
    return (
      <DriverLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DriverLayout>
    )
  }

  return (
    <DriverLayout>
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-gradient-gold mb-4">Profile</h1>

        {/* Profile Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold-sm">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.name || "Driver"}</h2>
                <p className="text-sm text-foreground/60">
                  {user?.role === "DRIVER" ? "Driver" : user?.role || "User"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold" />
                <div className="flex-1">
                  <p className="text-sm text-foreground/60">Email</p>
                  <p className="font-medium">{user?.email || "Not available"}</p>
                </div>
              </div>

              {user?.store && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gold" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground/60">Store</p>
                    <p className="font-medium">{user.store.name}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Settings</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleChangePassword}
              >
                <Settings className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleNotificationSettings}
              >
                <Settings className="mr-2 h-4 w-4" />
                Notification Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Log Out
        </Button>
      </div>
    </DriverLayout>
  )
}

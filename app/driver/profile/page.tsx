"use client"

import { useState } from "react"
import { DriverLayout } from "@/components/layout/driver-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone, Mail, LogOut } from "lucide-react"

export default function DriverProfilePage() {
  const [profile] = useState({
    name: "John Driver",
    email: "john.driver@pommyfoods.com",
    phone: "+1 234-567-8900",
  })

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
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-sm text-foreground/60">Driver</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold" />
                <div className="flex-1">
                  <p className="text-sm text-foreground/60">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold" />
                <div className="flex-1">
                  <p className="text-sm text-foreground/60">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Settings</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Notification Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => {
            // TODO: Handle logout
            window.location.href = "/login"
          }}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Log Out
        </Button>
      </div>
    </DriverLayout>
  )
}


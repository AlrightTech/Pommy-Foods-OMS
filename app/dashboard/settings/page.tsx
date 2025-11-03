"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Lock, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@pommyfoods.com",
    phone: "+1 234-567-8900",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderApprovals: true,
    deliveryUpdates: true,
    paymentReminders: true,
  })

  const handleProfileUpdate = () => {
    // TODO: API call to update profile
    alert("Profile updated successfully!")
  }

  const handlePasswordUpdate = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match")
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }
    // TODO: API call to update password
    alert("Password updated successfully!")
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Settings</h1>
          <p className="text-foreground/60">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} className="glow-gold-sm">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                  />
                  <p className="text-xs text-foreground/60">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handlePasswordUpdate} className="glow-gold-sm">
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role & Permissions</CardTitle>
                <CardDescription>Your current role and access level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-xl glass border border-gold/20">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Admin</p>
                    <p className="text-sm text-foreground/60">
                      Full access to all system features
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20">
                  <div>
                    <p className="font-semibold">Email Notifications</p>
                    <p className="text-sm text-foreground/60">
                      Receive notifications via email
                    </p>
                  </div>
                  <Button
                    variant={notifications.emailNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        emailNotifications: !notifications.emailNotifications,
                      })
                    }
                  >
                    {notifications.emailNotifications ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20">
                  <div>
                    <p className="font-semibold">Order Approvals</p>
                    <p className="text-sm text-foreground/60">
                      Notify when orders need approval
                    </p>
                  </div>
                  <Button
                    variant={notifications.orderApprovals ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        orderApprovals: !notifications.orderApprovals,
                      })
                    }
                  >
                    {notifications.orderApprovals ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20">
                  <div>
                    <p className="font-semibold">Delivery Updates</p>
                    <p className="text-sm text-foreground/60">
                      Notify about delivery status changes
                    </p>
                  </div>
                  <Button
                    variant={notifications.deliveryUpdates ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        deliveryUpdates: !notifications.deliveryUpdates,
                      })
                    }
                  >
                    {notifications.deliveryUpdates ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20">
                  <div>
                    <p className="font-semibold">Payment Reminders</p>
                    <p className="text-sm text-foreground/60">
                      Remind about upcoming payment due dates
                    </p>
                  </div>
                  <Button
                    variant={notifications.paymentReminders ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        paymentReminders: !notifications.paymentReminders,
                      })
                    }
                  >
                    {notifications.paymentReminders ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      // TODO: API call to save notification preferences
                      alert("Notification preferences saved!")
                    }}
                    className="glow-gold-sm"
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}


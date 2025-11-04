"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, Shield, Loader2 } from "lucide-react"
import { useCurrentUser, useUpdateUser, useUpdatePassword } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { data: user, loading: userLoading, refetch: refetchUser } = useCurrentUser()
  const { mutate: updateUser, loading: updateLoading } = useUpdateUser()
  const { mutate: updatePassword, loading: passwordLoading } = useUpdatePassword()
  const toast = useToast()

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
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

  // Load user data when available
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      })
    }
  }, [user])

  const handleProfileUpdate = async () => {
    if (!user) return

    try {
      await updateUser({
        name: profileData.name,
        email: profileData.email,
      })
      toast.success("Profile updated successfully")
      refetchUser()
    } catch (error: any) {
      toast.error("Failed to update profile", error?.message || "Please try again")
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match", "Please ensure both passwords are the same")
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password too short", "Password must be at least 6 characters")
      return
    }

    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success("Password updated successfully")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      toast.error("Failed to update password", error?.message || "Please check your current password")
    }
  }

  const handleNotificationSave = () => {
    // TODO: API call to save notification preferences
    toast.success("Notification preferences saved")
  }

  const getRoleDisplay = (role?: string) => {
    if (!role) return "User"
    return role.split("_").map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(" ")
  }

  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    )
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
                    disabled={updateLoading}
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
                    disabled={updateLoading}
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button 
                    onClick={handleProfileUpdate} 
                    className="glow-gold-sm"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
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
                    disabled={passwordLoading}
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
                    disabled={passwordLoading}
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
                    disabled={passwordLoading}
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button 
                    onClick={handlePasswordUpdate} 
                    className="glow-gold-sm"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
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
                    <p className="font-semibold">{getRoleDisplay(user?.role)}</p>
                    <p className="text-sm text-foreground/60">
                      {user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
                        ? "Full access to all system features"
                        : user?.role === "STORE_OWNER" || user?.role === "STORE_MANAGER"
                        ? "Access to store management features"
                        : user?.role === "DRIVER"
                        ? "Access to delivery features"
                        : "Access to kitchen features"}
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
                    onClick={handleNotificationSave}
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

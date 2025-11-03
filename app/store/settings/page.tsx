"use client"

import { useState } from "react"
import { StoreLayout } from "@/components/layout/store-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Store, Lock, Bell } from "lucide-react"

export default function StoreSettingsPage() {
  const [storeData, setStoreData] = useState({
    name: "Convenience Store A",
    contactName: "John Doe",
    email: "john@storea.com",
    phone: "+1 234-567-8900",
    address: "123 Main Street",
    city: "New York",
    region: "NYC",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderUpdates: true,
    invoiceAlerts: true,
    stockWarnings: true,
  })

  const handleStoreUpdate = () => {
    // TODO: API call to update store info
    alert("Store information updated successfully!")
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
    <StoreLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Settings</h1>
          <p className="text-foreground/60">Manage your store settings and preferences</p>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList>
            <TabsTrigger value="store">
              <Store className="mr-2 h-4 w-4" />
              Store Info
            </TabsTrigger>
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

          {/* Store Info Tab */}
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>Update your store details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={storeData.name}
                      onChange={(e) =>
                        setStoreData({ ...storeData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                      id="contactName"
                      value={storeData.contactName}
                      onChange={(e) =>
                        setStoreData({ ...storeData, contactName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={storeData.email}
                      onChange={(e) =>
                        setStoreData({ ...storeData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={storeData.phone}
                      onChange={(e) =>
                        setStoreData({ ...storeData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={storeData.address}
                      onChange={(e) =>
                        setStoreData({ ...storeData, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={storeData.city}
                      onChange={(e) =>
                        setStoreData({ ...storeData, city: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={storeData.region}
                      onChange={(e) =>
                        setStoreData({ ...storeData, region: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleStoreUpdate} className="glow-gold-sm">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                  <Input id="name" defaultValue={storeData.contactName} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileEmail">Email Address</Label>
                  <Input id="profileEmail" type="email" defaultValue={storeData.email} />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button className="glow-gold-sm">Save Changes</Button>
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
                    <p className="font-semibold">Order Updates</p>
                    <p className="text-sm text-foreground/60">
                      Notify when order status changes
                    </p>
                  </div>
                  <Button
                    variant={notifications.orderUpdates ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        orderUpdates: !notifications.orderUpdates,
                      })
                    }
                  >
                    {notifications.orderUpdates ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20">
                  <div>
                    <p className="font-semibold">Invoice Alerts</p>
                    <p className="text-sm text-foreground/60">
                      Notify when invoices are generated or due
                    </p>
                  </div>
                  <Button
                    variant={notifications.invoiceAlerts ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        invoiceAlerts: !notifications.invoiceAlerts,
                      })
                    }
                  >
                    {notifications.invoiceAlerts ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20">
                  <div>
                    <p className="font-semibold">Stock Warnings</p>
                    <p className="text-sm text-foreground/60">
                      Alert when stock levels are low
                    </p>
                  </div>
                  <Button
                    variant={notifications.stockWarnings ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        stockWarnings: !notifications.stockWarnings,
                      })
                    }
                  >
                    {notifications.stockWarnings ? "Enabled" : "Disabled"}
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
    </StoreLayout>
  )
}


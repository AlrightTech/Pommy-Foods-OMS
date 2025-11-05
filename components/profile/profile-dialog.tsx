"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Mail, Shield, Building2, Calendar, Loader2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const router = useRouter()
  const { data: user, loading } = useCurrentUser()
  const toast = useToast()

  const getRoleDisplay = (role?: string) => {
    if (!role) return "User"
    return role.split("_").map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(" ")
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A"
    try {
      const d = new Date(date)
      return d.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      })
    } catch {
      return "N/A"
    }
  }

  const handleEditProfile = () => {
    onOpenChange(false)
    router.push("/dashboard/settings")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Details</DialogTitle>
          <DialogDescription>View your account information and details</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold-sm">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                    <p className="text-sm text-foreground/60 mt-1">{getRoleDisplay(user.role)}</p>
                    {user.store && (
                      <p className="text-sm text-foreground/60 mt-1">{user.store.name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Account Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground/60">Email Address</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground/60">Role</p>
                      <p className="font-medium">{getRoleDisplay(user.role)}</p>
                    </div>
                  </div>

                  {user.store && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gold" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground/60">Store</p>
                        <p className="font-medium">{user.store.name}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground/60">Member Since</p>
                      <p className="font-medium">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground/60">Account Status</p>
                      <p className="font-medium">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                          user.isActive 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                onClick={handleEditProfile}
                className="glow-gold-sm"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-foreground/60">Failed to load profile data</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


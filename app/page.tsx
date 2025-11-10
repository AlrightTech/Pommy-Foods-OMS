"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, LayoutDashboard, Store, ChefHat, Truck } from "lucide-react"
import { getLandingPageByRole, getModuleNameByRole } from "@/lib/utils/role-redirect"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  const sessionResult = useSession()
  // Safely destructure with fallback values
  const session = sessionResult?.data ?? null
  const status = sessionResult?.status ?? 'loading'
  const router = useRouter()

  // Redirect authenticated users to their role-specific module
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const landingPage = getLandingPageByRole(session.user.role)
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        router.push(landingPage)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [session, status, router])

  // Timeout fallback - if loading takes too long, show the page anyway
  useEffect(() => {
    if (status === "loading") {
      const timeout = setTimeout(() => {
        // Force status to unauthenticated after 5 seconds if still loading
        // This prevents infinite loading if NextAuth fails
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [status])

  // Show loading state while checking authentication (with timeout protection)
  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-[#FAF4EC] via-[#FAF4EC] to-[#F5EDE0]">
        <div className="text-center space-y-6">
          <Loader2 className="w-12 h-12 animate-spin text-gold mx-auto" />
          <p className="text-foreground/60">Loading...</p>
        </div>
      </main>
    )
  }

  // If authenticated, show a brief redirect message (will redirect via useEffect)
  if (status === "authenticated") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-[#FAF4EC] via-[#FAF4EC] to-[#F5EDE0]">
        <div className="text-center space-y-6">
          <Loader2 className="w-12 h-12 animate-spin text-gold mx-auto" />
          <p className="text-foreground/60">Redirecting to your module...</p>
        </div>
      </main>
    )
  }

  // Public landing page for unauthenticated users
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-[#FAF4EC] via-[#FAF4EC] to-[#F5EDE0]">
      <div className="w-full max-w-6xl space-y-12 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-block mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold-lg mx-auto">
              <span className="text-5xl font-bold text-white">P</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gradient-gold mb-4">
            Pommy Foods
          </h1>
          <p className="text-xl text-foreground/70 mb-2">
            Digital Distribution System
          </p>
          <p className="text-foreground/60 mb-8 max-w-2xl mx-auto">
            Smart Order Management System for seamless food distribution. 
            Access your module below or sign in to continue.
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Admin Dashboard */}
          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <Link href="/login">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center text-gold mb-2 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Admin Dashboard</CardTitle>
                <CardDescription className="text-sm">
                  Manage orders, products, and operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gold font-medium group-hover:gap-2 transition-all">
                  Access
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Store Portal */}
          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <Link href="/login">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                  <Store className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Store Portal</CardTitle>
                <CardDescription className="text-sm">
                  View orders, invoices, and stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
                  Access
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Kitchen Module */}
          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <Link href="/login">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center text-green-600 mb-2 group-hover:scale-110 transition-transform">
                  <ChefHat className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Kitchen Module</CardTitle>
                <CardDescription className="text-sm">
                  Manage kitchen sheets and packing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-green-600 font-medium group-hover:gap-2 transition-all">
                  Access
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Driver App */}
          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <Link href="/login">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center text-purple-600 mb-2 group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Driver App</CardTitle>
                <CardDescription className="text-sm">
                  Manage deliveries and routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-purple-600 font-medium group-hover:gap-2 transition-all">
                  Access
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Login CTA */}
        <div className="text-center pt-8">
          <Link href="/login">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-gold to-gold-dark text-white hover:from-gold-dark hover:to-gold glow-gold-lg px-8 py-6 text-lg font-semibold"
            >
              Sign In to Your Module
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

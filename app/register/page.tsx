"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useStores } from "@/hooks/use-stores"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const toast = useToast()
  const { data: stores, loading: storesLoading } = useStores()
  const [isRegistering, setIsRegistering] = useState(false)

  const handleRegister = async (data: {
    name: string
    email: string
    password: string
    role: string
    storeId?: string
  }) => {
    setIsRegistering(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          storeId: data.storeId || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }

      toast.success(
        "Registration Successful",
        "Your account has been created. Please contact admin for activation."
      )
      
      // Redirect to login after successful registration
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      toast.error("Registration Failed", error?.message || "Please try again")
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-[#FAF4EC] via-[#FAF4EC] to-[#F5EDE0]">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold-lg mx-auto mb-4">
              <span className="text-4xl font-bold text-white">P</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Create Account</h1>
          <p className="text-foreground/60">Register a new user account</p>
        </div>

        {/* Registration Card */}
        <Card className="glow-gold-sm">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create a new account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            {storesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            ) : (
              <RegisterForm 
                onSubmit={handleRegister} 
                stores={stores || []} 
              />
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-foreground/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold hover:text-gold-dark transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}


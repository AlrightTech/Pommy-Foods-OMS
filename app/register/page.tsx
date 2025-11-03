"use client"

import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// Mock stores - will be replaced with API call
const mockStores = [
  { id: "1", name: "Convenience Store A" },
  { id: "2", name: "Restaurant B" },
  { id: "3", name: "Convenience Store C" },
]

export default function RegisterPage() {
  const handleRegister = async (data: {
    name: string
    email: string
    password: string
    role: string
    storeId?: string
  }) => {
    // TODO: Implement actual registration
    console.log("Registration attempt:", data)
    alert("Registration successful! Please contact admin for account activation.")
    // Redirect to login after successful registration
    window.location.href = "/login"
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
            <RegisterForm onSubmit={handleRegister} stores={mockStores} />
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


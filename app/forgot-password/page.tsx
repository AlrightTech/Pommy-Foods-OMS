"use client"

import { useState } from "react"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (data: { email: string }) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send reset email")
      }

      toast.success(
        "Email Sent",
        "If an account with that email exists, we've sent a password reset link."
      )
    } catch (error: any) {
      toast.error("Error", error?.message || "Failed to process request")
    } finally {
      setIsLoading(false)
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
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Reset Password</h1>
          <p className="text-foreground/60">Enter your email to receive a reset link</p>
        </div>

        {/* Password Reset Card */}
        <Card className="glow-gold-sm">
          <CardHeader>
            <CardTitle>Forgot Password?</CardTitle>
            <CardDescription>
              No worries! We&apos;ll send you reset instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm onSubmit={handleForgotPassword} />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-gold hover:text-gold-dark transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}


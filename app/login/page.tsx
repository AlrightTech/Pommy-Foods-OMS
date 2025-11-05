"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Login Failed", result.error || "Invalid credentials")
        return
      }

      if (result?.ok) {
        toast.success("Login successful!")
        // Redirect based on user role
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: any) {
      toast.error("Login Failed", error?.message || "An error occurred")
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
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Welcome Back</h1>
          <p className="text-foreground/60">Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <Card className="glow-gold-sm">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm onSubmit={handleLogin} />
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-foreground/60">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-gold hover:text-gold-dark transition-colors">
            Contact Admin
          </Link>
        </p>
      </div>
    </div>
  )
}


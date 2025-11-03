"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2 } from "lucide-react"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormValues) => Promise<void>
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onFormSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      setIsSuccess(true)
    } catch (error) {
      console.error("Password reset error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Email Sent!</h3>
          <p className="text-sm text-foreground/60">
            We&apos;ve sent a password reset link to your email address. Please check your inbox.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register("email")}
          disabled={isLoading}
          className={errors.email ? "border-red-500 focus:ring-red-500/50" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
        <p className="text-xs text-foreground/60">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  )
}


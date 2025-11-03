"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import type { UserRole } from "@/types"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["ADMIN", "STORE_OWNER", "STORE_MANAGER", "KITCHEN_STAFF", "DRIVER"]),
  storeId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => Promise<void>
  stores?: Array<{ id: string; name: string }>
}

export function RegisterForm({ onSubmit, stores = [] }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("STORE_OWNER")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "STORE_OWNER",
    },
  })

  const watchedRole = watch("role")

  const onFormSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const showStoreSelection = watchedRole === "STORE_OWNER" || watchedRole === "STORE_MANAGER"

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...register("name")}
            disabled={isLoading}
            className={errors.name ? "border-red-500 focus:ring-red-500/50" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            id="role"
            {...register("role")}
            disabled={isLoading}
            onChange={(e) => {
              setSelectedRole(e.target.value as UserRole)
            }}
          >
            <option value="ADMIN">Admin</option>
            <option value="STORE_OWNER">Store Owner</option>
            <option value="STORE_MANAGER">Store Manager</option>
            <option value="KITCHEN_STAFF">Kitchen Staff</option>
            <option value="DRIVER">Driver</option>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {showStoreSelection && stores.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="storeId">Store</Label>
            <Select
              id="storeId"
              {...register("storeId")}
              disabled={isLoading}
            >
              <option value="">Select a store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password")}
              disabled={isLoading}
              className={errors.password ? "border-red-500 focus:ring-red-500/50 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              disabled={isLoading}
              className={errors.confirmPassword ? "border-red-500 focus:ring-red-500/50 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
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
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}


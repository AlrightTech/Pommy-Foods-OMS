"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const storeSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "Region is required"),
  creditLimit: z.number().min(0, "Credit limit must be positive").default(0),
  paymentTerms: z.number().min(1, "Payment terms must be at least 1 day").default(30),
})

type StoreFormValues = z.infer<typeof storeSchema>

interface StoreFormProps {
  defaultValues?: Partial<StoreFormValues>
  onSubmit: (data: StoreFormValues) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function StoreForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: StoreFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      creditLimit: 0,
      paymentTerms: 30,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Store Name *</Label>
          <Input
            id="name"
            {...register("name")}
            disabled={isLoading}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name *</Label>
          <Input
            id="contactName"
            {...register("contactName")}
            disabled={isLoading}
            className={errors.contactName ? "border-red-500" : ""}
          />
          {errors.contactName && (
            <p className="text-sm text-red-600">{errors.contactName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            disabled={isLoading}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            {...register("phone")}
            disabled={isLoading}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address *</Label>
          <Textarea
            id="address"
            {...register("address")}
            disabled={isLoading}
            rows={2}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...register("city")}
            disabled={isLoading}
            className={errors.city ? "border-red-500" : ""}
          />
          {errors.city && (
            <p className="text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Region *</Label>
          <Input
            id="region"
            {...register("region")}
            disabled={isLoading}
            className={errors.region ? "border-red-500" : ""}
          />
          {errors.region && (
            <p className="text-sm text-red-600">{errors.region.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="creditLimit">Credit Limit ($)</Label>
          <Input
            id="creditLimit"
            type="number"
            step="0.01"
            {...register("creditLimit", { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
          <Input
            id="paymentTerms"
            type="number"
            {...register("paymentTerms", { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Store"}
        </Button>
      </div>
    </form>
  )
}


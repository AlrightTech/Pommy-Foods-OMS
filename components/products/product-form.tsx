"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  unit: z.string().default("unit"),
  category: z.string().optional(),
  shelfLife: z.number().min(1, "Shelf life must be at least 1 day").optional(),
  storageTempMin: z.number().optional(),
  storageTempMax: z.number().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>
  onSubmit: (data: ProductFormValues) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function ProductForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
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
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            {...register("sku")}
            disabled={isLoading}
            className={errors.sku ? "border-red-500" : ""}
          />
          {errors.sku && (
            <p className="text-sm text-red-600">{errors.sku.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            disabled={isLoading}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            {...register("unit")}
            disabled={isLoading}
            placeholder="unit, kg, box, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            {...register("category")}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shelfLife">Shelf Life (days)</Label>
          <Input
            id="shelfLife"
            type="number"
            {...register("shelfLife", { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storageTempMin">Min Storage Temp (°C)</Label>
          <Input
            id="storageTempMin"
            type="number"
            step="0.1"
            {...register("storageTempMin", { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storageTempMax">Max Storage Temp (°C)</Label>
          <Input
            id="storageTempMax"
            type="number"
            step="0.1"
            {...register("storageTempMax", { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          disabled={isLoading}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  )
}


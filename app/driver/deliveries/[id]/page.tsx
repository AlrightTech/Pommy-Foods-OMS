"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DriverLayout } from "@/components/layout/driver-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GPSTracker } from "@/components/driver/gps-tracker"
import { SignatureCapture } from "@/components/driver/signature-capture"
import { TemperatureLogger } from "@/components/driver/temperature-logger"
import { ReturnEntry } from "@/components/driver/return-entry"
import { PaymentCollector } from "@/components/driver/payment-collector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Package,
  CheckCircle2,
  Thermometer,
  RotateCcw,
  DollarSign,
  Camera,
  Loader2,
} from "lucide-react"
import { useDelivery, useStartDelivery, useCompleteDelivery } from "@/hooks/use-deliveries"
import { useLogTemperature, useSubmitReturn, useRecordPayment } from "@/hooks/use-driver"
import { useProducts } from "@/hooks/use-products"
import { useToast } from "@/hooks/use-toast"
import type { DeliveryStatus, PaymentMethod } from "@/types"

export default function DeliveryExecutionPage() {
  const params = useParams()
  const router = useRouter()
  const deliveryId = params.id as string
  const { data: delivery, loading: deliveryLoading, refetch: refetchDelivery } = useDelivery(deliveryId)
  const { mutate: startDelivery, loading: startLoading } = useStartDelivery(deliveryId)
  const { mutate: completeDelivery, loading: completeLoading } = useCompleteDelivery(deliveryId)
  const { mutate: logTemperature, loading: tempLoading } = useLogTemperature()
  const { mutate: submitReturn, loading: returnLoading } = useSubmitReturn()
  const { mutate: recordPayment, loading: paymentLoading } = useRecordPayment()
  const { data: products } = useProducts()
  const toast = useToast()
  
  const [signature, setSignature] = useState<string | null>(null)
  const [showSignatureCapture, setShowSignatureCapture] = useState(false)
  const [activeTab, setActiveTab] = useState("delivery")

  const handleStartDelivery = async () => {
    try {
      await startDelivery()
      toast.success("Delivery started successfully")
      refetchDelivery()
    } catch (error: any) {
      toast.error("Failed to start delivery", error?.message || "Please try again")
    }
  }

  const handleCompleteDelivery = async () => {
    if (!signature) {
      toast.error("Signature Required", "Please capture customer signature first")
      return
    }
    
    try {
      await completeDelivery({
        signature,
        notes: "",
      })
      toast.success("Delivery completed successfully")
      router.push("/driver/deliveries")
    } catch (error: any) {
      toast.error("Failed to complete delivery", error?.message || "Please try again")
    }
  }

  const handleTemperatureLog = async (temp: number, location: string, notes?: string) => {
    if (!delivery) return
    
    try {
      await logTemperature({
        deliveryId: delivery.id,
        temperature: temp,
        location,
        notes,
      })
      toast.success("Temperature logged successfully")
    } catch (error: any) {
      toast.error("Failed to log temperature", error?.message || "Please try again")
    }
  }

  const handleReturnSubmit = async (items: any[]) => {
    if (!delivery) return
    
    try {
      await submitReturn({
        deliveryId: delivery.id,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          expiryDate: item.expiryDate || new Date().toISOString(),
          reason: item.reason || "expired",
        })),
        notes: "",
      })
      toast.success("Returns submitted successfully")
      refetchDelivery()
    } catch (error: any) {
      toast.error("Failed to submit returns", error?.message || "Please try again")
    }
  }

  const handlePayment = async (payment: {
    method: PaymentMethod
    amount: number
    receiptUrl?: string
    notes?: string
  }) => {
    if (!delivery) return
    
    // Get invoice ID from delivery's order
    const invoiceId = (delivery.order as any)?.invoiceId || ""
    
    if (!invoiceId) {
      toast.error("Invoice Not Found", "No invoice found for this delivery")
      return
    }
    
    try {
      await recordPayment({
        invoiceId,
        deliveryId: delivery.id,
        amount: payment.amount,
        receiptUrl: payment.receiptUrl,
        notes: payment.notes,
      })
      toast.success("Payment recorded successfully")
      refetchDelivery()
    } catch (error: any) {
      toast.error("Failed to record payment", error?.message || "Please try again")
    }
  }

  const handlePhotoUpload = () => {
    // TODO: Implement photo upload
    toast.info("Photo upload functionality will be implemented soon")
  }

  // Format delivery items
  const deliveryItems = (delivery?.order as any)?.items?.map((item: any) => ({
    productName: item.product?.name || "Unknown Product",
    quantity: item.quantity || 0,
  })) || []

  // Calculate invoice amount (from order totalAmount)
  const invoiceAmount = (delivery?.order as any)?.totalAmount || 0

  // Get products for return entry
  const productsForReturn = products || []

  const isLoading = deliveryLoading || startLoading || completeLoading || tempLoading || returnLoading || paymentLoading

  if (deliveryLoading) {
    return (
      <DriverLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DriverLayout>
    )
  }

  if (!delivery) {
    return (
      <DriverLayout>
        <div className="text-center py-12">
          <p className="text-foreground/60">Delivery not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </DriverLayout>
    )
  }

  return (
    <DriverLayout>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient-gold">
              {delivery.order?.orderNumber || delivery.id}
            </h1>
            <p className="text-foreground/60">{delivery.store?.name || "Unknown Store"}</p>
          </div>
          <Badge
            variant={
              delivery.status === "DELIVERED"
                ? "success"
                : delivery.status === "IN_TRANSIT"
                ? "default"
                : "secondary"
            }
          >
            {delivery.status.replace("_", " ")}
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="delivery" className="flex-1">Delivery</TabsTrigger>
            <TabsTrigger value="returns" className="flex-1">Returns</TabsTrigger>
            <TabsTrigger value="payment" className="flex-1">Payment</TabsTrigger>
          </TabsList>

          {/* Delivery Tab */}
          <TabsContent value="delivery" className="space-y-4 mt-4">
            {/* Delivery Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gold" />
                  <div>
                    <p className="text-sm text-foreground/60">Delivery Address</p>
                    <p className="font-semibold">{delivery.deliveryAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-gold" />
                  <div>
                    <p className="text-sm text-foreground/60">Items</p>
                    <p className="font-semibold">{deliveryItems.length} products</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GPS Tracker */}
            <GPSTracker
              destination={{
                address: delivery.deliveryAddress,
                latitude: (delivery.store as any)?.latitude || 0,
                longitude: (delivery.store as any)?.longitude || 0,
              }}
            />

            {/* Temperature Logger */}
            <TemperatureLogger onLog={handleTemperatureLog} />

            {/* Delivery Items */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Delivery Items</h3>
                {deliveryItems.length === 0 ? (
                  <div className="text-center py-8 text-foreground/60">
                    <p>No items found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deliveryItems.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl glass border border-gold/20"
                      >
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-foreground/60">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              {delivery.status === "ASSIGNED" && (
                <Button 
                  onClick={handleStartDelivery} 
                  className="w-full glow-gold-sm" 
                  size="lg"
                  disabled={isLoading}
                >
                  {startLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    "Start Delivery"
                  )}
                </Button>
              )}

              {delivery.status === "IN_TRANSIT" && (
                <>
                  <Button
                    onClick={() => setShowSignatureCapture(true)}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    Capture Signature
                  </Button>
                  <Button
                    onClick={handlePhotoUpload}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Upload Photo
                  </Button>
                  <Button
                    onClick={handleCompleteDelivery}
                    disabled={!signature || isLoading}
                    className="w-full glow-gold-sm"
                    size="lg"
                  >
                    {completeLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Complete Delivery
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Signature Capture Modal */}
            {showSignatureCapture && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-cream rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <SignatureCapture
                    onSave={(sig) => {
                      setSignature(sig)
                      setShowSignatureCapture(false)
                    }}
                    onCancel={() => setShowSignatureCapture(false)}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Returns Tab */}
          <TabsContent value="returns" className="mt-4">
            <ReturnEntry products={productsForReturn} onSubmit={handleReturnSubmit} />
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="mt-4">
            <PaymentCollector
              invoiceAmount={Number(invoiceAmount)}
              onPayment={handlePayment}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DriverLayout>
  )
}

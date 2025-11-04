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
} from "lucide-react"
import type { DeliveryStatus, PaymentMethod } from "@/types"

// Mock delivery data
const mockDelivery = {
  id: "1",
  orderNumber: "ORD-001",
  storeName: "Convenience Store A",
  address: "123 Main Street, New York, NY 10001",
  scheduledDate: new Date("2024-01-16"),
  status: "ASSIGNED" as DeliveryStatus,
  items: [
    { productName: "Pommy Meal - Chicken", quantity: 20 },
    { productName: "Pommy Meal - Beef", quantity: 15 },
  ],
}

const mockProducts = [
  { id: "1", name: "Pommy Meal - Chicken", sku: "PM-CH-001" },
  { id: "2", name: "Pommy Meal - Beef", sku: "PM-BF-001" },
  { id: "3", name: "Pommy Meal - Vegetarian", sku: "PM-VEG-001" },
]

export default function DeliveryExecutionPage() {
  const params = useParams()
  const router = useRouter()
  const [delivery, setDelivery] = useState(mockDelivery)
  const [signature, setSignature] = useState<string | null>(null)
  const [showSignatureCapture, setShowSignatureCapture] = useState(false)
  const [activeTab, setActiveTab] = useState("delivery")

  const handleStartDelivery = () => {
    setDelivery({ ...delivery, status: "IN_TRANSIT" })
    // TODO: API call to start delivery
  }

  const handleCompleteDelivery = () => {
    if (!signature) {
      alert("Please capture customer signature first")
      return
    }
    setDelivery({ ...delivery, status: "DELIVERED" })
    // TODO: API call to complete delivery
    router.push("/driver/deliveries")
  }

  const handleTemperatureLog = async (temp: number, location: string, notes?: string) => {
    // TODO: API call to log temperature
    console.log("Temperature logged:", { temp, location, notes })
  }

  const handleReturnSubmit = async (items: any[]) => {
    // TODO: API call to submit returns
    console.log("Returns submitted:", items)
  }

  const handlePayment = async (payment: {
    method: PaymentMethod
    amount: number
    receiptUrl?: string
    notes?: string
  }) => {
    // TODO: API call to record payment
    console.log("Payment recorded:", payment)
  }

  const handlePhotoUpload = () => {
    // TODO: Implement photo upload
    alert("Photo upload functionality will be implemented")
  }

  return (
    <DriverLayout>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient-gold">{delivery.orderNumber}</h1>
            <p className="text-foreground/60">{delivery.storeName}</p>
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
                    <p className="font-semibold">{delivery.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-gold" />
                  <div>
                    <p className="text-sm text-foreground/60">Items</p>
                    <p className="font-semibold">{delivery.items.length} products</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GPS Tracker */}
            <GPSTracker
              destination={{
                address: delivery.address,
                latitude: 40.7128,
                longitude: -74.0060,
              }}
            />

            {/* Temperature Logger */}
            <TemperatureLogger onLog={handleTemperatureLog} />

            {/* Delivery Items */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Delivery Items</h3>
                <div className="space-y-2">
                  {delivery.items.map((item, index) => (
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
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              {delivery.status === "ASSIGNED" && (
                <Button onClick={handleStartDelivery} className="w-full glow-gold-sm" size="lg">
                  Start Delivery
                </Button>
              )}

              {delivery.status === "IN_TRANSIT" && (
                <>
                  <Button
                    onClick={() => setShowSignatureCapture(true)}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Capture Signature
                  </Button>
                  <Button
                    onClick={handlePhotoUpload}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Upload Photo
                  </Button>
                  <Button
                    onClick={handleCompleteDelivery}
                    disabled={!signature}
                    className="w-full glow-gold-sm"
                    size="lg"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Complete Delivery
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
            <ReturnEntry products={mockProducts} onSubmit={handleReturnSubmit} />
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="mt-4">
            <PaymentCollector
              invoiceAmount={450.0}
              onPayment={handlePayment}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DriverLayout>
  )
}


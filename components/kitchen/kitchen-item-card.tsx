"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, QrCode } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface KitchenItem {
  id: string
  productName: string
  productSku: string
  quantity: number
  batchNumber?: string
  expiryDate?: Date
  barcode?: string
  qrCode?: string
  isPacked: boolean
}

interface KitchenItemCardProps {
  item: KitchenItem
  onUpdate: (itemId: string, updates: Partial<KitchenItem>) => void
  readonly?: boolean
}

export function KitchenItemCard({ item, onUpdate, readonly = false }: KitchenItemCardProps) {
  const [batchNumber, setBatchNumber] = useState(item.batchNumber || "")
  const [expiryDate, setExpiryDate] = useState(
    item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : ""
  )
  const [showBarcode, setShowBarcode] = useState(false)

  const handleSave = () => {
    onUpdate(item.id, {
      batchNumber,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    })
  }

  const handlePack = () => {
    // Generate barcode/QR code when packing
    const barcode = `BC${item.id}${Date.now()}`
    const qrCode = `QR${item.id}${Date.now()}`
    onUpdate(item.id, {
      isPacked: true,
      barcode,
      qrCode,
    })
  }

  return (
    <Card className={item.isPacked ? "border-green-500/30 bg-green-50/30" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground">{item.productName}</h4>
              {item.isPacked && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Packed
                </Badge>
              )}
            </div>
            <p className="text-sm text-foreground/60">SKU: {item.productSku}</p>
            <p className="text-sm font-medium mt-1">Quantity: {item.quantity}</p>
          </div>
        </div>

        {!readonly && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`batch-${item.id}`} className="text-xs">
                  Batch Number
                </Label>
                <Input
                  id={`batch-${item.id}`}
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Enter batch number"
                  disabled={item.isPacked}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`expiry-${item.id}`} className="text-xs">
                  Expiry Date
                </Label>
                <Input
                  id={`expiry-${item.id}`}
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  disabled={item.isPacked}
                />
              </div>
            </div>

            {batchNumber && expiryDate && !item.isPacked && (
              <Button onClick={handleSave} variant="outline" size="sm" className="w-full">
                Save Details
              </Button>
            )}

            {batchNumber && expiryDate && !item.isPacked && (
              <Button
                onClick={handlePack}
                className="w-full glow-gold-sm"
                size="sm"
              >
                Mark as Packed
              </Button>
            )}

            {item.isPacked && (
              <Button
                onClick={() => setShowBarcode(true)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <QrCode className="mr-2 h-4 w-4" />
                View Barcode/QR
              </Button>
            )}
          </div>
        )}

        {readonly && item.batchNumber && (
          <div className="mt-3 pt-3 border-t border-gold/20 space-y-1">
            <p className="text-xs text-foreground/60">Batch: {item.batchNumber}</p>
            {item.expiryDate && (
              <p className="text-xs text-foreground/60">
                Expiry: {new Date(item.expiryDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {showBarcode && (
        <Dialog open={showBarcode} onOpenChange={setShowBarcode}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Barcode & QR Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center p-4 rounded-xl glass border border-gold/20">
                <p className="text-sm text-foreground/60 mb-2">Barcode</p>
                <p className="font-mono text-lg">{item.barcode}</p>
              </div>
              <div className="text-center p-4 rounded-xl glass border border-gold/20">
                <p className="text-sm text-foreground/60 mb-2">QR Code</p>
                <p className="font-mono text-sm break-all">{item.qrCode}</p>
                {/* In production, you would render an actual QR code image here */}
                <div className="mt-2 p-4 bg-white rounded">
                  <p className="text-xs text-foreground/40">QR Code Image Placeholder</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}


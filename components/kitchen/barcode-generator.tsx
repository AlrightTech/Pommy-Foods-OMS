"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCode } from "@/components/ui/qr-code"
import { Download, Printer } from "lucide-react"

interface BarcodeGeneratorProps {
  itemId: string
  barcode: string
  qrCode: string
  productName: string
  productSku: string
  batchNumber?: string
  expiryDate?: Date
  open: boolean
  onClose: () => void
}

export function BarcodeGenerator({
  itemId,
  barcode,
  qrCode,
  productName,
  productSku,
  batchNumber,
  expiryDate,
  open,
  onClose,
}: BarcodeGeneratorProps) {
  const [printMode, setPrintMode] = useState(false)

  const handlePrint = () => {
    setPrintMode(true)
    setTimeout(() => {
      window.print()
      setPrintMode(false)
    }, 100)
  }

  const handleDownload = () => {
    // Create a canvas for download
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 400
    canvas.height = 300

    // White background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw product info
    ctx.fillStyle = "#000000"
    ctx.font = "bold 16px Arial"
    ctx.fillText(productName, 20, 30)
    ctx.font = "12px Arial"
    ctx.fillText(`SKU: ${productSku}`, 20, 50)
    if (batchNumber) {
      ctx.fillText(`Batch: ${batchNumber}`, 20, 70)
    }
    if (expiryDate) {
      ctx.fillText(`Expiry: ${new Date(expiryDate).toLocaleDateString()}`, 20, 90)
    }

    // Draw barcode text
    ctx.font = "bold 14px monospace"
    ctx.fillText(barcode, 20, 120)

    // Draw QR code (simplified - in production use actual QR library)
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.strokeRect(20, 140, 100, 100)

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `barcode-${productSku}-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${printMode ? "print:block" : ""}`}>
        <DialogHeader>
          <DialogTitle>Barcode & QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information */}
          <div className="p-4 rounded-xl glass border border-gold/20">
            <h3 className="font-semibold mb-2">{productName}</h3>
            <div className="space-y-1 text-sm text-foreground/60">
              <p>SKU: {productSku}</p>
              {batchNumber && <p>Batch: {batchNumber}</p>}
              {expiryDate && (
                <p>Expiry: {new Date(expiryDate).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {/* Barcode Section */}
          <div className="text-center p-6 rounded-xl glass border border-gold/20">
            <p className="text-sm font-medium text-foreground/60 mb-3">Barcode</p>
            <div className="bg-white p-4 rounded-lg inline-block">
              <p className="font-mono text-xl font-bold tracking-wider">{barcode}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="text-center p-6 rounded-xl glass border border-gold/20">
            <p className="text-sm font-medium text-foreground/60 mb-3">QR Code</p>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCode value={qrCode || barcode} size={200} />
              </div>
            </div>
            {qrCode && (
              <p className="mt-2 text-xs text-foreground/40 font-mono break-all">
                {qrCode}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end print:hidden">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={onClose} size="sm">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { DollarSign, Upload, CheckCircle2 } from "lucide-react"
import type { PaymentMethod } from "@/types"

interface PaymentCollectorProps {
  invoiceAmount: number
  onPayment: (payment: {
    method: PaymentMethod
    amount: number
    receiptUrl?: string
    notes?: string
  }) => Promise<void>
}

export function PaymentCollector({ invoiceAmount, onPayment }: PaymentCollectorProps) {
  const [method, setMethod] = useState<PaymentMethod>("CASH")
  const [amount, setAmount] = useState(invoiceAmount.toString())
  const [notes, setNotes] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    const paymentAmount = parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Upload receipt file if provided
      let receiptUrl: string | undefined
      if (receiptFile) {
        // In production, upload to storage and get URL
        receiptUrl = "placeholder-receipt-url"
      }

      await onPayment({
        method,
        amount: paymentAmount,
        receiptUrl,
        notes: notes || undefined,
      })

      setIsSubmitted(true)
    } catch (error) {
      console.error("Payment collection error:", error)
      alert("Failed to record payment")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Payment Recorded!</h3>
          <p className="text-sm text-foreground/60">
            Payment of ${parseFloat(amount).toFixed(2)} has been recorded.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-gold" />
            <h3 className="font-semibold">Payment Collection</h3>
          </div>

          <div className="p-4 rounded-xl glass border border-gold/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-foreground/60">Invoice Amount:</span>
              <span className="text-xl font-bold text-gradient-gold">
                ${invoiceAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
              <Select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              >
                <option value="CASH">Cash</option>
                <option value="DIRECT_DEBIT">Direct Debit</option>
                <option value="ONLINE_PAYMENT">Online Payment</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount Collected *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            {method === "CASH" && (
              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt Photo (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-sm"
                  />
                  {receiptFile && (
                    <span className="text-xs text-foreground/60">
                      {receiptFile.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full glow-gold-sm"
            >
              {isLoading ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


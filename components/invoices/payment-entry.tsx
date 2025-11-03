"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, DollarSign } from "lucide-react"
import type { PaymentMethod } from "@/types"

interface PaymentEntryProps {
  invoiceId: string
  invoiceAmount: number
  remainingAmount: number
  onPayment: (payment: {
    amount: number
    method: PaymentMethod
    transactionId?: string
    receiptUrl?: string
    notes?: string
  }) => Promise<void>
}

export function PaymentEntry({
  invoiceId,
  invoiceAmount,
  remainingAmount,
  onPayment,
}: PaymentEntryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState(remainingAmount.toString())
  const [method, setMethod] = useState<PaymentMethod>("CASH")
  const [transactionId, setTransactionId] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount) {
      alert("Invalid amount")
      return
    }

    setIsLoading(true)
    try {
      await onPayment({
        amount: parseFloat(amount),
        method,
        transactionId: transactionId || undefined,
        notes: notes || undefined,
      })
      setIsOpen(false)
      // Reset form
      setAmount(remainingAmount.toString())
      setMethod("CASH")
      setTransactionId("")
      setNotes("")
    } catch (error) {
      console.error("Payment error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="glow-gold-sm">
        <DollarSign className="mr-2 h-4 w-4" />
        Record Payment
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl glass border border-gold/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-foreground/60">Invoice Total:</span>
                <span className="font-semibold">${invoiceAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gold/20">
                <span className="text-sm text-foreground/60">Remaining:</span>
                <span className="text-lg font-bold text-gradient-gold">
                  ${remainingAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={remainingAmount}
              />
            </div>

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

            {(method === "ONLINE_PAYMENT" || method === "BANK_TRANSFER") && (
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Additional notes about this payment"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="glow-gold-sm">
                {isLoading ? "Processing..." : "Record Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


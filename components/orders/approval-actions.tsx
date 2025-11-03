"use client"

import { Button } from "@/components/ui/button"
import { Check, X, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface ApprovalActionsProps {
  orderId: string
  onApprove: (orderId: string) => Promise<void>
  onReject: (orderId: string, reason?: string) => Promise<void>
  onModify?: () => void
  isLoading?: boolean
}

export function ApprovalActions({
  orderId,
  onApprove,
  onReject,
  onModify,
  isLoading = false,
}: ApprovalActionsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const handleApprove = async () => {
    if (confirm("Are you sure you want to approve this order?")) {
      await onApprove(orderId)
    }
  }

  const handleReject = async () => {
    await onReject(orderId, rejectReason)
    setShowRejectDialog(false)
    setRejectReason("")
  }

  return (
    <div className="flex items-center gap-4">
      {onModify && (
        <Button
          variant="outline"
          onClick={onModify}
          disabled={isLoading}
          className="flex-1"
        >
          <Edit className="mr-2 h-4 w-4" />
          Modify Order
        </Button>
      )}
      <Button
        variant="outline"
        onClick={() => setShowRejectDialog(true)}
        disabled={isLoading}
        className="text-red-600 hover:text-red-700 hover:border-red-600"
      >
        <X className="mr-2 h-4 w-4" />
        Reject
      </Button>
      <Button
        onClick={handleApprove}
        disabled={isLoading}
        className="flex-1 glow-gold-sm"
      >
        <Check className="mr-2 h-4 w-4" />
        Approve Order
      </Button>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason (Optional)</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this order is being rejected..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isLoading}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


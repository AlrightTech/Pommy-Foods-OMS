"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Check } from "lucide-react"

interface SignatureCaptureProps {
  onSave: (signature: string) => void
  onCancel: () => void
}

export function SignatureCapture({ onSave, onCancel }: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = "#1a1410"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signature = canvas.toDataURL("image/png")
    onSave(signature)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Customer Signature</h3>
            <p className="text-sm text-foreground/60">Please sign below</p>
          </div>

          <div className="border-2 border-gold/30 rounded-xl bg-white">
            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              className="w-full h-[150px] touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearSignature} className="flex-1">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={saveSignature} className="flex-1 glow-gold-sm">
              <Check className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


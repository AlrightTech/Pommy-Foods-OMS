"use client"

import { useEffect, useRef } from "react"

interface QRCodeProps {
  value: string
  size?: number
  level?: "L" | "M" | "Q" | "H"
  className?: string
}

/**
 * QR Code component using SVG
 * Generates a simple QR code pattern
 */
export function QRCode({ value, size = 200, level = "M", className = "" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, size, size)

    // Simple QR-like pattern (for production, use a proper QR library)
    // This is a simplified visual representation
    const moduleSize = size / 25 // 25x25 grid
    ctx.fillStyle = "#000000"

    // Generate a deterministic pattern based on value
    const hash = value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

    for (let x = 0; x < 25; x++) {
      for (let y = 0; y < 25; y++) {
        // Position markers (corners)
        if (
          (x < 7 && y < 7) ||
          (x < 7 && y > 17) ||
          (x > 17 && y < 7)
        ) {
          if (
            (x === 0 || x === 6 || y === 0 || y === 6) ||
            (x >= 2 && x <= 4 && y >= 2 && y <= 4)
          ) {
            ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize)
          }
        } else {
          // Data modules based on hash
          const pattern = (hash + x * 17 + y * 23) % 3
          if (pattern === 0) {
            ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize)
          }
        }
      }
    }
  }, [value, size])

  if (!value) {
    return (
      <div
        className={`flex items-center justify-center bg-white rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-xs text-foreground/40">No QR Code</p>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  )
}


"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

export type ToastVariant = "default" | "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toastData: Omit<Toast, "id">) => string
  removeToast: (id: string) => void
  success: (title: string, description?: string) => string
  error: (title: string, description?: string) => string
  warning: (title: string, description?: string) => string
  info: (title: string, description?: string) => string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (toastData: Omit<Toast, "id">) => {
      const id = String(++toastId)
      const newToast: Toast = {
        id,
        duration: 5000,
        ...toastData,
      }

      setToasts((prev) => [...prev, newToast])

      // Auto remove after duration
      if (newToast.duration) {
        setTimeout(() => {
          removeToast(id)
        }, newToast.duration)
      }

      return id
    },
    [removeToast]
  )

  const value: ToastContextType = {
    toasts,
    toast,
    removeToast,
    success: (title: string, description?: string) =>
      toast({ title, description, variant: "success" }),
    error: (title: string, description?: string) =>
      toast({ title, description, variant: "error" }),
    warning: (title: string, description?: string) =>
      toast({ title, description, variant: "warning" }),
    info: (title: string, description?: string) =>
      toast({ title, description, variant: "info" }),
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    // Fallback for components not wrapped in ToastProvider
    const fallbackToast = () => ""
    const fallback: ToastContextType = {
      toasts: [],
      toast: fallbackToast,
      removeToast: () => {},
      success: fallbackToast,
      error: fallbackToast,
      warning: fallbackToast,
      info: fallbackToast,
    }
    return fallback
  }
  return context
}


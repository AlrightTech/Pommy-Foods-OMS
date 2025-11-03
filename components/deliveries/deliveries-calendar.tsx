"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"

interface Delivery {
  id: string
  orderNumber: string
  storeName: string
  scheduledDate: Date
  status: "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED"
}

interface DeliveriesCalendarProps {
  deliveries: Delivery[]
  onDateClick?: (date: Date) => void
}

export function DeliveriesCalendar({ deliveries, onDateClick }: DeliveriesCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getDeliveriesForDate = (date: Date) => {
    return deliveries.filter((delivery) =>
      isSameDay(new Date(delivery.scheduledDate), date)
    )
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold text-gradient-gold">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-foreground/60 p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const dayDeliveries = getDeliveriesForDate(day)
              const isCurrentDay = isToday(day)

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[80px] p-1 border rounded-lg cursor-pointer transition-all
                    ${isCurrentDay ? "border-gold bg-gold/10" : "border-gold/20"}
                    ${dayDeliveries.length > 0 ? "hover:border-gold/40" : ""}
                  `}
                  onClick={() => onDateClick?.(day)}
                >
                  <div className={`text-xs font-medium mb-1 ${isCurrentDay ? "text-gold font-bold" : ""}`}>
                    {format(day, "d")}
                  </div>
                  {dayDeliveries.length > 0 && (
                    <div className="space-y-1">
                      {dayDeliveries.slice(0, 2).map((delivery) => (
                        <div
                          key={delivery.id}
                          className="text-xs p-1 rounded bg-gold/20 text-foreground truncate"
                        >
                          {delivery.orderNumber}
                        </div>
                      ))}
                      {dayDeliveries.length > 2 && (
                        <div className="text-xs text-foreground/60">
                          +{dayDeliveries.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


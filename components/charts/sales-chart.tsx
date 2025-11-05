"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SalesDataPoint {
  date: string
  revenue: number
  orders: number
}

interface SalesChartProps {
  data?: SalesDataPoint[]
  loading?: boolean
}

export function SalesChart({ data, loading }: SalesChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate placeholder data for last 7 days
      const days = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        days.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: 0,
          orders: 0,
        })
      }
      return days
    }
    
    return data.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Number(item.revenue || 0),
      orders: Number(item.orders || 0),
    }))
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center text-foreground/60">
              <p>Loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Last 7 days performance</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#D2AC6A" 
              strokeWidth={2}
              name="Revenue ($)"
              dot={{ fill: "#D2AC6A", r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="orders" 
              stroke="#FAF4EC" 
              strokeWidth={2}
              name="Orders"
              dot={{ fill: "#FAF4EC", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


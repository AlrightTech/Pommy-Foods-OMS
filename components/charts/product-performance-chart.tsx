"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProductPerformanceData {
  productId: string
  productName: string
  sales: number
  quantity: number
  revenue: number
}

interface ProductPerformanceChartProps {
  data?: ProductPerformanceData[]
  loading?: boolean
}

export function ProductPerformanceChart({ data, loading }: ProductPerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data
      .slice(0, 10) // Top 10 products
      .map((item) => ({
        name: item.productName.length > 15 
          ? item.productName.substring(0, 15) + "..." 
          : item.productName,
        revenue: Number(item.revenue || 0),
        quantity: Number(item.quantity || 0),
      }))
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-foreground/60">
              <p>Loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
          <CardDescription>Top performing products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-foreground/60">
            <p>No product data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Performance</CardTitle>
        <CardDescription>Top performing products by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis 
              type="number"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              dataKey="name" 
              type="category"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              width={100}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="#D2AC6A" 
              name="Revenue ($)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


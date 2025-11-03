"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { useState } from "react"

interface SalesData {
  date: string
  sales: number
}

interface SalesChartProps {
  data: SalesData[]
  title?: string
  description?: string
}

export function SalesChart({ data, title = "Sales Trends", description }: SalesChartProps) {
  const [period, setPeriod] = useState("7d")

  // Simple bar chart representation (in production, use Recharts)
  const maxSales = Math.max(...data.map((d) => d.sales), 1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-[150px]">
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const height = (item.sales / maxSales) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-gold to-gold-dark transition-all hover:from-gold-dark hover:to-gold"
                  style={{ height: `${height}%`, minHeight: "4px" }}
                  title={`${item.date}: $${item.sales.toFixed(2)}`}
                />
                <span className="text-xs text-foreground/60 mt-2 rotate-45 origin-left">
                  {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-foreground/60">Total Sales</span>
          <span className="text-xl font-bold text-gradient-gold">
            ${data.reduce((sum, d) => sum + d.sales, 0).toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}


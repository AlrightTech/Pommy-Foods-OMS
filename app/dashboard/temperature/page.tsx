"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Search, Thermometer, AlertTriangle, CheckCircle2 } from "lucide-react"

// Mock temperature logs
const mockTemperatureLogs = [
  {
    id: "1",
    deliveryId: "DEL-001",
    storeName: "Convenience Store A",
    temperature: 5.2,
    location: "fridge",
    recordedAt: new Date("2024-01-15T10:30:00"),
    isManual: true,
    recordedBy: "John Driver",
    isCompliant: true,
  },
  {
    id: "2",
    deliveryId: "DEL-002",
    storeName: "Restaurant B",
    temperature: 8.5,
    location: "fridge",
    recordedAt: new Date("2024-01-15T09:15:00"),
    isManual: true,
    recordedBy: "Jane Driver",
    isCompliant: false,
  },
  {
    id: "3",
    deliveryId: "DEL-003",
    storeName: "Convenience Store C",
    temperature: 3.8,
    location: "freezer",
    recordedAt: new Date("2024-01-14T14:20:00"),
    isManual: false,
    recordedBy: "IoT Sensor",
    isCompliant: true,
  },
]

const tempRange = {
  fridge: { min: 2, max: 8 },
  freezer: { min: -18, max: -12 },
  ambient: { min: 15, max: 25 },
}

export default function TemperaturePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [complianceFilter, setComplianceFilter] = useState("all")

  const filteredLogs = mockTemperatureLogs.filter((log) => {
    const matchesSearch =
      log.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.deliveryId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === "all" || log.location === locationFilter
    const matchesCompliance =
      complianceFilter === "all" ||
      (complianceFilter === "compliant" && log.isCompliant) ||
      (complianceFilter === "non-compliant" && !log.isCompliant)
    return matchesSearch && matchesLocation && matchesCompliance
  })

  const checkCompliance = (temp: number, location: string) => {
    const range = tempRange[location as keyof typeof tempRange]
    if (!range) return true
    return temp >= range.min && temp <= range.max
  }

  const nonCompliantCount = mockTemperatureLogs.filter((log) => !log.isCompliant).length

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Temperature & Compliance</h1>
          <p className="text-foreground/60">Monitor temperature logs and compliance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Total Logs</p>
                  <p className="text-2xl font-bold text-foreground">{mockTemperatureLogs.length}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-600 glow-gold-sm">
                  <Thermometer className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Compliant</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockTemperatureLogs.filter((log) => log.isCompliant).length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center text-green-600 glow-gold-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Non-Compliant</p>
                  <p className="text-2xl font-bold text-red-600">{nonCompliantCount}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center text-red-600 glow-gold-sm">
                  <AlertTriangle className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Temperature Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Temperature Logs</CardTitle>
            <CardDescription>All temperature readings from deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-[180px]"
                >
                  <option value="all">All Locations</option>
                  <option value="fridge">Fridge</option>
                  <option value="freezer">Freezer</option>
                  <option value="ambient">Ambient</option>
                </Select>
                <Select
                  value={complianceFilter}
                  onChange={(e) => setComplianceFilter(e.target.value)}
                  className="w-[180px]"
                >
                  <option value="all">All Records</option>
                  <option value="compliant">Compliant</option>
                  <option value="non-compliant">Non-Compliant</option>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delivery ID</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-foreground/60">
                      No temperature logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const range = tempRange[log.location as keyof typeof tempRange]
                    const inRange = range
                      ? log.temperature >= range.min && log.temperature <= range.max
                      : true

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.deliveryId}</TableCell>
                        <TableCell>{log.storeName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-foreground/60" />
                            <span className="font-semibold">{log.temperature}°C</span>
                            {range && (
                              <span className="text-xs text-foreground/60">
                                ({range.min}°C - {range.max}°C)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {log.location}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground/60">
                          {log.recordedBy}
                          {!log.isManual && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              IoT
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground/60">
                          {log.recordedAt.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={inRange ? "success" : "destructive"}>
                            {inRange ? "Compliant" : "Out of Range"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Compliance Report */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Report</CardTitle>
            <CardDescription>Temperature compliance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-foreground/40">
              <div className="text-center">
                <Thermometer className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Temperature trend chart will be rendered here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Search, Thermometer, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { useTemperatureLogs } from "@/hooks/use-temperature"

const tempRange = {
  fridge: { min: 2, max: 8 },
  freezer: { min: -18, max: -12 },
  ambient: { min: 15, max: 25 },
}

export default function TemperaturePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [complianceFilter, setComplianceFilter] = useState("all")
  
  const filters = useMemo(() => {
    const f: any = {}
    if (locationFilter !== "all") f.location = locationFilter
    if (complianceFilter === "compliant") f.compliant = true
    if (complianceFilter === "non-compliant") f.compliant = false
    return f
  }, [locationFilter, complianceFilter])
  
  const { data: temperatureLogs, loading: logsLoading } = useTemperatureLogs(filters)

  const filteredLogs = useMemo(() => {
    if (!temperatureLogs) return []
    
    return temperatureLogs.filter((log: any) => {
      const storeName = log.store?.name || log.delivery?.store?.name || ""
      const deliveryId = log.deliveryId || ""
      const matchesSearch =
        storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deliveryId.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [temperatureLogs, searchTerm])

  const stats = useMemo(() => {
    if (!temperatureLogs) return { total: 0, compliant: 0, nonCompliant: 0 }
    
    return {
      total: temperatureLogs.length,
      compliant: temperatureLogs.filter((log: any) => log.isCompliant).length,
      nonCompliant: temperatureLogs.filter((log: any) => !log.isCompliant).length,
    }
  }, [temperatureLogs])

  const checkCompliance = (temp: number, location: string) => {
    const range = tempRange[location as keyof typeof tempRange]
    if (!range) return true
    return temp >= range.min && temp <= range.max
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Temperature & Compliance</h1>
          <p className="text-foreground/60">Monitor temperature logs and compliance</p>
        </div>

        {/* Stats */}
        {logsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="w-6 h-6 animate-spin text-gold" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/60 mb-1">Total Logs</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
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
                    <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
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
                    <p className="text-2xl font-bold text-red-600">{stats.nonCompliant}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center text-red-600 glow-gold-sm">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : (
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
                    filteredLogs.map((log: any) => {
                      const range = tempRange[log.location as keyof typeof tempRange]
                      const inRange = range
                        ? log.temperature >= range.min && log.temperature <= range.max
                        : true
                      const storeName = log.store?.name || log.delivery?.store?.name || "Unknown Store"
                      const recordedBy = log.recordedByUser?.name || log.recordedBy || "Unknown"

                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {log.deliveryId || "N/A"}
                          </TableCell>
                          <TableCell>{storeName}</TableCell>
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
                            {recordedBy}
                            {!log.isManual && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                IoT
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-foreground/60">
                            {new Date(log.recordedAt || log.createdAt).toLocaleString()}
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
            )}
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

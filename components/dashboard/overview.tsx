"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const demoData = [
  { name: "Mon", scans: 4, threats: 1 },
  { name: "Tue", scans: 7, threats: 2 },
  { name: "Wed", scans: 5, threats: 0 },
  { name: "Thu", scans: 6, threats: 1 },
  { name: "Fri", scans: 9, threats: 3 },
  { name: "Sat", scans: 3, threats: 0 },
  { name: "Sun", scans: 2, threats: 0 },
]

export function DashboardOverview() {
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsDetected: 0,
    safeScans: 0,
  })

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll use demo data
    const totalScans = demoData.reduce((acc, day) => acc + day.scans, 0)
    const threatsDetected = demoData.reduce((acc, day) => acc + day.threats, 0)

    setStats({
      totalScans,
      threatsDetected,
      safeScans: totalScans - threatsDetected,
    })
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalScans}</div>
          <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 10) + 1}% from last week</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.threatsDetected}</div>
          <p className="text-xs text-muted-foreground">
            {Math.random() > 0.5 ? "+" : "-"}
            {Math.floor(Math.random() * 10) + 1}% from last week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Safe Scans</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.safeScans}</div>
          <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 10) + 1}% from last week</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Just Now</div>
          <p className="text-xs text-muted-foreground">Last scan 2 minutes ago</p>
        </CardContent>
      </Card>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Number of scans and threats detected over the past week</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="scans" fill="#8884d8" name="Total Scans" />
              <Bar dataKey="threats" fill="#ff5252" name="Threats Detected" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}


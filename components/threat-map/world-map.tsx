"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe } from "lucide-react"

// Demo threat data
const threatData = [
  { id: 1, country: "United States", count: 15, lat: 37.0902, lng: -95.7129 },
  { id: 2, country: "Russia", count: 23, lat: 61.524, lng: 105.3188 },
  { id: 3, country: "China", count: 18, lat: 35.8617, lng: 104.1954 },
  { id: 4, country: "Brazil", count: 7, lat: -14.235, lng: -51.9253 },
  { id: 5, country: "Nigeria", count: 12, lat: 9.082, lng: 8.6753 },
]

export function WorldMap() {
  const [topThreats, setTopThreats] = useState(threatData)

  useEffect(() => {
    // Sort threats by count in descending order
    setTopThreats([...threatData].sort((a, b) => b.count - a.count))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Threat Geography
        </CardTitle>
        <CardDescription>Global distribution of detected threats</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center mb-4">
          <p className="text-muted-foreground text-sm">
            Map visualization would be rendered here using a library like react-simple-maps
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-sm">Top Threat Origins</h4>
          <div className="space-y-2">
            {topThreats.slice(0, 5).map((threat) => (
              <div key={threat.id} className="flex items-center justify-between">
                <span>{threat.country}</span>
                <Badge variant={threat.count > 15 ? "destructive" : "secondary"}>{threat.count} threats</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


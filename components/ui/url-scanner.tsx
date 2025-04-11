"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Loader2, Calendar, Globe, AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ScanResult {
  isSafe: boolean
  positives: number
  total: number
  scanId: string
  scanDate: string
  url: string
  verbose_msg: string
  threatLevel: "High" | "Low" | "Safe"
  permalink: string
  scans: Record<string, { detected: boolean; result: string }>
}

export default function UrlScanner() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to scan URL")
    }
    setLoading(false)
  }

  const getThreatColor = (threatLevel: string) => {
    switch (threatLevel) {
      case "High":
        return "bg-red-500"
      case "Low":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-md bg-background/30">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter URL to scan... (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              {loading ? "Scanning..." : "Scan URL"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Scan Results</CardTitle>
                  <Badge
                    variant={result.threatLevel === "Safe" ? "default" : "destructive"}
                    className="text-md px-4 py-1"
                  >
                    {result.threatLevel} Threat
                  </Badge>
                </div>
                <CardDescription>Detailed analysis of the scanned URL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* URL and Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span className="font-mono">{result.url}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Scanned on {formatDate(result.scanDate)}</span>
                  </div>
                </div>

                {/* Threat Score */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Threat Score</span>
                    <span className="font-medium">
                      {result.positives}/{result.total}
                    </span>
                  </div>
                  <Progress
                    value={(result.positives / result.total) * 100}
                    className={`h-2 ${getThreatColor(result.threatLevel)}`}
                  />
                </div>

                {/* Detailed Analysis */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Security Vendor Analysis</h3>
                  <div className="grid gap-2">
                    {Object.entries(result.scans || {})
                      .slice(0, 5)
                      .map(([vendor, scan]) => (
                        <div key={vendor} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                          <span className="font-medium">{vendor}</span>
                          <Badge variant={scan.detected ? "destructive" : "default"}>
                            {scan.detected ? scan.result || "Malicious" : "Clean"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button variant="outline" asChild>
                    <a href={result.permalink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Report
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


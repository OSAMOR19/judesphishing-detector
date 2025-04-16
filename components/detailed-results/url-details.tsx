"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Calendar, Globe, Shield, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ScanResult {
  status: string
  positives: number
  total: number
  scan_date: string
  threat_level: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"
  recommendations: Array<{
    severity: "critical" | "warning" | "info" | "success"
    message: string
    action: string
  }>
}

interface UrlDetailsProps {
  url: string
  scanResult: ScanResult
}

export function UrlDetails({ url, scanResult }: UrlDetailsProps) {
  const [domainInfo, setDomainInfo] = useState({
    domainAge: "2 years, 3 months",
    ssl: true,
    redirects: false,
    reputationScore: 85,
    registrar: "GoDaddy.com, LLC",
    ipAddress: "192.168.1.1",
    country: "United States",
    lastUpdated: "2024-12-15",
  })

  // In a real app, you would fetch this data from your API
  useEffect(() => {
    // Simulate API call
    console.log("Fetching domain info for:", url)
  }, [url])

  const getReputationColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "text-red-500"
      case "MEDIUM":
        return "text-yellow-500"
      case "UNKNOWN":
        return "text-blue-500"
      default:
        return "text-green-500"
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Information
          </CardTitle>
          <CardDescription>Technical details about this domain</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Domain Age</p>
              <p className="font-medium">{domainInfo.domainAge}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">SSL Certificate</p>
              <Badge variant={domainInfo.ssl ? "default" : "destructive"}>
                {domainInfo.ssl ? "Valid" : "Invalid/Missing"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Redirects</p>
              <Badge variant={domainInfo.redirects ? "destructive" : "outline"}>
                {domainInfo.redirects ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Registrar</p>
              <p className="font-medium">{domainInfo.registrar}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-muted-foreground">Reputation Score</p>
              <p className="text-sm font-medium">{domainInfo.reputationScore}/100</p>
            </div>
            <Progress value={domainInfo.reputationScore} className={getReputationColor(domainInfo.reputationScore)} />
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="h-4 w-4" />
              Visit Website
            </Button>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(domainInfo.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Threat Analysis
          </CardTitle>
          <CardDescription>Security assessment details</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${getThreatLevelColor(scanResult.threat_level)}`} />
                  <span>Scan Results</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>Scan Date: {new Date(scanResult.scan_date).toLocaleString()}</p>
                  <p>Detections: {scanResult.positives} out of {scanResult.total} security vendors</p>
                  <Badge variant={scanResult.threat_level === "HIGH" ? "destructive" : "default"}>
                    {scanResult.threat_level} Risk
                  </Badge>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Recommendations</h4>
            <ul className="space-y-2 text-sm">
              {scanResult.threat_level && (
                <>
                  {scanResult.threat_level === "HIGH" && (
                    <>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500" />
                        <span className="text-red-500 font-medium">WARNING: This URL has been flagged as malicious!</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500" />
                        Do not visit this URL. It may contain malware or be a phishing site.
                      </li>
                    </>
                  )}
                  {scanResult.threat_level === "MEDIUM" && (
                    <>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500" />
                        <span className="text-yellow-500 font-medium">CAUTION: This URL shows suspicious activity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500" />
                        Exercise caution. Consider using additional security measures if you need to visit this site.
                      </li>
                    </>
                  )}
                  {scanResult.threat_level === "UNKNOWN" && (
                    <>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 text-blue-500" />
                        <span className="text-blue-500 font-medium">This URL hasn't been thoroughly analyzed yet</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 text-blue-500" />
                        Proceed with caution. The site's safety cannot be fully determined.
                      </li>
                    </>
                  )}
                  {scanResult.threat_level === "LOW" && (
                    <>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 text-green-500" />
                        This URL appears to be safe based on our analysis
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 text-green-500" />
                        Always verify the sender before clicking links in emails
                      </li>
                    </>
                  )}
                </>
              )}
              {scanResult.recommendations?.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  {rec.severity === "critical" && <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500" />}
                  {rec.severity === "warning" && <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500" />}
                  {rec.severity === "info" && <Shield className="h-4 w-4 mt-0.5 text-blue-500" />}
                  {rec.severity === "success" && <Shield className="h-4 w-4 mt-0.5 text-green-500" />}
                  <span>{rec.message}</span>
                </li>
              ))}
              {!scanResult.threat_level && !scanResult.recommendations?.length && (
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 text-gray-500" />
                  <span>No specific recommendations available for this URL.</span>
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Calendar, Globe, Shield, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ScanResult {
  status: "success" | "unknown" | "error"
  isMalicious?: boolean
  positives?: number
  total?: number
  scan_date?: string
  message?: string
  location?: string
  country?: string
  ipAddress?: string
  emailBody?: string
  threat_level?: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"
  recommendations?: Array<{
    severity: "critical" | "warning" | "info" | "success"
    message: string
    action: string
  }>
  // Domain information properties
  domain_age?: string
  has_ssl?: boolean
  redirects?: boolean
  registrar?: string
  creation_date?: string
  expiration_date?: string
  is_private?: boolean
  is_proxy?: boolean
  name_servers?: Array<string>
  domain_status?: Array<string>
  // PDF-specific properties
  urls?: Array<string>
  isPdf?: boolean
}

interface UrlDetailsProps {
  url: string
  scanResult: ScanResult
}

export function UrlDetails({ url, scanResult }: UrlDetailsProps) {
  // Use the actual data from the API response
  const domainInfo = {
    domainAge: scanResult.domain_age || "Unknown",
    ssl: scanResult.has_ssl || false,
    redirects: scanResult.redirects || false,
    reputationScore: calculateReputationScore(scanResult),
    registrar: scanResult.registrar || "Unknown",
    ipAddress: scanResult.ipAddress || "Unknown",
    country: scanResult.country || "Unknown",
    lastUpdated: scanResult.creation_date || "Unknown",
    isPrivate: scanResult.is_private || false,
    isProxy: scanResult.is_proxy || false,
    nameServers: scanResult.name_servers || [],
    domainStatus: scanResult.domain_status || [],
  }

  // Calculate reputation score based on various factors
  function calculateReputationScore(result: ScanResult) {
    let score = 100;
    
    // Base score on threat level
    if (result.threat_level === "HIGH") {
      score = 20; // Very low score for high threat
    } else if (result.threat_level === "MEDIUM") {
      score = 50; // Medium score for medium threat
    } else if (result.threat_level === "UNKNOWN") {
      score = 60; // Lower score for unknown
    } else if (result.threat_level === "LOW") {
      score = 90; // High score for low threat
    }
    
    // Adjust score based on domain characteristics
    if (result.is_private) score -= 15; // Privacy protection is suspicious
    if (result.is_proxy) score -= 20; // Proxy is very suspicious
    if (result.redirects) score -= 15; // Redirects are suspicious
    if (!result.has_ssl) score -= 25; // No SSL is very bad
    
    // Adjust based on domain age (newer domains are riskier)
    const domainAge = result.domain_age || "Unknown";
    if (domainAge === "Unknown") {
      score -= 20; // Unknown age is suspicious
    } else if (domainAge.includes("month")) {
      const months = parseInt(domainAge.split(" ")[0]);
      if (months < 3) score -= 25; // Very new domains are risky
      else if (months < 6) score -= 15;
      else if (months < 12) score -= 10;
    } else if (domainAge.includes("year")) {
      const years = parseInt(domainAge.split(" ")[0]);
      if (years < 1) score -= 10;
      else if (years > 5) score += 10; // Bonus for older domains
    }
    
    // Adjust based on VirusTotal results
    if (result.positives !== undefined && result.total !== undefined && result.total > 0) {
      const positivePercentage = (result.positives / result.total) * 100;
      if (positivePercentage > 50) score = 10; // Very bad if majority detect it
      else if (positivePercentage > 25) score = Math.min(score, 30); // Bad if 25%+ detect it
      else if (positivePercentage > 10) score = Math.min(score, 50); // Suspicious if 10%+ detect it
      else if (positivePercentage > 0) score = Math.min(score, 70); // Somewhat suspicious if any detect it
    }
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

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
            {scanResult.isPdf ? "PDF Information" : "Domain Information"}
          </CardTitle>
          <CardDescription>
            {scanResult.isPdf ? "Technical details about this PDF" : "Technical details about this domain"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {scanResult.isPdf ? (
            // PDF-specific information
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">File Type</p>
                  <p className="font-medium">PDF Document</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Detections</p>
                  <Badge variant={scanResult.positives && scanResult.positives > 0 ? "destructive" : "default"}>
                    {scanResult.positives} / {scanResult.total} scanners
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">URLs Found</p>
                  <Badge variant={scanResult.urls && scanResult.urls.length > 0 ? "default" : "outline"}>
                    {scanResult.urls ? scanResult.urls.length : 0} URLs
                  </Badge>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-muted-foreground">Reputation Score</p>
                  <p className="text-sm font-medium">{domainInfo.reputationScore}/100</p>
                </div>
                <Progress value={domainInfo.reputationScore} className={getReputationColor(domainInfo.reputationScore)} />
              </div>

              {scanResult.urls && scanResult.urls.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-muted-foreground mb-1">URLs Found in PDF</p>
                  <div className="max-h-32 overflow-y-auto bg-muted p-2 rounded-md">
                    <ul className="text-xs space-y-1">
                      {scanResult.urls.map((url, index) => (
                        <li key={index} className="truncate">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Domain-specific information
            <>
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
            </>
          )}

          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="h-4 w-4" />
              {scanResult.isPdf ? "Download PDF" : "Visit Website"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Last updated: {domainInfo.lastUpdated !== "Unknown" ? new Date(domainInfo.lastUpdated).toLocaleDateString() : "Unknown"}
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
                  <AlertTriangle className={`h-4 w-4 ${getThreatLevelColor(scanResult.threat_level || "UNKNOWN")}`} />
                  <span>Scan Results</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>Scan Date: {scanResult.scan_date ? new Date(scanResult.scan_date).toLocaleString() : "Unknown"}</p>
                  <p>Detections: {scanResult.positives} out of {scanResult.total} security vendors</p>
                  <Badge variant={scanResult.threat_level === "HIGH" ? "destructive" : "default"}>
                    {scanResult.threat_level || "UNKNOWN"} Risk
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


"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Calendar, Globe, Shield, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface UrlDetailsProps {
  url: string
  scanResult: any
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
              <Badge variant={domainInfo.ssl ? "success" : "destructive"}>
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
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Phishing Indicators</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Badge variant="outline">Medium Risk</Badge>
                    Domain age less than 3 years
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline">Low Risk</Badge>
                    Similar to known brand names
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Historical Data</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>This domain has been scanned 3 times previously:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>2025-01-15: No threats detected</li>
                    <li>2024-12-10: No threats detected</li>
                    <li>2024-11-22: No threats detected</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Recommendations</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-green-500" />
                This URL appears to be safe based on our analysis
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-green-500" />
                Always verify the sender before clicking links in emails
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


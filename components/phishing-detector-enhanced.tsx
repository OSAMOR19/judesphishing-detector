"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Loader2,
  Sun,
  Moon,
  Mail,
  File,
  Link,
  BarChart3,
  History,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardOverview } from "./dashboard/overview"
import { ScanHistoryTable } from "./scan-history/history-table"
import { UrlDetails } from "./detailed-results/url-details"
import { WorldMap } from "./threat-map/world-map"
import { ReportButton } from "./report-generator/report-button"

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
  urls?: string[]
  isPdf?: boolean
}

export default function PhishingDetectorEnhanced() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [activeTab, setActiveTab] = useState("url")
  const [activeSection, setActiveSection] = useState("scanner")

  const [file, setFile] = useState<File | null>(null);

  const checkInput = async () => {
    if (activeTab === "pdf" && !file) {
      toast.error("Please select a PDF file to scan");
      return;
    }
    if (activeTab !== "pdf" && !input) {
      toast.error("Please enter a value to scan");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        activeTab === "url" 
          ? "/api/check-url" 
          : activeTab === "email" 
            ? "/api/check-email" 
            : "/api/check-pdf";
        
        let body;
        let headers = {};
        
        if (activeTab === "pdf") {
          const formData = new FormData();
          formData.append("file", file!);
          body = formData;
          // No Content-Type header for FormData - browser sets it automatically with boundary
        } else {
          body = JSON.stringify({ input });
          headers = { "Content-Type": "application/json" };
        }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: activeTab === "pdf" ? undefined : headers,
        body,
      });

      if (!response.ok) {
        let errorMessage = "Server error occurred";
        try {
          const errorText = await response.text();
          if (errorText.includes('<!DOCTYPE')) {
            errorMessage = 'Server error occurred';
          } else {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorText;
            } catch {
              errorMessage = errorText;
            }
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to scan input")
      }

      // Transform the data to match our ScanResult interface
      const transformedData: ScanResult = {
        status: data.status,
        isMalicious: data.positives > 0,
        positives: data.positives,
        total: data.total,
        scan_date: data.scan_date,
        threat_level: data.threat_level,
        recommendations: data.recommendations,
        location: data.location,
        country: data.country,
        ipAddress: data.ipAddress,
        message: data.message,
        // Include URLs found in PDF if available
        urls: data.urls || [],
        // Set isPdf flag for PDF scans
        isPdf: activeTab === "pdf",
      }

      setResult(transformedData)

      if (data.status === "success") {
        toast.success("Scan completed")
      } else if (data.status === "unknown") {
        toast.info("Input not found in database")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to scan input")
      setResult({
        status: "error",
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    }
    setLoading(false)
  }

  const getResultIcon = () => {
    if (result?.status === "unknown") {
      return <ShieldQuestion className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
    }
    if (result?.status === "error") {
      return <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
    }
    return result?.isMalicious ? (
      <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
    ) : (
      <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
    )
  }

  const getResultColor = () => {
    if (result?.status === "unknown") return "border-yellow-500/50 dark:border-yellow-500/30"
    if (result?.status === "error") return "border-red-500/50 dark:border-red-500/30"
    return result?.isMalicious
      ? "border-red-500/50 dark:border-red-500/30"
      : "border-green-500/50 dark:border-green-500/30"
  }

  return (
    <div className={cn("min-h-screen w-full transition-colors", isDark ? "dark bg-gray-900" : "bg-gray-50")}>
      <div className="container max-w-6xl mx-auto p-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">OdaneGuard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={activeSection === "scanner" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection("scanner")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Scanner
            </Button>
            <Button
              variant={activeSection === "dashboard" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection("dashboard")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeSection === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection("history")}
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {activeSection === "scanner" && (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="url">
                  <Link className="w-4 h-4 mr-2" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="pdf">
                  <File className="w-4 h-4 mr-2" />
                  PDF
                </TabsTrigger>
              </TabsList>
              <TabsContent value="url">
                <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>URL Security Scanner</CardTitle>
                    <CardDescription>Enter a URL to check if it&apos;s potentially malicious</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter URL to scan..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="backdrop-blur-sm bg-white/50 dark:bg-gray-700/50"
                        onKeyDown={(e) => e.key === "Enter" && checkInput()}
                      />
                      <Button onClick={checkInput} disabled={loading || !input}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Scan"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="email">
                <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Email Security Scanner</CardTitle>
                    <CardDescription>Enter an email to check if it&apos;s potentially malicious</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter email to scan..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="backdrop-blur-sm bg-white/50 dark:bg-gray-700/50"
                        onKeyDown={(e) => e.key === "Enter" && checkInput()}
                      />
                      <Button onClick={checkInput} disabled={loading || !input}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Scan"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="pdf">
                <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>PDF Security Scanner</CardTitle>
                    <CardDescription>Upload a PDF to check if it&apos;s potentially malicious</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFile(e.target.files[0]);
                            setInput(e.target.files[0].name);
                          }
                        }}
                        className="backdrop-blur-sm bg-white/50 dark:bg-gray-700/50"
                      />
                      <Button onClick={checkInput} disabled={loading || !file}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Scan"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6"
                >
                  <Card className={cn("border-2", getResultColor())}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "p-4 rounded-full",
                            result.status === "unknown"
                              ? "bg-yellow-100 dark:bg-yellow-900/30"
                              : result.status === "error"
                                ? "bg-red-100 dark:bg-red-900/30"
                                : result.isMalicious
                                  ? "bg-red-100 dark:bg-red-900/30"
                                  : "bg-green-100 dark:bg-green-900/30",
                          )}
                        >
                          {getResultIcon()}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">
                            {result.status === "unknown"
                              ? "Input Not Found in Database"
                              : result.status === "error"
                                ? "Error Scanning Input"
                                : result.isMalicious
                                  ? "Potential Threat Detected"
                                  : "Input Appears Safe"}
                          </h3>
                          <div className="flex gap-2 flex-wrap">
                            {result.status === "success" && (
                              <>
                                <Badge variant={result.isMalicious ? "destructive" : "default"}>
                                  {result.positives} / {result.total} scanners
                                </Badge>
                                <Badge variant={result.isMalicious ? "destructive" : "default"}>
                                  {result.isMalicious ? "Malicious" : "Safe"}
                                </Badge>
                              </>
                            )}
                            {result.message && <Badge variant="secondary">{result.message}</Badge>}
                          </div>
                        </div>
                        <div className="ml-auto">
                          <ReportButton scanData={result} scanType={activeTab as "url" | "email" | "pdf"} />
                        </div>
                      </div>

                      {/* Detailed results section */}
                      {result.status === "success" && activeTab === "url" && (
                        <div className="mt-6">
                          <UrlDetails url={input} scanResult={result} />
                        </div>
                      )}

                      {/* Basic info for other scan types */}
                      {(activeTab !== "url" || result.status !== "success") && (
                        <div className="mt-4">
                          {result.location && (
                            <p className="mt-4">
                              <strong>Location:</strong> {result.location}
                            </p>
                          )}
                          {result.country && (
                            <p className="mt-2">
                              <strong>Country:</strong> {result.country}
                            </p>
                          )}
                          {result.ipAddress && (
                            <p className="mt-2">
                              <strong>IP Address:</strong> {result.ipAddress}
                            </p>
                          )}
                          {result.emailBody && (
                            <p className="mt-2">
                              <strong>Email Body:</strong> {result.emailBody}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {activeSection === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <DashboardOverview />
            <div className="grid md:grid-cols-2 gap-6">
              <WorldMap />
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your most recent scans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demoHistory.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            item.result === "malicious"
                              ? "bg-red-100 dark:bg-red-900/30"
                              : "bg-green-100 dark:bg-green-900/30",
                          )}
                        >
                          {item.result === "malicious" ? (
                            <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.input}</p>
                          <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleString()}</p>
                        </div>
                        <Badge className="ml-auto" variant={item.result === "malicious" ? "destructive" : "default"}>
                          {item.result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeSection === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Scan History</h2>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export History
              </Button>
            </div>
            <ScanHistoryTable />
          </div>
        )}
      </div>
    </div>
  )
}

// Demo history data for the dashboard
const demoHistory = [
  {
    id: "1",
    input: "https://suspicious-site.com",
    type: "url",
    result: "malicious",
    date: "2025-02-26T14:30:00",
    details: "Phishing attempt detected",
  },
  {
    id: "2",
    input: "user@example.com",
    type: "email",
    result: "safe",
    date: "2025-02-26T12:15:00",
    details: "No threats detected",
  },
  {
    id: "3",
    input: "document.pdf",
    type: "pdf",
    result: "malicious",
    date: "2025-02-25T18:45:00",
    details: "Malware detected in attachment",
  },
]


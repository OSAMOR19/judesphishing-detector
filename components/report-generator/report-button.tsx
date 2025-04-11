"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ReportButtonProps {
  scanData: any
  scanType: "url" | "email" | "pdf"
}

export function ReportButton({ scanData, scanType }: ReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateReport = async () => {
    setIsGenerating(true)

    try {
      // In a real app, you would call an API to generate the report
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate a successful report generation
      toast.success("Report generated successfully")

      // In a real app, you would trigger a download here
      // For now, we'll just log to console
      console.log(`Generating report for ${scanType} scan:`, scanData)
    } catch (error) {
      toast.error("Failed to generate report")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={generateReport} disabled={isGenerating} className="gap-2">
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Report
        </>
      )}
    </Button>
  )
}


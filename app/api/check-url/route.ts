import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { input } = await request.json()

    if (!input) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 })
    }

    // Get VirusTotal API key from environment variables
    const apiKey = process.env.VIRUSTOTAL_API_KEY
    
    if (!apiKey) {
      console.error("VirusTotal API key not found")
      return NextResponse.json({ message: "API configuration error" }, { status: 500 })
    }

    console.log(`Checking URL: ${input}`)

    // Prepare URL for VirusTotal API
    const encodedUrl = encodeURIComponent(input)
    
    // First, check if the URL has already been analyzed
    const reportResponse = await fetch(
      `https://www.virustotal.com/api/v3/urls/${encodedUrl}/analyse`,
      {
        method: "GET",
        headers: {
          "x-apikey": apiKey,
          "Content-Type": "application/json",
        },
      }
    )

    let result
    let analysisId

    // If the URL hasn't been analyzed before or we need fresh results
    if (!reportResponse.ok || reportResponse.status === 404) {
      // Submit URL for scanning
      const scanResponse = await fetch(
        "https://www.virustotal.com/api/v3/urls",
        {
          method: "POST",
          headers: {
            "x-apikey": apiKey,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `url=${encodedUrl}`,
        }
      )

      if (!scanResponse.ok) {
        throw new Error(`VirusTotal scan failed: ${scanResponse.statusText}`)
      }

      const scanData = await scanResponse.json()
      analysisId = scanData.data.id

      // Wait for analysis to complete (this might take some time)
      // In a production app, you might want to implement a webhook or polling mechanism
      await new Promise(resolve => setTimeout(resolve, 5000))

      // Get the analysis results
      const analysisResponse = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          method: "GET",
          headers: {
            "x-apikey": apiKey,
            "Content-Type": "application/json",
          },
        }
      )

      if (!analysisResponse.ok) {
        throw new Error(`VirusTotal analysis failed: ${analysisResponse.statusText}`)
      }

      result = await analysisResponse.json()
    } else {
      result = await reportResponse.json()
    }

    // Extract relevant information from the VirusTotal response
    const stats = result.data.attributes.stats
    const scanDate = result.data.attributes.date
    
    // Get domain information
    const domainInfo = await getDomainInfo(input)

    return NextResponse.json({
      status: "success",
      positives: stats.malicious,
      total: stats.malicious + stats.suspicious + stats.harmless + stats.undetected,
      scan_date: new Date(scanDate * 1000).toISOString(),
      url: input,
      ...domainInfo,
    })
  } catch (error) {
    console.error("Error checking URL:", error)
    return NextResponse.json({ message: "Failed to check URL", error: String(error) }, { status: 500 })
  }
}

// Mock function to get domain information
async function getDomainInfo(url: string) {
  // In a real app, you would use a WHOIS API or similar
  // For now, we'll return mock data
  return {
    domain_age: "2 years, 3 months",
    registrar: "GoDaddy.com, LLC",
    creation_date: "2022-11-15",
    expiration_date: "2025-11-15",
    location: "United States",
    country: "US",
    ipAddress: "192.168.1.1",
    has_ssl: true,
    redirects: false,
  }
}

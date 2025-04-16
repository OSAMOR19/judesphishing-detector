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
      `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
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
        console.error("VirusTotal scan failed:", await scanResponse.text())
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
        console.error("VirusTotal analysis failed:", await analysisResponse.text())
        throw new Error(`VirusTotal analysis failed: ${analysisResponse.statusText}`)
      }

      result = await analysisResponse.json()
    } else {
      result = await reportResponse.json()
    }

    // Extract relevant information from the VirusTotal response
    const stats = result.data.attributes.stats
    const scanDate = result.data.attributes.date
    
    // Calculate threat level and generate recommendations
    const threatLevel = calculateThreatLevel(stats)
    const recommendations = generateRecommendations(stats, threatLevel)
    
    // Get domain information
    const domainInfo = await getDomainInfo(input)

    return NextResponse.json({
      status: "success",
      positives: stats.malicious,
      total: stats.malicious + stats.suspicious + stats.harmless + stats.undetected,
      scan_date: new Date(scanDate * 1000).toISOString(),
      url: input,
      threat_level: threatLevel,
      recommendations: recommendations,
      ...domainInfo,
    })
  } catch (error) {
    console.error("Error checking URL:", error)
    return NextResponse.json({ message: "Failed to check URL", error: String(error) }, { status: 500 })
  }
}

// Calculate threat level based on VirusTotal stats
function calculateThreatLevel(stats: any) {
  const totalScans = stats.malicious + stats.suspicious + stats.harmless + stats.undetected
  const maliciousPercentage = (stats.malicious / totalScans) * 100
  const suspiciousPercentage = (stats.suspicious / totalScans) * 100

  if (stats.malicious > 5 || maliciousPercentage > 20) {
    return "HIGH"
  } else if (stats.malicious > 0 || stats.suspicious > 3 || suspiciousPercentage > 10) {
    return "MEDIUM"
  } else if (stats.undetected > totalScans * 0.5) {
    return "UNKNOWN"
  } else {
    return "LOW"
  }
}

// Generate recommendations based on threat level and stats
function generateRecommendations(stats: any, threatLevel: string) {
  const recommendations = []

  if (threatLevel === "HIGH") {
    recommendations.push({
      severity: "critical",
      message: "This URL has been flagged as malicious by multiple security vendors.",
      action: "Do not visit this URL. It may contain malware or be a phishing site."
    })
  } else if (threatLevel === "MEDIUM") {
    recommendations.push({
      severity: "warning",
      message: "This URL shows suspicious activity.",
      action: "Exercise caution. Consider using additional security measures if you need to visit this site."
    })
  } else if (threatLevel === "UNKNOWN") {
    recommendations.push({
      severity: "info",
      message: "This URL hasn't been thoroughly analyzed yet.",
      action: "Proceed with caution. The site's safety cannot be fully determined."
    })
  } else {
    recommendations.push({
      severity: "success",
      message: "This URL appears to be safe based on current analysis.",
      action: "You can proceed, but always maintain good security practices."
    })
  }

  // Add additional context based on specific stats
  if (stats.suspicious > 0) {
    recommendations.push({
      severity: "warning",
      message: `${stats.suspicious} security vendors flagged this URL as suspicious.`,
      action: "Review the detailed scan results before proceeding."
    })
  }

  if (stats.undetected > stats.total * 0.3) {
    recommendations.push({
      severity: "info",
      message: "Many security vendors haven't analyzed this URL yet.",
      action: "Consider waiting for more comprehensive analysis."
    })
  }

  return recommendations
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

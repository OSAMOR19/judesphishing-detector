import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { analysis_id, url } = await request.json()

    if (!analysis_id || !url) {
      return NextResponse.json({ 
        message: "Analysis ID and URL are required" 
      }, { status: 400 })
    }

    // Get VirusTotal API key from environment variables
    const apiKey = process.env.VIRUSTOTAL_API_KEY
    
    if (!apiKey) {
      console.error("VirusTotal API key not found in environment variables")
      return NextResponse.json({ 
        message: "API configuration error", 
        details: "VirusTotal API key is not configured. Please check your environment variables.",
        error: "MISSING_API_KEY"
      }, { status: 500 })
    }

    // Get the analysis results
    const analysisResponse = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${analysis_id}`,
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

    const result = await analysisResponse.json()
    
    // Check if analysis is still in progress
    if (result.data.attributes.status === "in-progress") {
      return NextResponse.json({
        status: "pending",
        message: "Analysis still in progress",
        analysis_id,
        url
      })
    }

    // Extract relevant information from the VirusTotal response
    const stats = result.data.attributes.stats
    const scanDate = result.data.attributes.date
    
    // Calculate threat level and generate recommendations
    const threatLevel = calculateThreatLevel(stats)
    const recommendations = generateRecommendations(stats, threatLevel)
    
    // Get domain information using WHOIS API
    const domainInfo = await getDomainInfo(url)

    return NextResponse.json({
      status: "success",
      positives: stats.malicious,
      total: stats.malicious + stats.suspicious + stats.harmless + stats.undetected,
      scan_date: new Date(scanDate * 1000).toISOString(),
      url: url,
      threat_level: threatLevel,
      recommendations: recommendations,
      ...domainInfo,
    })
  } catch (error) {
    console.error("Error checking analysis:", error)
    return NextResponse.json({ 
      message: "Failed to check analysis", 
      error: String(error),
      details: "An error occurred while checking the analysis. Please try again later."
    }, { status: 500 })
  }
}

// Calculate threat level based on VirusTotal stats
function calculateThreatLevel(stats: any) {
  const totalScans = stats.malicious + stats.suspicious + stats.harmless + stats.undetected
  const maliciousPercentage = (stats.malicious / totalScans) * 100
  const suspiciousPercentage = (stats.suspicious / totalScans) * 100

  console.log('Threat calculation:', {
    stats,
    totalScans,
    maliciousPercentage,
    suspiciousPercentage
  })

  // More sensitive thresholds for malicious detections
  if (stats.malicious >= 2 || maliciousPercentage >= 2) {
    return "HIGH"
  } else if (stats.malicious > 0 || stats.suspicious > 2 || suspiciousPercentage > 5) {
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

// Get domain information using WHOIS API
async function getDomainInfo(url: string) {
  try {
    // Extract domain from URL
    const domain = new URL(url).hostname;
    
    // Get the base URL for API calls
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Call our WHOIS API endpoint
    const response = await fetch(`${baseUrl}/api/whois`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch WHOIS data');
    }

    const whoisData = await response.json();
    
    // Calculate domain age
    let domainAge = 'Unknown';
    if (whoisData.creationDate !== 'Unknown') {
      const creationDate = new Date(whoisData.creationDate);
      const now = new Date();
      const ageInYears = now.getFullYear() - creationDate.getFullYear();
      const ageInMonths = now.getMonth() - creationDate.getMonth();
      const totalMonths = ageInYears * 12 + ageInMonths;
      
      if (totalMonths < 12) {
        domainAge = `${totalMonths} months`;
      } else {
        const years = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;
        domainAge = `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
      }
    }

    // Check for redirects by examining name servers
    const hasRedirects = whoisData.nameServers.some((ns: string) => 
      ns.toLowerCase().includes('redirect') || 
      ns.toLowerCase().includes('forward')
    );

    return {
      domain_age: domainAge,
      registrar: whoisData.registrarName,
      creation_date: whoisData.creationDate,
      expiration_date: whoisData.expirationDate,
      location: whoisData.registrant.country,
      country: whoisData.registrant.countryCode,
      ipAddress: whoisData.nameServers[0] || 'Unknown',
      has_ssl: whoisData.hasSSL,
      redirects: hasRedirects,
      is_private: whoisData.isPrivate,
      is_proxy: whoisData.isProxy,
      name_servers: whoisData.nameServers,
      domain_status: whoisData.status,
    };
  } catch (error) {
    console.error('Error fetching domain info:', error);
    // Return default domain info if WHOIS lookup fails
    return {
      domain_age: 'Unknown',
      registrar: 'Unknown',
      creation_date: 'Unknown',
      expiration_date: 'Unknown',
      location: 'Unknown',
      country: 'Unknown',
      ipAddress: 'Unknown',
      has_ssl: false,
      redirects: false,
      is_private: false,
      is_proxy: false,
      name_servers: [],
      domain_status: [],
    };
  }
} 
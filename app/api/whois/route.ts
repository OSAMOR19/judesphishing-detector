import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { domain } = await request.json()

    if (!domain) {
      return NextResponse.json({ message: "Domain is required" }, { status: 400 })
    }

    // Get WHOIS XML API key from environment variables
    const apiKey = process.env.WHOISXML_API_KEY
    
    if (!apiKey) {
      console.error("WHOIS XML API key not found")
      return NextResponse.json({ message: "API configuration error" }, { status: 500 })
    }

    // Make request to WHOIS XML API
    const response = await fetch(
      `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      console.error("WHOIS lookup failed:", await response.text())
      throw new Error(`WHOIS lookup failed: ${response.statusText}`)
    }

    const data = await response.json()

    // Extract relevant information from the WHOIS response
    const whoisData = {
      registrarName: data.WhoisRecord?.registrarName || "Unknown",
      creationDate: data.WhoisRecord?.createdDate || "Unknown",
      expirationDate: data.WhoisRecord?.expiresDate || "Unknown",
      updatedDate: data.WhoisRecord?.updatedDate || "Unknown",
      nameServers: data.WhoisRecord?.nameServers?.hostNames || [],
      status: data.WhoisRecord?.status || [],
      registrant: {
        organization: data.WhoisRecord?.registrant?.organization || "Unknown",
        country: data.WhoisRecord?.registrant?.country || "Unknown",
        state: data.WhoisRecord?.registrant?.state || "Unknown",
        countryCode: data.WhoisRecord?.registrant?.countryCode || "Unknown",
      },
      // Additional security information
      hasSSL: data.WhoisRecord?.nameServers?.hostNames?.some((ns: string) => ns.includes('cloudflare')) || false,
      isPrivate: data.WhoisRecord?.registrant?.organization?.toLowerCase().includes('privacy') || false,
      isProxy: data.WhoisRecord?.registrant?.organization?.toLowerCase().includes('proxy') || false,
    }

    return NextResponse.json(whoisData)
  } catch (error) {
    console.error("Error performing WHOIS lookup:", error)
    return NextResponse.json({ message: "Failed to perform WHOIS lookup", error: String(error) }, { status: 500 })
  }
} 
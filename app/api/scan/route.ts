import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const apiKey = process.env.VIRUSTOTAL_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
    }

    const apiUrl = "https://www.virustotal.com/vtapi/v2/url/report"
    const params = new URLSearchParams({
      apikey: apiKey,
      resource: url,
    })

    const response = await fetch(`${apiUrl}?${params}`)
    const result = await response.json()

    if (result.response_code === 1) {
      const scanResult = {
        isSafe: result.positives === 0,
        positives: result.positives,
        total: result.total,
        scanId: result.scan_id,
        scans: result.scans,
        scanDate: result.scan_date,
        url: result.url,
        verbose_msg: result.verbose_msg,
        threatLevel: result.positives > 10 ? "High" : result.positives > 0 ? "Low" : "Safe",
        permalink: result.permalink,
      }
      return NextResponse.json(scanResult)
    }

    return NextResponse.json({ error: "URL not found in VirusTotal database" }, { status: 404 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to scan URL. Please try again." }, { status: 500 })
  }
}


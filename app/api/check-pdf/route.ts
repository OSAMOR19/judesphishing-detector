import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Force Node.js runtime for Buffer support

export async function POST(request: Request) {
  try {
    console.log("PDF scanning started");
    
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      console.log("No file provided in request");
      return NextResponse.json(
        { status: 'error', message: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`File converted to buffer: ${buffer.length} bytes`);
    
    // Parse PDF content for additional analysis
    let pdfText = "";
    try {
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text;
      console.log(`PDF parsed successfully, extracted ${pdfText.length} characters of text`);
    } catch (pdfError) {
      console.error("Error parsing PDF:", pdfError);
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Failed to parse PDF file',
          isMalicious: false,
          positives: 0,
          total: 0,
          scan_date: new Date().toISOString(),
          threat_level: "UNKNOWN",
          recommendations: [
            {
              severity: "error",
              message: "Failed to parse the PDF file.",
              action: "Please try a different PDF file or ensure the file is not corrupted."
            }
          ]
        },
        { status: 400 }
      );
    }
    
    // Extract URLs from PDF for additional analysis
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = pdfText.match(urlRegex) || [];
    console.log(`Found ${urls.length} URLs in PDF`);
    
    // For now, we'll just return the basic PDF analysis without VirusTotal
    // This will help us identify if the issue is with the PDF parsing or with VirusTotal
    return NextResponse.json({
      status: 'success',
      isMalicious: urls.length > 0, // Consider PDFs with URLs as potentially malicious
      positives: 0,
      total: 0,
      scan_date: new Date().toISOString(),
      threat_level: urls.length > 0 ? "MEDIUM" : "LOW",
      recommendations: [
        {
          severity: urls.length > 0 ? "warning" : "success",
          message: urls.length > 0 
            ? `Found ${urls.length} URLs in the PDF that may be suspicious.` 
            : "No suspicious content detected in the PDF.",
          action: urls.length > 0 
            ? "Be cautious when clicking any links in this document." 
            : "You can proceed, but always maintain good security practices."
        }
      ],
      message: urls.length > 0 
        ? `PDF contains ${urls.length} URLs that may be suspicious` 
        : 'No suspicious content detected',
      urls: urls,
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error 
          ? error.message 
          : 'Failed to process PDF',
        isMalicious: false,
        positives: 0,
        total: 0,
        scan_date: new Date().toISOString(),
        threat_level: "UNKNOWN",
        recommendations: [
          {
            severity: "error",
            message: "An error occurred while processing the PDF.",
            action: "Please try again or contact support if the issue persists."
          }
        ]
      },
      { status: 500 }
    );
  }
}
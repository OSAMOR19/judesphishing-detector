import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Force Node.js runtime for Buffer support

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF content
    const pdfData = await pdfParse(buffer);
    const pdfText = pdfData.text;
    
    // Simple check for URLs in the PDF
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = pdfText.match(urlRegex) || [];
    
    // Determine if malicious based on found URLs
    // This is a simple heuristic - in a real app, you'd check these URLs against a threat database
    const isMalicious = urls.length > 0;
    
    return NextResponse.json({
      status: 'success',
      isMalicious,
      positives: isMalicious ? 1 : 0,
      total: 1,
      scan_date: new Date().toISOString(),
      message: isMalicious 
        ? `Found ${urls.length} URLs in PDF that may be suspicious` 
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
          : 'Failed to process PDF' 
      },
      { status: 500 }
    );
  }
}
export interface ScanResult {
  // Basic properties
  status: "success" | "unknown" | "error" | "pending"
  isMalicious?: boolean
  positives?: number
  total?: number
  scan_date?: string
  message?: string
  location?: string
  country?: string
  ipAddress?: string
  threat_level?: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"
  
  // Domain information properties
  domain_age?: string
  has_ssl?: boolean
  redirects?: boolean
  registrar?: string
  creation_date?: string
  expiration_date?: string
  is_private?: boolean
  is_proxy?: boolean
  name_servers?: Array<string>
  domain_status?: Array<string>
  
  // PDF-specific properties
  urls?: Array<string>
  isPdf?: boolean
  
  // VirusTotal specific properties
  scanId?: string
  permalink?: string
  scans?: Record<string, { detected: boolean; result: string }>
  
  // Recommendations
  recommendations?: Array<{
    severity: "critical" | "warning" | "info" | "success"
    message: string
    action: string
  }>
} 
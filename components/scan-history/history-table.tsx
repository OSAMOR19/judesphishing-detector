"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, RefreshCw, Trash2 } from "lucide-react"

// Demo data for scan history
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
  {
    id: "4",
    input: "https://legitimate-site.com",
    type: "url",
    result: "safe",
    date: "2025-02-25T10:20:00",
    details: "No threats detected",
  },
  {
    id: "5",
    input: "newsletter@company.com",
    type: "email",
    result: "safe",
    date: "2025-02-24T16:30:00",
    details: "No threats detected",
  },
]

export function ScanHistoryTable() {
  const [history, setHistory] = useState(demoHistory)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleDelete = (id: string) => {
    setHistory(history.filter((item) => item.id !== id))
  }

  const handleRescan = (id: string) => {
    // In a real app, you would trigger a new scan here
    console.log(`Rescanning item with ID: ${id}`)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Input</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {item.type}
                </Badge>
              </TableCell>
              <TableCell className="font-medium max-w-[200px] truncate">{item.input}</TableCell>
              <TableCell>
                <Badge variant={item.result === "malicious" ? "destructive" : "success"}>{item.result}</Badge>
              </TableCell>
              <TableCell>{formatDate(item.date)}</TableCell>
              <TableCell className="max-w-[200px] truncate">{item.details}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRescan(item.id)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Rescan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(item.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle } from "lucide-react"

type Document = {
  name: string
  status: "verified" | "pending" | "rejected"
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    // Fetch document verification data
    const fetchDocumentData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/user/documents")
        if (!response.ok) {
          throw new Error("Failed to fetch document verification data")
        }

        const data = await response.json()
        setDocuments(data)
      } catch (error) {
        console.error("Error fetching document verification data:", error)
        setError("Failed to load document verification data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDocumentData()
  }, [])

  const handleStatusChange = async (documentName: string, newStatus: "verified" | "pending" | "rejected") => {
    try {
      setUpdating(true)
      setSuccess(null)
      setError(null)

      // Convert document name to snake_case for the API
      const apiDocumentName = documentName.toLowerCase().replace("aadhaar", "aadhaard").replace(/ /g, "_")

      const response = await fetch("/api/user/documents/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentName: apiDocumentName,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update document status")
      }

      // Update local state
      setDocuments((prevDocuments) =>
        prevDocuments.map((doc) => (doc.name === documentName ? { ...doc, status: newStatus } : doc)),
      )

      setSuccess(`${documentName} status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating document status:", error)
      setError("Failed to update document status. Please try again later.")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Document Verification Admin</CardTitle>
          <CardDescription className="text-center">Update document verification statuses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start mb-4">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start mb-4">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.name} className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{doc.name}</span>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      doc.status === "verified"
                        ? "bg-green-100 text-green-800"
                        : doc.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {doc.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Update status:</span>
                  <Select
                    defaultValue={doc.status}
                    onValueChange={(value) =>
                      handleStatusChange(doc.name, value as "verified" | "pending" | "rejected")
                    }
                    disabled={updating}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/profile")}>
            Back to Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LogOut, User, FileText, AlertCircle } from "lucide-react"
import { DocumentVerificationItem } from "@/components/document-verification-item"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

// Define the document type
type Document = {
  name: string
  status: "verified" | "pending" | "rejected"
}

export default function ProfilePage() {
  const [userDetails, setUserDetails] = useState<{
    email: string
    dateOfBirth: string
  } | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch user details
    const fetchUserDetails = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized, redirect to login
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch user details")
        }

        const data = await response.json()
        setUserDetails(data)
      } catch (error) {
        console.error("Error fetching user details:", error)
        setError("Failed to load user details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    // Fetch document verification data
    const fetchDocumentData = async () => {
      try {
        setDocumentsLoading(true)
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
        setDocumentsLoading(false)
      }
    }

    fetchUserDetails()
    fetchDocumentData()
  }, [router])

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/logout", { method: "GET" })
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Format date of birth
  const formattedDate = userDetails?.dateOfBirth
    ? format(new Date(userDetails.dateOfBirth), "MMMM d, yyyy")
    : "Not available"

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
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
          <CardDescription className="text-center">Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start mb-4">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                User Details
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                <p className="text-lg font-medium">{userDetails?.email}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                <p className="text-lg font-medium">{formattedDate}</p>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Document Verification Status</h3>
                {documentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : documents.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    {documents.map((doc) => (
                      <DocumentVerificationItem key={doc.name} documentName={doc.name} status={doc.status} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No document verification data available.</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

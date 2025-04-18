"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Clock, XCircle, AlertCircle, Upload, FileText, Info } from "lucide-react"
import { format } from "date-fns"
import { updateVerificationStatus } from "@/app/actions/verification-setup"

interface VerificationStatusProps {
  userId: string
  verifications: {
    [key: string]: {
      status: string
      verifiedAt: string | null
      documentUrl: string | null
      notes: string | null
    }
  }
  isEditable?: boolean
}

// Helper function to format verification type for display
const formatVerificationType = (type: string): string => {
  const formattedTypes = {
    address: "Address",
    education: "Education Background",
    employment: "Employment",
    aadhaar: "Aadhaar Card",
    criminal_record: "Criminal Record",
    passport: "Passport",
  }
  return formattedTypes[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")
}

export default function VerificationStatus({ userId, verifications, isEditable = false }: VerificationStatusProps) {
  const [activeVerification, setActiveVerification] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Function to get status badge with appropriate color and icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Not Verified
          </Badge>
        )
    }
  }

  // Function to handle status update
  const handleStatusUpdate = async (type: string, newStatus: string) => {
    setIsUpdating(true)
    setUpdateError(null)

    try {
      const result = await updateVerificationStatus(userId, type, newStatus)

      if (result.success) {
        // Close dialog and refresh page to show updated status
        setIsDialogOpen(false)
        window.location.reload()
      } else {
        setUpdateError(result.error || "Failed to update verification status")
      }
    } catch (error) {
      setUpdateError("An unexpected error occurred")
      console.error("Error updating verification status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-rose-500" />
          Verification Status
        </CardTitle>
        <CardDescription>Verification status of your personal information and documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(verifications).map(([type, data]) => (
            <div key={type} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{formatVerificationType(type)}</p>
                {data.verifiedAt && (
                  <p className="text-xs text-gray-500">
                    Verified on {format(new Date(data.verifiedAt), "MMM d, yyyy")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(data.status)}

                {isEditable && (
                  <Dialog
                    open={isDialogOpen && activeVerification === type}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open)
                      if (!open) setActiveVerification(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setActiveVerification(type)}
                      >
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Manage {formatVerificationType(type)} verification</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manage {formatVerificationType(type)} Verification</DialogTitle>
                        <DialogDescription>
                          Update the verification status or upload verification documents
                        </DialogDescription>
                      </DialogHeader>

                      <Tabs defaultValue="status">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="status">Status</TabsTrigger>
                          <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>

                        <TabsContent value="status" className="space-y-4 pt-4">
                          <div className="flex flex-col gap-2">
                            <Button
                              variant={data.status === "verified" ? "default" : "outline"}
                              className={data.status === "verified" ? "bg-green-500 hover:bg-green-600" : ""}
                              onClick={() => handleStatusUpdate(type, "verified")}
                              disabled={isUpdating}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark as Verified
                            </Button>

                            <Button
                              variant={data.status === "pending" ? "default" : "outline"}
                              className={data.status === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}
                              onClick={() => handleStatusUpdate(type, "pending")}
                              disabled={isUpdating}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Mark as Pending
                            </Button>

                            <Button
                              variant={data.status === "failed" ? "default" : "outline"}
                              className={data.status === "failed" ? "bg-red-500 hover:bg-red-600" : ""}
                              onClick={() => handleStatusUpdate(type, "failed")}
                              disabled={isUpdating}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Mark as Failed
                            </Button>

                            <Button
                              variant={data.status === "not_verified" ? "default" : "outline"}
                              onClick={() => handleStatusUpdate(type, "not_verified")}
                              disabled={isUpdating}
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Mark as Not Verified
                            </Button>
                          </div>

                          {updateError && (
                            <Alert variant="destructive">
                              <AlertDescription>{updateError}</AlertDescription>
                            </Alert>
                          )}
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-4 pt-4">
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="h-8 w-8 text-gray-400" />
                              <p className="text-sm font-medium">Upload verification documents</p>
                              <p className="text-xs text-gray-500">Drag and drop or click to upload</p>
                            </div>
                            <Button className="mt-4" disabled>
                              Select Files
                            </Button>
                            <p className="text-xs text-gray-500 mt-2">Document upload will be available soon</p>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Close
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {!isEditable && data.status !== "not_verified" && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">View {formatVerificationType(type)} details</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

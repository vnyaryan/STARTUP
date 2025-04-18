"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateVerificationStatus } from "@/app/actions/verification-setup"
import { CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface VerificationData {
  status: string
  verifiedAt: string | null
  documentUrl: string | null
  notes: string | null
}

interface VerificationManagerProps {
  userId: string
  initialVerifications: {
    [key: string]: VerificationData
  }
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

export default function VerificationManager({ userId, initialVerifications }: VerificationManagerProps) {
  const [verifications, setVerifications] = useState<{ [key: string]: VerificationData }>(initialVerifications)
  const [notes, setNotes] = useState<{ [key: string]: string }>({})
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({})
  const [updateError, setUpdateError] = useState<{ [key: string]: string | null }>({})
  const [updateSuccess, setUpdateSuccess] = useState<{ [key: string]: boolean }>({})

  // Initialize notes from initial verifications
  useState(() => {
    const initialNotes: { [key: string]: string } = {}
    Object.entries(initialVerifications).forEach(([type, data]) => {
      initialNotes[type] = data.notes || ""
    })
    setNotes(initialNotes)
  })

  // Function to handle status update
  const handleStatusUpdate = async (type: string, newStatus: string) => {
    setIsUpdating((prev) => ({ ...prev, [type]: true }))
    setUpdateError((prev) => ({ ...prev, [type]: null }))
    setUpdateSuccess((prev) => ({ ...prev, [type]: false }))

    try {
      const result = await updateVerificationStatus(
        userId,
        type,
        newStatus,
        verifications[type]?.documentUrl || null,
        notes[type] || null,
      )

      if (result.success) {
        // Update local state
        setVerifications((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            status: newStatus,
            verifiedAt: newStatus === "verified" ? new Date().toISOString() : null,
            notes: notes[type] || null,
          },
        }))
        setUpdateSuccess((prev) => ({ ...prev, [type]: true }))

        // Clear success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess((prev) => ({ ...prev, [type]: false }))
        }, 3000)
      } else {
        setUpdateError((prev) => ({ ...prev, [type]: result.error || "Failed to update verification status" }))
      }
    } catch (error) {
      setUpdateError((prev) => ({ ...prev, [type]: "An unexpected error occurred" }))
      console.error("Error updating verification status:", error)
    } finally {
      setIsUpdating((prev) => ({ ...prev, [type]: false }))
    }
  }

  // Function to handle notes update
  const handleNotesChange = (type: string, value: string) => {
    setNotes((prev) => ({ ...prev, [type]: value }))
  }

  // Function to save notes
  const saveNotes = async (type: string) => {
    setIsUpdating((prev) => ({ ...prev, [type]: true }))
    setUpdateError((prev) => ({ ...prev, [type]: null }))
    setUpdateSuccess((prev) => ({ ...prev, [type]: false }))

    try {
      const result = await updateVerificationStatus(
        userId,
        type,
        verifications[type]?.status || "not_verified",
        verifications[type]?.documentUrl || null,
        notes[type] || null,
      )

      if (result.success) {
        // Update local state
        setVerifications((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            notes: notes[type] || null,
          },
        }))
        setUpdateSuccess((prev) => ({ ...prev, [type]: true }))

        // Clear success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess((prev) => ({ ...prev, [type]: false }))
        }, 3000)
      } else {
        setUpdateError((prev) => ({ ...prev, [type]: result.error || "Failed to update notes" }))
      }
    } catch (error) {
      setUpdateError((prev) => ({ ...prev, [type]: "An unexpected error occurred" }))
      console.error("Error updating notes:", error)
    } finally {
      setIsUpdating((prev) => ({ ...prev, [type]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {Object.entries(verifications).map(([type, data]) => (
        <Card key={type} className={updateSuccess[type] ? "border-green-300 bg-green-50" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{formatVerificationType(type)}</span>
              <Badge
                className={
                  data.status === "verified"
                    ? "bg-green-500"
                    : data.status === "pending"
                      ? "bg-amber-500"
                      : data.status === "failed"
                        ? "bg-red-500"
                        : "bg-gray-400"
                }
              >
                {data.status === "verified"
                  ? "Verified"
                  : data.status === "pending"
                    ? "Pending"
                    : data.status === "failed"
                      ? "Failed"
                      : "Not Verified"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={data.status === "verified" ? "default" : "outline"}
                  className={data.status === "verified" ? "bg-green-500 hover:bg-green-600" : ""}
                  onClick={() => handleStatusUpdate(type, "verified")}
                  disabled={isUpdating[type]}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verified
                </Button>
                <Button
                  variant={data.status === "pending" ? "default" : "outline"}
                  className={data.status === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}
                  onClick={() => handleStatusUpdate(type, "pending")}
                  disabled={isUpdating[type]}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Pending
                </Button>
                <Button
                  variant={data.status === "failed" ? "default" : "outline"}
                  className={data.status === "failed" ? "bg-red-500 hover:bg-red-600" : ""}
                  onClick={() => handleStatusUpdate(type, "failed")}
                  disabled={isUpdating[type]}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Failed
                </Button>
                <Button
                  variant={data.status === "not_verified" ? "default" : "outline"}
                  onClick={() => handleStatusUpdate(type, "not_verified")}
                  disabled={isUpdating[type]}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Not Verified
                </Button>
              </div>

              <div className="space-y-2">
                <label htmlFor={`notes-${type}`} className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id={`notes-${type}`}
                  placeholder="Add verification notes here..."
                  value={notes[type] || ""}
                  onChange={(e) => handleNotesChange(type, e.target.value)}
                  disabled={isUpdating[type]}
                />
                <Button onClick={() => saveNotes(type)} disabled={isUpdating[type]} size="sm">
                  {isUpdating[type] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Notes"
                  )}
                </Button>
              </div>

              {updateError[type] && (
                <Alert variant="destructive">
                  <AlertDescription>{updateError[type]}</AlertDescription>
                </Alert>
              )}

              {updateSuccess[type] && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-700">
                    Verification status updated successfully.
                  </AlertDescription>
                </Alert>
              )}

              {data.verifiedAt && (
                <p className="text-xs text-gray-500">
                  Last verified on {new Date(data.verifiedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {data.documentUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={data.documentUrl} target="_blank" rel="noopener noreferrer">
                  View Document
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

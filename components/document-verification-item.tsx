import { CheckCircle, Clock, XCircle } from "lucide-react"

interface DocumentVerificationItemProps {
  documentName: string
  status: "verified" | "pending" | "rejected"
}

export function DocumentVerificationItem({ documentName, status }: DocumentVerificationItemProps) {
  // Define status-specific styles and icons
  const statusConfig = {
    verified: {
      textColor: "text-green-600",
      label: "VERIFIED",
      icon: <CheckCircle className="h-4 w-4 mr-1" />,
    },
    pending: {
      textColor: "text-amber-600",
      label: "PENDING",
      icon: <Clock className="h-4 w-4 mr-1" />,
    },
    rejected: {
      textColor: "text-red-600",
      label: "REJECTED",
      icon: <XCircle className="h-4 w-4 mr-1" />,
    },
  }

  const { textColor, label, icon } = statusConfig[status]

  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-800">{documentName}</span>
        <span className={`font-medium ${textColor} flex items-center`}>
          {icon}
          {label}
        </span>
      </div>
    </div>
  )
}

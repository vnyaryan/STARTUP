"use client"

import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SuccessMessageProps {
  title: string
  message: string
  onClose: () => void
}

export function SuccessMessage({ title, message, onClose }: SuccessMessageProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-500">{message}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button onClick={onClose} className="px-8">
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

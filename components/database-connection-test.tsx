"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Database, Loader2 } from "lucide-react"

export function DatabaseConnectionTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    error?: string
    currentTime?: string
    dbName?: string
    tableExists?: boolean
    userCount?: number
  } | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Test basic connectivity
      const res = await fetch("/api/test-sql")
      const data = await res.json()

      // Get additional diagnostic info
      const diagRes = await fetch("/api/diagnose")
      const diagData = await diagRes.json()

      setResult({
        success: data.success,
        error: data.error,
        currentTime: data.currentTime,
        dbName: diagData.database?.name,
        tableExists: diagData.database?.tableExists,
        userCount: diagData.users?.length || 0,
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
      <CardHeader className="py-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {result === null ? (
          <div className="text-sm text-gray-500 mb-3">Test your database connection to diagnose signup issues</div>
        ) : result.success ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-700">
                <p className="font-medium">Connection successful!</p>
                <ul className="mt-1 list-disc list-inside text-xs space-y-1">
                  <li>Database: {result.dbName}</li>
                  <li>Server time: {new Date(result.currentTime || "").toLocaleString()}</li>
                  <li>User table exists: {result.tableExists ? "Yes" : "No"}</li>
                  <li>Users in database: {result.userCount}</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Connection failed!</p>
                <p className="mt-1 text-xs">{result.error}</p>
              </div>
            </div>
          </div>
        )}

        <Button onClick={testConnection} disabled={isLoading} variant="outline" className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            "Test Database Connection"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

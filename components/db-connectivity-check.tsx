"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Database, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Define a single state type to avoid conflicting states
type ConnectionState =
  | { status: "unchecked" }
  | { status: "checking" }
  | {
      status: "connected"
      databaseName: string
      databaseVersion: string
      tableName: string
      tableExists: boolean
      tableColumns?: Array<{ name: string; type: string }>
      userCount: number
      recentEmails: string[]
    }
  | {
      status: "error"
      error: string
    }

export function DbConnectivityCheck() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: "unchecked" })
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  // Function to check the database connection
  const checkConnection = async () => {
    // Set state to checking
    setConnectionState({ status: "checking" })

    try {
      // Check the database connection
      const dbResponse = await fetch("/api/db-check")
      const dbData = await dbResponse.json()

      if (!dbData.success || !dbData.connected) {
        setConnectionState({
          status: "error",
          error: dbData.error || "Failed to connect to database",
        })
        setLastChecked(new Date())
        return
      }

      // If connection is successful, update state with database info
      setConnectionState({
        status: "connected",
        databaseName: dbData.databaseName,
        databaseVersion: dbData.databaseVersion,
        tableName: dbData.tableName,
        tableExists: dbData.tableExists,
        tableColumns: dbData.tableColumns,
        userCount: dbData.userCount,
        recentEmails: dbData.recentEmails || [],
      })
      setLastChecked(new Date())
    } catch (error) {
      setConnectionState({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
      setLastChecked(new Date())
    }
  }

  // Check connection on component mount
  useEffect(() => {
    checkConnection()
  }, [])

  // Render different content based on connection state
  const renderContent = () => {
    switch (connectionState.status) {
      case "unchecked":
        return null

      case "checking":
        return (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Checking database connection...</span>
          </div>
        )

      case "error":
        return (
          <div className="rounded-md p-4 bg-red-50 border border-red-200">
            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Database connection failed!</p>
                <p className="mt-1 text-sm text-red-700">{connectionState.error}</p>
              </div>
            </div>
          </div>
        )

      case "connected":
        return (
          <div className="rounded-md p-4 bg-green-50 border border-green-200">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Database connection successful!</p>
                <ul className="mt-2 text-sm text-green-700 space-y-1">
                  <li>
                    <span className="font-medium">Database:</span> {connectionState.databaseName}{" "}
                  </li>
                  <li>
                    <span className="text-xs text-green-600">{connectionState.databaseVersion}</span>
                  </li>
                  <li>
                    <span className="font-medium">Table:</span> {connectionState.tableName}{" "}
                    <span className="text-xs text-green-600">
                      ({connectionState.tableExists ? "Exists" : "Does not exist"})
                    </span>
                  </li>
                  {connectionState.tableExists &&
                    connectionState.tableColumns &&
                    connectionState.tableColumns.length > 0 && (
                      <li>
                        <details>
                          <summary className="cursor-pointer">Table structure</summary>
                          <ul className="mt-1 ml-4 list-disc">
                            {connectionState.tableColumns.map((col, index) => (
                              <li key={index} className="text-xs">
                                {col.name} <span className="text-green-600">({col.type})</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      </li>
                    )}
                  <li>
                    <span className="font-medium">Total registered emails:</span> {connectionState.userCount}
                  </li>
                  {connectionState.userCount > 0 && (
                    <li>
                      <details>
                        <summary className="cursor-pointer">Recent emails (up to 10)</summary>
                        <ul className="mt-1 ml-4 list-disc">
                          {connectionState.recentEmails.map((email, index) => (
                            <li key={index} className="text-xs break-all">
                              {email}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )
    }
  }

  // Get the appropriate badge based on connection state
  const getBadge = () => {
    switch (connectionState.status) {
      case "unchecked":
      case "checking":
        return null
      case "connected":
        return <Badge variant="success">Connected</Badge>
      case "error":
        return <Badge variant="destructive">Disconnected</Badge>
    }
  }

  // Get the appropriate button state
  const getButtonProps = () => {
    const isChecking = connectionState.status === "checking"
    const isDisabled = isChecking || connectionState.status === "unchecked"

    let variant: "default" | "outline" | "secondary" = "default"
    if (connectionState.status === "connected") variant = "outline"
    else if (connectionState.status === "error") variant = "secondary"

    let label = "Database Connectivity Check"
    if (isChecking) label = "Checking Connection..."
    else if (connectionState.status !== "unchecked") label = "Check Again"

    return { isChecking, isDisabled, variant, label }
  }

  const buttonProps = getButtonProps()

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium">Database Connectivity Check</h3>
            </div>
            {getBadge()}
          </div>

          {renderContent()}

          <Button
            onClick={checkConnection}
            disabled={buttonProps.isDisabled}
            className="w-full"
            variant={buttonProps.variant}
          >
            {buttonProps.isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Connection...
              </>
            ) : (
              buttonProps.label
            )}
          </Button>

          {lastChecked && (
            <p className="text-xs text-gray-500 text-center">Last checked: {lastChecked.toLocaleTimeString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import React from "react"

import { useCallback } from "react"

// Create a polyfill for useEffectEvent
const useEffectEvent = <T extends (...args: any[]) => any>(callback: T): T => useCallback(callback, []) as T

// Patch the React global object to include useEffectEvent
if (typeof window !== "undefined") {
  // @ts-ignore - Add useEffectEvent to React global
  if (!React.useEffectEvent) {
    // @ts-ignore
    React.useEffectEvent = useEffectEvent
  }
}

// Export the polyfill for direct use
export { useEffectEvent }

"use client"

import { useCallback } from "react"

// Simple polyfill that just uses useCallback instead
export function useEffectEvent<T extends (...args: any[]) => any>(callback: T): T {
  return useCallback(callback, []) as T
}

// Patch React namespace
if (typeof window !== "undefined") {
  // @ts-ignore - Add useEffectEvent to React global
  if (!React.useEffectEvent) {
    // @ts-ignore
    React.useEffectEvent = useEffectEvent
  }
}

// Add this to React namespace for TypeScript
declare global {
  namespace React {
    function useEffectEvent<T extends (...args: any[]) => any>(callback: T): T
  }
}

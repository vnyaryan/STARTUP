"use client"

// This is a temporary polyfill for useEffectEvent
// Remove this file once you've fixed all instances of useEffectEvent

import { useCallback } from "react"

// Simple polyfill that just uses useCallback instead
export function useEffectEvent<T extends (...args: any[]) => any>(callback: T): T {
  return useCallback(callback, []) as T
}

// Add this to React namespace
declare module "react" {
  interface React {
    useEffectEvent: typeof useEffectEvent
  }
}

import { format, parseISO } from "date-fns"

export function formatDate(date: string | Date): string {
  if (!date) return "Not available"

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return format(dateObj, "MMMM d, yyyy")
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

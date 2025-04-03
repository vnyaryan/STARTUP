"use server"

import { removeAuthCookie } from "@/lib/auth"

export async function logoutAction() {
  removeAuthCookie()
  return { success: true }
}


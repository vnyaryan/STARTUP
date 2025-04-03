export interface User {
  id: number
  username: string
  email: string
  email_verified: boolean
  date_of_birth: string
  created_at: string
}

export interface UserResponse {
  id: number
  username: string
  email: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
  status?: number
}


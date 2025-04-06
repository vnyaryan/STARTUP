export interface User {
  id: number
  email: string
  password: string
  gender: string
  dob: Date
  created_at: Date
  updated_at: Date
}

export interface UserSignupData {
  email: string
  password: string
  gender: string
  dob: string
}

export interface UserLoginData {
  email: string
  password: string
}

export interface SafeUser {
  id: number
  email: string
  gender: string
  dob: Date
  created_at: Date
}


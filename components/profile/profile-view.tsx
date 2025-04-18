"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, User, CheckCircle, AlertCircle, Pencil, Shield } from "lucide-react"
import ProfileEditForm from "./profile-edit-form"
import { format } from "date-fns"

interface ProfileViewProps {
  user: {
    id: string
    username: string
    email: string
    gender: string
    dateOfBirth: string
    age: number
    profileImageUrl: string | null
    emailVerified: boolean
    createdAt: string
    role: string
  }
}

export default function ProfileView({ user }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Check if user data is valid
  if (!user || !user.id) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Profile Data Error</h1>
          <p className="text-gray-700 mb-4">We couldn't load your profile data. Please try logging out and back in.</p>
          <Button asChild className="w-full">
            <a href="/login">Return to Login</a>
          </Button>
        </div>
      </div>
    )
  }

  // Format dates for display - with error handling
  let formattedBirthDate = "Not available"
  let formattedJoinDate = "Not available"

  try {
    if (user.dateOfBirth) {
      formattedBirthDate = format(new Date(user.dateOfBirth), "MMMM d, yyyy")
    }
  } catch (error) {
    console.error("Error formatting birth date:", error)
  }

  try {
    if (user.createdAt) {
      formattedJoinDate = format(new Date(user.createdAt), "MMMM d, yyyy")
    }
  } catch (error) {
    console.error("Error formatting join date:", error)
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="mt-4 md:mt-0 flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {isEditing ? (
              <ProfileEditForm user={user} onCancel={() => setIsEditing(false)} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column - Profile image and basic info */}
                <div className="md:col-span-1">
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <Avatar className="h-32 w-32 mb-4">
                        <AvatarImage src={user.profileImageUrl || ""} alt={user.username} />
                        <AvatarFallback className="bg-rose-100 text-rose-500 text-2xl">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>

                      <h2 className="text-xl font-semibold text-center">{user.username}</h2>

                      <div className="flex items-center gap-2 mt-1 text-gray-500">
                        <span className="capitalize">{user.gender || "Not specified"}</span>
                        {user.age && (
                          <>
                            <span>•</span>
                            <span>{user.age} years</span>
                          </>
                        )}
                      </div>

                      {user.role === "admin" && (
                        <Badge className="mt-2 bg-purple-500 hover:bg-purple-600 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      )}

                      <div className="flex items-center gap-2 mt-4">
                        {user.emailVerified ? (
                          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                      </div>

                      <div className="w-full border-t mt-6 pt-4">
                        <p className="text-sm text-gray-500 text-center">Member since {formattedJoinDate}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right column - Detailed information */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Your personal details and account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-2" />
                          Username
                        </div>
                        <p className="font-medium">{user.username}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Address
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.email}</p>
                          {user.emailVerified ? (
                            <span className="text-xs text-green-600 flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Not verified
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          Date of Birth
                        </div>
                        <p className="font-medium">
                          {formattedBirthDate} {user.age ? `(${user.age} years old)` : ""}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-2" />
                          Gender
                        </div>
                        <p className="font-medium capitalize">{user.gender || "Not specified"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Profile Preferences</CardTitle>
                <CardDescription>Manage your profile visibility and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Preference settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

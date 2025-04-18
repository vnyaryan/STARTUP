import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, User } from "lucide-react"

interface ProfileCardProps {
  user: {
    id: string
    username: string
    age?: number
    location?: string
    profile_image_url: string | null
  }
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[3/4] w-full">
        {user.profile_image_url ? (
          <Image
            src={user.profile_image_url || "/placeholder.svg"}
            alt={`${user.username}'s profile`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <User className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">{user.username}</h3>

        <div className="text-sm text-gray-500 mt-1">
          {user.age && <span>{user.age} years</span>}
          {user.age && user.location && <span> • </span>}
          {user.location && <span>{user.location}</span>}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Heart className="h-4 w-4 mr-1" /> Interest
          </Button>
          <Link href={`/messages/${user.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full bg-rose-500 hover:bg-rose-600">
              <MessageCircle className="h-4 w-4 mr-1" /> Message
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

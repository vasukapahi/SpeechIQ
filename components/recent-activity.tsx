"use client"

import { useState } from "react"
import { Calendar, Clock, HelpCircle,Volume2,Music,Lightbulb} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ActivityItem {
  id: string
  timestamp: string
  transcript: string
  intent: "decrease_volume_none" | "activate_music_none" | "activate_lights_kitchen"
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    timestamp: "2023-05-07T14:30:00Z",
    transcript: "The volume is too loud!",
    intent: "decrease_volume_none",
  },
  {
    id: "2",
    timestamp: "2023-05-07T13:15:00Z",
    transcript: "Can you turn on the music?",
    intent: "activate_music_none",
  },
  {
    id: "3",
    timestamp: "2023-05-07T11:45:00Z",
    transcript: "Turn on the kitchen's light.",
    intent: "activate_lights_kitchen",
  },
]

export function RecentActivity() {
  const [activities] = useState<ActivityItem[]>(mockActivities)

  const getIntentIcon = (intent: string) => {
  switch (intent) {
    case "decrease_volume_none":
      return <Volume2 className="h-4 w-4 text-blue-500" />; 
    case "activate_music_none":
      return <Music className="h-4 w-4 text-green-500" />; 
    case "activate_lights_kitchen":
      return <Lightbulb className="h-4 w-4 text-purple-500" />; 
    default:
      return <HelpCircle className="h-4 w-4 text-gray-400" />; 
  }
};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent audio analysis history</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-4">
              <div className="mt-0.5">{getIntentIcon(activity.intent)}</div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.transcript}</p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDate(activity.timestamp)}
                  </span>
                  <span className="flex items-center text-xs text-muted-foreground">Intent: {activity.intent}</span>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

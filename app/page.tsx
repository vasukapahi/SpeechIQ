import { AudioRecorder } from "@/components/audio-recorder"
import { DashboardHeader } from "@/components/dashboard-header"
import { IntentDisplay } from "@/components/intent-display"
import { RecentActivity } from "@/components/recent-activity"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Speaker Intent Recognition</h1>
            <p className="text-muted-foreground">
              Record 3 seconds of audio or upload a file to analyze the speaker&apos;s intent
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <AudioRecorder />
            <IntentDisplay />
          </div>

          <RecentActivity />
        </div>
      </main>
    </div>
  )
}

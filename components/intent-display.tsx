"use client"

import { useEffect, useState } from "react"
import {Mic} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Intent = "question" | "statement" | "request" | "command" | "error" | null
type Entity = { type: string; value: string }

interface IntentData {
  intent: Intent
  entities: Entity[]
}

export function IntentDisplay() {
  const [intentData, setIntentData] = useState<IntentData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const handleIntentRecognized = (event: CustomEvent<IntentData>) => {
      setIsAnalyzing(true)

      // Simulate processing time
      setTimeout(() => {
        setIntentData(event.detail)
        setIsAnalyzing(false)
      }, 1000)
    }

    window.addEventListener("intentRecognized", handleIntentRecognized as EventListener)

    return () => {
      window.removeEventListener("intentRecognized", handleIntentRecognized as EventListener)
    }
  }, [])

  const getIcon = (intent: Intent) => {
        return <Mic className="h-5 w-5" />
    
  }

  return (
  <Card className="h-full">
    <CardHeader>
      <CardTitle>Intent Analysis</CardTitle>
      <CardDescription>Recognized speaker intent from 3-second audio</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {isAnalyzing ? (
        <div className="space-y-4 py-8">
          <div className="flex justify-center">
            <div className="animate-pulse h-12 w-12 rounded-full bg-muted"></div>
          </div>
          <Progress value={45} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">Analyzing audio...</p>
        </div>
      ) : intentData ? (
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-base font-medium mb-2">The Predicted Intent is:</h3>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">{getIcon(intentData.intent)}</div>
            <div>
              <div className="font-semibold text-lg">
                {intentData.intent}
              </div>
              {intentData.entities.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <strong>Entities:</strong>
                  <ul>
                    {intentData.entities.map((entity, index) => (
                      <li key={index}>{`${entity.type}: ${entity.value}`}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Mic className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No Analysis Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Record for 3 seconds or upload audio and click &quot;Analyze Audio&quot; to see the speaker&apos;s intent.
          </p>
        </div>
      )}
    </CardContent>

  </Card>
)
}

"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Mic, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription,CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AudioVisualizer } from "./audio-visualizer"

type RecordingState = "idle" | "recording" | "processing" | "ready"

export function AudioRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [predictedIntent, setPredictedIntent] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      setCountdown(3)
      audioChunksRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        setRecordingState("ready")
      }

      mediaRecorder.start()
      setRecordingState("recording")

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!)
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setAudioBlob(null)
    setRecordingState("idle")
    setCountdown(3)
    setPredictedIntent(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const blob = file.slice(0, file.size, file.type)
      setAudioBlob(blob)
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setRecordingState("ready")
      setPredictedIntent(null)
    }
  }

  const analyzeAudio = async () => {
    if (!audioBlob) return

    setRecordingState("processing")

    try {
      const formData = new FormData()
      formData.append("file", audioBlob, "recorded_audio.wav")

      const response = await fetch("https://speech-backend-5rmy.onrender.com/predict-intent/", {
        method: "POST",
        body: formData, 
      })

      const data = await response.json()
      setPredictedIntent(data.intent || "Unknown")

      setRecordingState("ready")
      
      // Dispatch event to update IntentDisplay
      window.dispatchEvent(new CustomEvent("intentRecognized", { detail: { intent: data.intent || "Unknown", entities: []}}))
    } catch (error) {
      console.error("Error analyzing audio:", error)
      setPredictedIntent("Error processing audio")
      setRecordingState("ready")
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Audio Input</CardTitle>
        <CardDescription>Record for 3 seconds or upload audio to analyze intent</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="record">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="record">Record</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="record" className="space-y-4">
            <div className="h-32 rounded-md border border-dashed flex items-center justify-center relative">
              {recordingState === "idle" ? (
                <div className="text-center text-muted-foreground">
                  <p>Click record to start capturing audio</p>
                </div>
              ) : (
                <>
                  <AudioVisualizer isRecording={recordingState === "recording"} audioUrl={audioUrl} />
                  {recordingState === "recording" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-background/80 rounded-full h-16 w-16 flex items-center justify-center">
                        <span className="text-2xl font-bold">{countdown}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">
                {recordingState === "recording" && `Recording: ${countdown}s remaining`}
                {recordingState === "processing" && "Processing audio..."}
                {recordingState === "ready" && "Recording complete"}
              </div>
              <div className="flex gap-2">
                {recordingState === "idle" && (
                  <Button onClick={startRecording} size="sm" variant="default">
                    <Mic className="mr-2 h-4 w-4" />
                    Record (3s)
                  </Button>
                )}
                {recordingState === "ready" && (
                  <Button onClick={resetRecording} size="sm" variant="outline">
                    Reset
                  </Button>
                )}
              </div>
            </div>
            {audioUrl && recordingState === "ready" && (
              <div className="mt-2">
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}
          </TabsContent>
          <TabsContent value="upload">
            <div className="h-32 rounded-md border border-dashed flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <label htmlFor="audio-upload" className="cursor-pointer text-sm text-primary">
                Upload audio file
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  onChange={handleFileUpload}
                />
              </label>
              <p className="text-xs text-muted-foreground mt-1">MP3, WAV, or M4A up to 10MB</p>
            </div>
            {audioUrl && (
              <div className="mt-4">
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button onClick={analyzeAudio} className="w-full" disabled={!audioBlob || recordingState === "processing"}>
          {recordingState === "processing" ? "Processing..." : "Analyze Audio"}
        </Button>
      </CardFooter>
    </Card>
  )
}

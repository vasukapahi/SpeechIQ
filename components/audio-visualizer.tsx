"use client"

import { useEffect, useRef } from "react"

interface AudioVisualizerProps {
  isRecording: boolean
  audioUrl: string | null
}

export function AudioVisualizer({ isRecording, audioUrl }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()
  const audioContextRef = useRef<AudioContext>()
  const dataArrayRef = useRef<Uint8Array>()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio
      canvas.height = canvas.clientHeight * window.devicePixelRatio
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize audio context and analyzer
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      const bufferLength = analyserRef.current.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)
    }

    // Connect to audio source if we have a URL
    let source: MediaElementAudioSourceNode | null = null
    if (audioUrl && !isRecording) {
      const audio = new Audio(audioUrl)
      audio.crossOrigin = "anonymous"
      audio.loop = true
      audio.play()
      source = audioContextRef.current.createMediaElementSource(audio)
      source.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)
    }

    // Draw function for visualization
    const draw = () => {
      if (!ctx || !analyserRef.current || !dataArrayRef.current) return

      animationRef.current = requestAnimationFrame(draw)

      analyserRef.current.getByteFrequencyData(dataArrayRef.current)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5
      let x = 0

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const barHeight = (dataArrayRef.current[i] / 255) * canvas.height * 0.8

        // Use a gradient for the bars
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
        gradient.addColorStop(0, "#3b82f6")
        gradient.addColorStop(1, "#1d4ed8")

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)

        x += barWidth
      }
    }

    // If recording, simulate visualization with random data
    if (isRecording) {
      const simulateRecording = () => {
        if (!ctx || !dataArrayRef.current) return

        animationRef.current = requestAnimationFrame(simulateRecording)

        // Generate random data for visualization
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          dataArrayRef.current[i] = Math.random() * 150 + 50
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5
        let x = 0

        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const barHeight = (dataArrayRef.current[i] / 255) * canvas.height * 0.8

          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
          gradient.addColorStop(0, "#ef4444")
          gradient.addColorStop(1, "#b91c1c")

          ctx.fillStyle = gradient
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)

          x += barWidth
        }
      }

      simulateRecording()
    } else if (audioUrl) {
      draw()
    } else {
      // Draw a flat line when idle
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      ctx.moveTo(0, canvas.height / 2)
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 2
      ctx.stroke()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (source) {
        source.disconnect()
      }
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [isRecording, audioUrl])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

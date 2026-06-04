import { useEffect, useRef, useState } from "react"
import { Volume1, Volume2, VolumeX } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useWakeLock } from "@/hooks/useWakeLock"

const fillWhiteNoise = (buffer: AudioBuffer) => {
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  }
}

const WhiteNoise = () => {
  const { t } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.6)

  useWakeLock(playing)

  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  useEffect(() => {
    return () => {
      sourceRef.current?.stop()
      ctxRef.current?.close()
    }
  }, [])

  const startNoise = () => {
    const ctx = new AudioContext()
    ctxRef.current = ctx

    const bufferSize = ctx.sampleRate * 3
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    fillWhiteNoise(buffer)

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = ctx.createGain()
    gain.gain.value = volume

    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    sourceRef.current = source
    gainRef.current = gain
    setPlaying(true)
  }

  const stopNoise = () => {
    sourceRef.current?.stop()
    sourceRef.current = null
    ctxRef.current?.close()
    ctxRef.current = null
    gainRef.current = null
    setPlaying(false)
  }

  const handleVolumeChange = (v: number) => {
    setVolume(v)
    if (gainRef.current) {
      gainRef.current.gain.value = v
    }
  }

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <p className="mb-8 text-center text-sm text-muted-foreground">
        {t("whiteNoise.description")}
      </p>

      <div className="mb-8 flex justify-center">
        <button
          onClick={playing ? stopNoise : startNoise}
          aria-label={
            playing
              ? t("whiteNoise.stopWhiteNoise")
              : t("whiteNoise.playWhiteNoise")
          }
          className={cn(
            "relative flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300",
            playing
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "border-2 border-border text-muted-foreground hover:border-primary hover:text-primary"
          )}
        >
          <VolumeIcon className="h-10 w-10" />
          {playing && (
            <>
              <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-20" />
              <span className="absolute -inset-3 animate-ping rounded-full bg-primary opacity-10 [animation-delay:300ms]" />
            </>
          )}
        </button>
      </div>

      <p className="mb-6 text-center text-xs text-muted-foreground">
        {playing ? t("whiteNoise.playing") : t("whiteNoise.tapToStart")}
      </p>

      <div className="flex items-center gap-3">
        <VolumeX className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="flex-1 accent-primary"
          aria-label={t("whiteNoise.volume")}
        />
        <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
    </div>
  )
}

export default WhiteNoise

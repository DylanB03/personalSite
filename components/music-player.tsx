"use client"

import Image from "next/image"
import { useEffect, useId, useRef, useState, type CSSProperties, type ChangeEvent } from "react"
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"

const TRACKS = [
  {
    title: "Iki Town (Night)",
    subtitle: "guitar cover",
    src: "/music/ikitown.mp3",
    artwork: "/music/iki-town-night.png",
    sketch: "guitar",
  },
  {
    title: "Aria Math",
    subtitle: "guitar cover",
    src: "/music/ariamath.mp3",
    artwork: "/music/aria-math.png",
    sketch: "strings",
  },
  {
    title: "Always With Me",
    subtitle: "guitar cover",
    src: "/music/always-with-me.mp3",
    artwork: "/music/always-with-me.png",
    sketch: "room",
  },
] as const

// The player UI treats this capped range as 0-100%. Even at the top of the
// slider, the browser is only asked for half of its available audio output.
const MAX_OUTPUT_VOLUME = 0.5
const DEFAULT_OUTPUT_VOLUME = 0.25

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00"
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function PlayerArtwork({
  artwork,
  sketch,
  title,
}: {
  artwork: string | null
  sketch: "guitar" | "strings" | "room"
  title: string
}) {
  const textureId = useId().replaceAll(":", "")

  if (artwork) {
    return (
      <Image
        className="music-player-cover"
        src={artwork}
        alt={`${title} artwork`}
        width={120}
        height={120}
        sizes="75px"
      />
    )
  }

  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={`${sketch} paper artwork`}>
      <defs>
        <filter id={textureId} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.76" numOctaves="3" seed="11" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="table" tableValues="0 0.19" /></feComponentTransfer>
        </filter>
      </defs>
      <rect width="120" height="120" fill="#c8c1b5" />
      <rect width="120" height="120" filter={`url(#${textureId})`} opacity="0.42" />

      {sketch === "guitar" && (
        <g fill="none" stroke="#33312e" strokeLinecap="round" strokeLinejoin="round">
          <path d="M70 16 61 57" strokeWidth="5" />
          <path d="m68 14 11 2-2 9-11-2Z" strokeWidth="1.3" />
          <path d="M55 50c-9 4-13 13-8 21 3 5 2 9 0 14-3 8 2 16 11 18 12 2 23-6 25-18 2-10-3-17-11-20-5-2-7-7-5-12 2-5-5-7-12-3Z" strokeWidth="1.7" />
          <circle cx="65" cy="78" r="7" strokeWidth="1.2" />
          <path d="m65 20-9 59m12-58-9 59" strokeWidth="0.55" opacity="0.8" />
        </g>
      )}

      {sketch === "strings" && (
        <g fill="none" stroke="#33312e" strokeLinecap="round">
          <path d="M17 27c20 9 30 9 47 0s27-8 39 1M17 42c20 9 30 9 47 0s27-8 39 1M17 57c20 9 30 9 47 0s27-8 39 1M17 72c20 9 30 9 47 0s27-8 39 1M17 87c20 9 30 9 47 0s27-8 39 1" strokeWidth="1.2" />
          <circle cx="64" cy="58" r="17" strokeWidth="1" opacity="0.65" />
          <circle cx="64" cy="58" r="3" fill="#33312e" stroke="none" />
        </g>
      )}

      {sketch === "room" && (
        <g fill="none" stroke="#33312e" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 90V33l40-15 42 15v57" strokeWidth="1.4" />
          <path d="m19 33 40 17 42-17M59 50v53M34 72h14v18H34zm38-7h15v25H72z" strokeWidth="1" />
          <path d="M13 103c27-5 59-5 94 0" strokeWidth="1" opacity="0.6" />
        </g>
      )}

      <text x="10" y="112" fill="#33312e" fontFamily="monospace" fontSize="4.5" letterSpacing="0.8">ROOM TAKE / {sketch === "guitar" ? "01" : sketch === "strings" ? "02" : "03"}</text>
    </svg>
  )
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const resumeAfterChange = useRef(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(DEFAULT_OUTPUT_VOLUME)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [direction, setDirection] = useState<"next" | "previous">("next")
  const [artworkKey, setArtworkKey] = useState(0)
  const track = TRACKS[trackIndex]

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = Math.min(volume, MAX_OUTPUT_VOLUME)
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.load()
    setCurrentTime(0)
    setDuration(0)

    if (!resumeAfterChange.current) return

    const resume = () => {
      audio.play().catch(() => setIsPlaying(false))
      resumeAfterChange.current = false
    }

    audio.addEventListener("canplay", resume, { once: true })
    return () => audio.removeEventListener("canplay", resume)
  }, [trackIndex])

  const changeTrack = (offset: number, keepPlaying?: boolean) => {
    const audio = audioRef.current
    resumeAfterChange.current = keepPlaying ?? Boolean(audio && !audio.paused)
    setDirection(offset > 0 ? "next" : "previous")
    setTrackIndex((current) => (current + offset + TRACKS.length) % TRACKS.length)
    setArtworkKey((current) => current + 1)
  }

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        setIsPlaying(false)
      }
    } else {
      audio.pause()
    }
  }

  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const nextTime = Number(event.target.value)
    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const changeVolume = (event: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = (Number(event.target.value) / 100) * MAX_OUTPUT_VOLUME
    setVolume(nextVolume)
    setIsMuted(nextVolume === 0)
  }

  const toggleMute = () => {
    if (isMuted && volume === 0) setVolume(DEFAULT_OUTPUT_VOLUME)
    setIsMuted((muted) => !muted)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const volumePercent = Math.round((volume / MAX_OUTPUT_VOLUME) * 100)
  const visibleVolumePercent = isMuted ? 0 : volumePercent
  const seekStyle = { "--seek-progress": `${progress}%` } as CSSProperties
  const volumeStyle = { "--volume-progress": `${visibleVolumePercent}%` } as CSSProperties

  return (
    <section className="music-player-dock" aria-label="Music player">
      <audio
        ref={audioRef}
        src={track.src}
        preload="metadata"
        muted={isMuted}
        onEnded={() => changeTrack(1, true)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      />

      <div className="music-player-print-stack">
        <span aria-hidden="true" className="music-player-backing" />
        <div key={artworkKey} className="music-player-print" data-direction={direction}>
          <PlayerArtwork artwork={track.artwork} sketch={track.sketch} title={track.title} />
        </div>
      </div>

      <div className="music-player-body">
        <div className="music-player-meta" aria-live="polite">
          <div><p>{track.title}</p><span>{track.subtitle}</span></div>
          <div className="music-player-volume">
            <button
              className="music-player-volume-button"
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              aria-controls="music-player-volume-control"
            >
              {isMuted ? <VolumeX /> : <Volume2 />}
            </button>
            <div className="music-player-volume-popover" id="music-player-volume-control">
              <div className="music-player-volume-heading">
                <span>volume</span>
                <output>{visibleVolumePercent}%</output>
              </div>
              <label>
                <span className="sr-only">Volume, capped at a safe maximum</span>
                <input
                  className="music-player-volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={visibleVolumePercent}
                  style={volumeStyle}
                  onChange={changeVolume}
                />
              </label>
              <small>capped output</small>
            </div>
          </div>
        </div>

        <label className="music-player-seek-label">
          <span className="sr-only">Seek through {track.title}</span>
          <input
            className="music-player-seek"
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={Math.min(currentTime, duration || 0)}
            style={seekStyle}
            onChange={seek}
          />
        </label>

        <div className="music-player-footer">
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div className="music-player-controls">
            <button type="button" onClick={() => changeTrack(-1)} aria-label="Previous track"><SkipBack /></button>
            <button className="music-player-play" type="button" onClick={togglePlayback} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause /> : <Play />}
            </button>
            <button type="button" onClick={() => changeTrack(1)} aria-label="Next track"><SkipForward /></button>
          </div>
        </div>
      </div>
    </section>
  )
}

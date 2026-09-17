import React, { useEffect, useRef, useState } from 'react'
import { useLandscapeMode } from './useLandscapeMode'
import { Pause, Play, SkipForward } from 'lucide-react'

type Props = {
  title?: string
  trigger: boolean
  duration: number
  onComplete: () => void
}

export const RestTime: React.FC<Props> = ({ title = 'Time for resting', trigger, duration, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [remaining, setRemaining] = useState(duration)
  const isLandscapeMode = useLandscapeMode()
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (trigger) {
      setIsVisible(true)
      setIsPlaying(true)
      setRemaining(duration)
    }
  }, [trigger, duration])

  useEffect(() => {
    if (!isVisible) return
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            window.clearInterval(intervalRef.current || undefined)
            onComplete()
            setIsVisible(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [isPlaying, isVisible, onComplete])

  const size = isLandscapeMode ? 80 : 110
  const stroke = isLandscapeMode ? 6 : 8
  const pct = duration > 0 ? (remaining / duration) * 100 : 0

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/90" />
      <div className="relative flex flex-col items-center gap-2 text-white">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size/2} cy={size/2} r={(size-stroke)/2} fill="none" stroke="transparent" strokeWidth={stroke} />
            <circle
              cx={size/2}
              cy={size/2}
              r={(size-stroke)/2}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${Math.PI*(size-stroke)} ${Math.PI*(size-stroke)}`}
              strokeDashoffset={`${Math.PI*(size-stroke)*(1 - pct/100)}`}
              transform={`rotate(-90 ${size/2} ${size/2})`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={isLandscapeMode ? 'text-5xl font-bold' : 'text-6xl font-bold'}>{remaining}</div>
          </div>
        </div>

        <div className={isLandscapeMode ? 'text-2xl font-bold' : 'text-3xl font-bold'}>{title}</div>

        <div className="flex items-center justify-center gap-4 text-white">
          <button
            className="p-2 text-white hover:opacity-70 transition-opacity"
            onClick={() => setIsPlaying(prev => !prev)}
            onMouseDown={e => e.preventDefault()}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause style={{ width: isLandscapeMode ? 40 : 50, height: isLandscapeMode ? 40 : 50 }} />
            ) : (
              <Play style={{ width: isLandscapeMode ? 40 : 50, height: isLandscapeMode ? 40 : 50 }} />
            )}
          </button>
          <button
            className="p-2 text-white hover:opacity-70 transition-opacity"
            onClick={() => {
              setIsVisible(false)
              onComplete()
            }}
            onMouseDown={e => e.preventDefault()}
            aria-label="Skip"
          >
            <SkipForward style={{ width: isLandscapeMode ? 40 : 50, height: isLandscapeMode ? 40 : 50 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default RestTime




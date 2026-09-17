import React, { useEffect, useRef, useState } from 'react'
import { useLandscapeMode } from './useLandscapeMode'
import { AlertCircle, Play, Pause, SkipForward, ChevronRight, ArrowRight } from 'lucide-react'

type ExerciseInfo = { image?: string; name?: string; goal?: string }

type Props = {
  trigger: boolean
  duration: number
  currentExerciseInfo: ExerciseInfo
  nextExerciseInfo?: ExerciseInfo
  onComplete: () => void
  skipExercise: () => void
  idType: string
  logoUrl?: string // optional logo url
}

export const DemoExercise: React.FC<Props> = ({ trigger, duration, currentExerciseInfo, nextExerciseInfo, onComplete, skipExercise, idType, logoUrl }) => {
  const isLandscapeMode = useLandscapeMode()
  const [isVisible, setIsVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true)
  const [remaining, setRemaining] = useState(duration)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const timerRef = useRef<number | null>(null)
  const message = 'Exercise Starts in 5 seconds. Make sure your whole body is captured by the camera'

  // Prevent background scroll when modal is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  useEffect(() => {
    if (trigger) {
      setIsVisible(true)
      setIsPlaying(false)
      setIsDisabled(true)
      setRemaining(duration)
    }
  }, [trigger, duration])

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      const selectedVoice = voices.find(v => v.name.includes('Google US English')) || voices[0]
      setVoice(selectedVoice || null)
    }
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices
    }
    loadVoices()
  }, [])

  const speakMessage = (text: string) => {
    if (!('speechSynthesis' in window) || !voice) return Promise.resolve()
    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = voice
      utterance.lang = 'en-US'
      utterance.rate = 0.85
      utterance.onend = () => resolve()
      utterance.onerror = () => reject()
      speechSynthesis.speak(utterance)
    })
  }

  useEffect(() => {
    if (!voice || !trigger) return
    let cancelled = false
    const handleSpeech = async () => {
      try {
        await speakMessage(message)
        if (!cancelled) {
          setIsPlaying(true)
          setIsDisabled(false)
        }
      } catch {}
    }
    handleSpeech()
    return () => { cancelled = true; speechSynthesis.cancel() }
  }, [message, voice, trigger])

  useEffect(() => {
    if (!isVisible || !isPlaying) return
    timerRef.current = window.setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          window.clearInterval(timerRef.current || undefined)
          setIsVisible(false)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [isVisible, isPlaying, onComplete])

  const handleSkipExercise = () => {
    skipExercise()
  }

  const handleTimerComplete = () => {
    setIsVisible(false)
    onComplete()
  }

  if (!isVisible || !currentExerciseInfo || !voice) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center"
      role="dialog"
      aria-modal
      style={{ 
        backgroundImage: 'url(../src/assets/bg_light.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        overscrollBehavior: 'contain' 
      }}
    >
      {/* Warning message at top */}
      <div className="w-[90%] flex justify-center mb-20">
        <div 
          className="flex items-center gap-3 text-[#353E45]"
          style={{ fontSize: isLandscapeMode ? '1.2rem' : '2rem' }}
        >
          <AlertCircle className="flex-shrink-0" style={{ width: isLandscapeMode ? 30 : 50, height: isLandscapeMode ? 30 : 50 }} />
          <span>Make sure your whole body is captured by the camera</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex w-[80%] gap-6">
        {/* Left Column - Exercise Image */}
        <div className="basis-[50%] flex flex-col gap-4">
          <img
            src={currentExerciseInfo.image || ''}
            alt="exercise image"
            className="h-[50vh] w-full object-cover bg-white border border-[#E8E8E8] rounded-[15px]"
          />
          
          {/* Next exercise info */}
          {nextExerciseInfo && (
            <div className="flex flex-row items-center gap-3 w-full text-[#353E45]">
              <span className="font-bold text-base">Next</span>
              <ChevronRight className="w-5 h-5" />
              <span className="font-bold text-base">{nextExerciseInfo?.name || 'N/A'}</span>
              <span className={`font-normal ${isLandscapeMode ? 'hidden' : 'block'}`}>
                {nextExerciseInfo?.goal || 'N/A'}
              </span>
              <button 
                className="ml-auto flex items-center gap-1 text-base font-normal text-[#353E45] hover:opacity-70 transition-opacity" 
                onClick={handleSkipExercise} 
                disabled={!nextExerciseInfo}
              >
                Skip this exercise
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Timer and Controls */}
        <div 
          className="basis-[50%] flex flex-col justify-center items-center"
          style={{ gap: isLandscapeMode ? '0.5rem' : '1rem' }}
        >
          {/* Countdown Timer Circle */}
          <div 
            className="relative rounded-full border-[6px] border-[#353E45] flex items-center justify-center"
            style={{ 
              width: isLandscapeMode ? 80 : 110, 
              height: isLandscapeMode ? 80 : 110,
              borderWidth: isLandscapeMode ? 6 : 8
            }}
          >
            <span 
              className="font-bold text-[#353E45]"
              style={{ fontSize: isLandscapeMode ? '3rem' : '4rem' }}
            >
              {remaining}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {/* Play/Pause Button */}
            <button 
              className="p-2 text-[#353E45] hover:opacity-70 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setIsPlaying(p => !p)} 
              onMouseDown={e => e.preventDefault()} 
              disabled={isDisabled}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause style={{ width: isLandscapeMode ? 40 : 50, height: isLandscapeMode ? 40 : 50 }} />
              ) : (
                <Play style={{ width: isLandscapeMode ? 40 : 50, height: isLandscapeMode ? 40 : 50 }} />
              )}
            </button>

            {/* Skip Button */}
            <button 
              className="p-2 text-[#353E45] hover:opacity-70 transition-opacity"
              onClick={handleTimerComplete} 
              onMouseDown={e => e.preventDefault()}
              aria-label="Skip to next"
            >
              <SkipForward style={{ width: isLandscapeMode ? 40 : 50, height: isLandscapeMode ? 40 : 50 }} />
            </button>
          </div>

          {/* Exercise Name */}
          <div 
            className="text-center font-bold text-[#353E45]"
            style={{ fontSize: isLandscapeMode ? '1rem' : '2rem' }}
          >
            {currentExerciseInfo.name}
          </div>

          {/* Exercise Goal (for routine type) */}
          {idType === 'routine' && (
            <div 
              className="text-center font-normal text-[#353E45]"
              style={{ fontSize: isLandscapeMode ? '1rem' : '1.5rem' }}
            >
              {currentExerciseInfo.goal}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DemoExercise




import React, { useEffect, useRef, useState } from 'react'
import { useLandscapeMode } from './useLandscapeMode'

type Props = { angle: number; minAngle?: number; maxAngle?: number }

export const AngleMeter: React.FC<Props> = ({ angle = 180, minAngle = 90, maxAngle = 170 }) => {
  const isLandscapeMode = useLandscapeMode()
  const [displayedAngle, setDisplayedAngle] = useState(maxAngle)
  const [widthPercentage, setWidthPercentage] = useState(0)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const animate = () => {
      const normalizedWidth = 100 - ((Math.max(Math.min(Number(displayedAngle), maxAngle), minAngle) - minAngle) / (maxAngle - minAngle)) * 100
      setWidthPercentage(normalizedWidth)

      setDisplayedAngle(prev => prev + (angle - prev) * 0.1)
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animationRef.current || 0)
  }, [angle, maxAngle, minAngle, displayedAngle])

  if (isLandscapeMode) return null

  return (
    <div className="flex flex-col w-1/2 h-full">
      <div className="font-bold text-white text-left" style={{ fontSize: isLandscapeMode ? '1.2rem' : '1.5rem' }}>
        {`${Math.round(widthPercentage)}% Posture corrects`}
      </div>
      <div className="relative inline-flex items-center w-full border border-white rounded-[15px]">
        <div className="w-full h-[10px] relative flex flex-row justify-start">
          <div className="h-full bg-white rounded-[15px]" style={{ width: `${widthPercentage}%`, transition: 'width 0.1s ease' }} />
        </div>
      </div>
    </div>
  )
}

export default AngleMeter




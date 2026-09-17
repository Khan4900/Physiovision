import React, { useEffect, useState } from 'react'
import { useLandscapeMode } from './useLandscapeMode'

type Props = {
  title?: string
  count: number
  target?: number
  onComplete?: () => void
}

export const Counter: React.FC<Props> = ({ title = 'Counter', count, target = 0, onComplete }) => {
  const isLandscapeMode = useLandscapeMode()
  const [completed, setCompleted] = useState(true)

  useEffect(() => {
    if (count < target) setCompleted(false)
    if (target && count >= target && onComplete && !completed) {
      onComplete()
      setCompleted(true)
    }
  }, [count, target, onComplete, completed])

  return (
    <div className="font-bold text-white">
      <div className="font-normal text-center" style={{ fontSize: isLandscapeMode ? '1rem' : '1.2rem' }}>
        {title}
      </div>
      <div className="flex items-center justify-center">
        <div className="font-bold text-center" style={{ fontSize: isLandscapeMode ? '1.5rem' : '2.5rem' }}>
          {count}
        </div>
        <div className="font-bold text-center ml-2" style={{ fontSize: isLandscapeMode ? '1.5rem' : '2.5rem' }}>
          {target ? `/ ${target}` : ''}
        </div>
      </div>
    </div>
  )
}

export default Counter




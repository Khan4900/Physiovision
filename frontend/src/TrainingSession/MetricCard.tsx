import React from 'react'
import { useLandscapeMode } from './useLandscapeMode'

type MetricCardProps = {
  value?: number
  title?: string
  color?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({ value = 0, title = 'N/A', color = 'white' }) => {
  const isLandscapeMode = useLandscapeMode()
  return (
    <div className="bg-transparent">
      <div className="text-center m-0 p-0">
        <div
          className="font-bold"
          style={{ color, fontSize: isLandscapeMode ? '1.5rem' : '2.8rem' }}
        >
          {value}
        </div>
        <div className="text-sm" style={{ color }}>{title}</div>
      </div>
    </div>
  )
}

export default MetricCard




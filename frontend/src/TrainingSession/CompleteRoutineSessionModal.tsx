import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLandscapeMode } from './useLandscapeMode'
import MetricCard from './MetricCard'
import VideoModal from './VideoModal'

type Props = {
  open?: boolean
  sessionType?: 'routine' | 'basic'
  onComplete: () => void
  mins?: number
  calorie?: number
  score?: number
  videoURL?: string
}

export const CompleteRoutineSessionModal: React.FC<Props> = ({
  open = false,
  sessionType = 'routine',
  onComplete,
  mins = 0,
  calorie = 0,
  score = 0,
  videoURL = ''
}) => {
  const isLandscapeMode = useLandscapeMode()
  const navigate = useNavigate()
  const [isOpenVideoModal, setIsOpenVideoModal] = useState(false)

  const handleComplete = () => {
    onComplete()
    navigate('/exerciselibrary')
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-white" style={{ backgroundImage: 'url(/assets/bg_light.png)', backgroundSize: 'cover' }} />
        <div className="relative z-10 flex flex-col items-center justify-center gap-8 w-full max-w-md">
          <div className="flex flex-col items-center gap-3">
            <img src="../src/assets/completed.svg" alt="Completed Exercise" className={isLandscapeMode ? 'max-h-20' : 'max-h-24'} />
            <div className="text-center" style={{ width: 450 }}>
              {sessionType === 'routine' ? (
                <div className="text-gray-800 text-lg">
                  Yay! You’ve completed exercising
                  <br />
                  Let’s see what you’ve achieved today!
                </div>
              ) : (
                <div className="text-gray-800 text-lg">
                  Awesome! You’ve nailed the basics — now you’re ready to take on more with confidence!
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-10" style={{ width: 450 }}>
            <div className="flex flex-col items-center">
              <img src="../src/assets/mins.svg" alt="mins" className="w-[45px] h-[45px] mb-1" />
              <MetricCard title="Mins" color="black" value={mins} />
            </div>
            <div className="flex flex-col items-center">
              <img src="../src/assets/calories.svg" alt="calories" className="w-[37px] h-[44px] mb-1" />
              <MetricCard title="Calories" color="black" value={calorie} />
            </div>
            <div className="flex flex-col items-center">
              <img src="../src/assets/score.svg" alt="score" className="w-[45px] h-[45px] mb-1" />
              <MetricCard title="Score" color="black" value={score} />
            </div>
          </div>

          <div className={`flex ${isLandscapeMode ? 'flex-col' : 'sm:flex-row'} gap-4`}>
            {videoURL && (
              <button className="w-[250px] border border-gray-300 rounded-md py-2 hover:bg-gray-100" onClick={() => setIsOpenVideoModal(true)}>
                View Recording
              </button>
            )}
            <button className="w-[250px] bg-black text-white rounded-md py-2 hover:bg-gray-800" onClick={handleComplete}>
              View My Program
            </button>
          </div>
        </div>
      </div>

      <VideoModal open={isOpenVideoModal} onClose={() => setIsOpenVideoModal(false)} videoURL={videoURL} />
    </>
  )
}

export default CompleteRoutineSessionModal




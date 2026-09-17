import React from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

export const ExitRoutineSessionModal: React.FC<Props> = ({ open, onClose, onComplete }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-[450px] p-4 flex flex-col items-center gap-2">
        <button aria-label="close" className="absolute right-2 top-2 p-2 rounded hover:bg-gray-100" onClick={onClose}>✕</button>
        <img src="../src/assets/exit_confirm.svg" alt="Exit confirmation" />
        <p className="text-center">
          You haven&apos;t completed the Exercise yet!
          <br />
          Do you want to continue finishing today&apos;s goal?
        </p>
        <p className="text-center text-sm">Your progress will not be saved if you stop exercising now.</p>
        <div className="flex flex-row gap-2 w-full justify-center">
          <button className="px-4 py-2 rounded-md bg-white border" onClick={onComplete}>Exit</button>
          <button className="px-4 py-2 rounded-md bg-black text-white" onClick={onClose}>Continue</button>
        </div>
      </div>
    </div>
  )
}

export default ExitRoutineSessionModal




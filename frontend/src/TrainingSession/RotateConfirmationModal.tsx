import React from 'react'

type Props = {
  open: boolean
  onClose: () => void
}

export const RotateConfirmationModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-[90%] max-w-[450px] p-4 flex flex-col items-center gap-2">
        <button aria-label="close" className="absolute right-2 top-2 p-2 rounded hover:bg-gray-100" onClick={onClose}>✕</button>
        <img src="../src/assets/rotate_confirm.svg" alt="Rotate confirmation" />
        <p className="text-center text-lg">Please rotate your phone to start exercising</p>
        <p className="text-center">Some information will not be displayed as there is mobile screen size limit. We recommend using your desktop browser to have the best experience.</p>
        <div className="flex flex-row gap-2 w-full justify-center">
          <button className="px-4 py-2 rounded-md bg-black text-white" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  )
}

export default RotateConfirmationModal




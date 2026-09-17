import React, { useEffect, useState } from 'react'

type VideoModalProps = {
  open: boolean
  onClose: () => void
  videoURL?: string
}

export const VideoModal: React.FC<VideoModalProps> = ({ open, onClose, videoURL }) => {
  const [signedVideoURL, setSignedVideoURL] = useState<string | null>(null)

  useEffect(() => {
    if (!videoURL || !open) return
    // Backend fetch commented out per requirements
    // const { data } = await supabase.storage.from('Training Videos').createSignedUrl(videoURL, 60)
    // setSignedVideoURL(data?.signedUrl ?? null)
    setSignedVideoURL(videoURL)
  }, [videoURL, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => {
        setSignedVideoURL(null)
        onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-gray-100 rounded-lg p-2 w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-end p-1">
          <button className="p-2 rounded hover:bg-gray-200" onClick={() => { setSignedVideoURL(null); onClose() }}>✕</button>
        </div>
        <div className="flex justify-center items-center p-2 w-full h-full">
          {signedVideoURL ? (
            <video autoPlay width="100%" height="100%" controls>
              <source src={signedVideoURL} type="video/webm" />
            </video>
          ) : (
            <p>Loading video...</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoModal




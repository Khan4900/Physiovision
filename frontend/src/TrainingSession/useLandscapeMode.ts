import { useEffect, useState } from 'react'

export const useLandscapeMode = () => {
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false
  )

  const isMediumScreen = typeof window !== 'undefined' ? window.innerWidth <= 768 : false

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMediumScreen && isLandscape
}




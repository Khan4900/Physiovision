import React from 'react'

type Props = { color?: boolean }

export const Logo: React.FC<Props> = ({ color = true }) => {
  return (
    <img
      src={color ? '../src/assets/Physiovision.png' : '../src/assets/logo.png'}
      alt="BodyBuddy"
      className="absolute top-[25px] left-[25px] w-[100px] h-[100px] object-contain z-[1500]"
    />
  )
}

export default Logo




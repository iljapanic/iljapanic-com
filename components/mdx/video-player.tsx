'use client'

import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  url: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="player-wrapper my-8">
      {isLoaded ? (
        <ReactPlayer
          src={url}
          controls={true}
          width="100%"
          height="100%"
          light={true}
          className="react-player"
        />
      ) : null}
    </div>
  )
}

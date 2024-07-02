import React from 'react'
import NextImage from 'next/image'

interface ImageProps {
  src: string
  alt: string
  width: number
  height: number
}

export const Image: React.FC<ImageProps> = ({ src, alt, width, height }) => {
  return <NextImage src={src} alt={alt} width={width} height={height} />
}

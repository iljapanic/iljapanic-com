import React from 'react'

interface SoundcloudProps {
  url: string
}

export const Soundcloud: React.FC<SoundcloudProps> = ({ url }) => {
  const width = '100%'
  const height = '480px'
  const autoPlay = false
  const hideRelated = false
  const showComments = false
  const showUser = true
  const showReposts = false
  const visual = false
  const color = '000000'
  const showTeaser = true

  const src = visual
    ? `https://w.soundcloud.com/player/?url=${url}&amp;auto_play=${autoPlay}&amp;hide_related=${hideRelated}&amp;show_comments=${showComments}&amp;show_user=${showUser}&amp;show_reposts=${showReposts}&amp;visual=${visual}`
    : `https://w.soundcloud.com/player/?url=${url}&amp;color=${color}&amp;auto_play=${autoPlay}&amp;hide_related=${hideRelated}&amp;show_comments=${showComments}&amp;show_user=${showUser}&amp;show_reposts=${showReposts}&amp;show_teaser=${showTeaser}`

  const urlParts = url.split('/')
  const urlTitle = urlParts[urlParts.length - 1]

  return (
    <iframe
      title={`soundcloud-embed-${urlTitle}`}
      width={width}
      height={height}
      src={src}
      className="mb-8 mt-4"
    />
  )
}

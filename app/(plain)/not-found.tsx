import Image from 'next/image'

import { PostHeader } from '@/components/post/post-header'
import Link from 'next/link'

export const metadata = {
	title: '404',
}

export default function NotFound() {
	return (
		<article className="post-wrapper mx-auto">
			<PostHeader title="404 – Page Not Found" />

			<p>
				You just hit a route that doesn&apos;t seem to exist on this site. I may have
				moved things around during a redesign, or it never existed in the first
				place. Your best bet is to go back to the <Link href="/">homepage</Link>{' '}
				and start looking from there.
			</p>
		</article>
	)
}

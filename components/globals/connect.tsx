import { cn } from '@/lib/utils'
import Image from 'next/image'

import profilePic from '@/public/images/iljapanic.jpg'

export function Connect({ className }: { className?: string }) {
	return (
		<div className={cn(className)}>
			<h2>Connect</h2>
			<p>
				Reach me at{' '}
				<a href="https://twitter.com/iljapanic" target="_blank">
					@iljapanic
				</a>{' '}
				or <a href="mailto:hey@iljapanic.com">hey@iljapanic.com</a>
			</p>
			<Image
				src={profilePic}
				alt="Ilja Panic"
				className="mt-6 h-20 w-20 rounded-full"
			/>
		</div>
	)
}

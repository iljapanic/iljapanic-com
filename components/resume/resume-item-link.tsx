import type { ResumeItemLinkType } from '@/types'

export function ResumeItemLink({ link }: { link: ResumeItemLinkType }) {
	return (
		<a
			href={link.url}
			className="block space-y-0.5 no-underline"
			target="_blank"
			rel="noopener noreferrer"
		>
			<div className="text-xs text-muted-foreground">{link.headline}</div>
			<h4 className="text-xs">{link.title}</h4>
			<p className="text-xs text-muted-foreground">{link.description}</p>
		</a>
	)
}

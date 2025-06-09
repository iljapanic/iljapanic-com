/* create typescript types */

import { cn } from '@/lib/utils'

interface ResumeSectionProps {
	title: string
	children: React.ReactNode
	titleClassName?: string
}

export default function ResumeSection({
	title,
	children,
	titleClassName,
}: ResumeSectionProps) {
	return (
		<section className="mt-20 border-b border-border/20 pb-16 last:border-b-0">
			<div className="">
				<h2 className={cn(titleClassName)}>{title}</h2>
			</div>
			<div className="mt-8">{children}</div>
		</section>
	)
}

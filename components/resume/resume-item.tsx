// import Markdown from 'markdown-to-jsx'

import { getYear, convertDate, getDuration, getTodayString } from '@/lib/utils'
import type { ResumeItemType } from '@/types'
import { v4 } from 'uuid'
import { ResumeItemLink } from './resume-item-link'
import { ResumeItemAttachment } from './resume-item-attachment'
import ResumeItemDescription from '@/components/resume/resume-item-description'
import Image from 'next/image'

export default function ResumeItem({
	item,
	itemType,
}: {
	item: ResumeItemType
	itemType: 'work' | 'education' | 'volunteering'
}) {
	const { name, location, items, type, attachments, logoFilename, url } = item

	return (
		<section className="relative flex items-start gap-4">
			{/* <div className="absolute -left-4 w-0.5 h-full bg-gray-100"></div> */}

			{/* logo */}
			<div className="h-12 w-12 flex-shrink-0">
				{logoFilename && url && (
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="block no-underline"
					>
						<Image
							src={`/images/logos/${logoFilename}`}
							alt={name}
							width={48}
							height={48}
							className="h-full w-full rounded border border-border/20 object-cover"
						/>
					</a>
				)}
			</div>

			<div className="space-y-4">
				{items &&
					items.map((item, itemIndex) => {
						const isActive = item.isActive || false

						return (
							<article key={itemIndex}>
								{/* header */}
								<header>
									{itemIndex === 0 && (
										<div className="text-sm text-muted-foreground">
											<span>{name}</span>
											{location && <span> · {location}</span>}
											{type && <span> · {type}</span>}
										</div>
									)}
									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<h3 className="mb-0 mt-1">{item.title}</h3>
										<div>
											<Duration
												itemType={itemType}
												startDate={item.startDate}
												endDate={item.endDate}
												isActive={isActive}
											/>
										</div>
									</div>
								</header>

								{/* body */}
								<div className="mt-2">
									<ResumeItemDescription
										description={item.description}
										maxLines={2}
									/>
								</div>

								{/* links */}
								{/* {item.links && item.links.length > 0 && (
									<section className="mt-2 grid gap-2 lg:grid-cols-3 lg:gap-4">
										{item.links.map((link) => {
											const id = v4()
											return <ResumeItemLink key={id} link={link} />
										})}
									</section>
								)} */}

								{/* attachments */}
								{/* {item.attachments && item.attachments.length > 0 && (
									<section className="mt-4 grid grid-cols-3 gap-4 lg:grid-cols-4">
										{item.attachments.map((attachment) => {
											const id = v4()
											return (
												<ResumeItemAttachment
													key={id}
													attachment={attachment}
												/>
											)
										})}
									</section>
								)} */}
							</article>
						)
					})}
			</div>
		</section>
	)
}

function Duration({
	itemType,
	startDate,
	endDate,
	isActive = false,
}: {
	itemType: string
	startDate: string
	endDate: string
	isActive: boolean
}) {
	return (
		<div className="text-sm text-muted-foreground">
			{/* dates - work */}
			{itemType === 'work' && !isActive && (
				<time className="inline-block">
					{convertDate(startDate)} - {convertDate(endDate)}
				</time>
			)}
			{itemType === 'work' && isActive && (
				<time className="inline-block">
					{convertDate(startDate)} - {' now '}
				</time>
			)}
			{/* dates - education */}
			{itemType === 'education' && !isActive && (
				<time className="inline-block">
					{getYear(startDate) === getYear(endDate)
						? getYear(startDate)
						: `${getYear(startDate)} - ${getYear(endDate)}`}
				</time>
			)}
		</div>
	)
}

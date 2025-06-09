import type { ResumeItemAttachmentType } from '@/types'

export function ResumeItemAttachment({
	attachment,
}: {
	attachment: ResumeItemAttachmentType
}) {
	switch (attachment.type) {
		case 'link':
			return (
				<AttachmentWrapper>
					<a href={attachment.url}>
						<div className="text-2xs">{attachment.headline}</div>
						<h4 className="text-xs">{attachment.title}</h4>
					</a>
				</AttachmentWrapper>
			)
		case 'image':
			return (
				<AttachmentWrapper>
					<img src={attachment.url} alt={attachment.title || ''} />
				</AttachmentWrapper>
			)
		case 'video':
			return (
				<AttachmentWrapper>
					<video src={attachment.url} controls></video>
				</AttachmentWrapper>
			)
	}
}

function AttachmentWrapper({ children }: { children: React.ReactNode }) {
	return <div className="relative rounded border">{children}</div>
}

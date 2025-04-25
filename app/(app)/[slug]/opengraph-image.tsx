import { ImageResponse } from 'next/og'
import { allDocuments } from 'contentlayer/generated'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

export const size = {
	width: 1200,
	height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
	const post = allDocuments.find((post) => post.slug === params.slug)

	// If no post is found, return a default image
	const title = post?.title || 'Page not found'

	// Read the profile image
	const profileImageData = await readFile(
		join(process.cwd(), 'public/images/iljapanic.jpg'),
	)
	const profileImageSrc = `data:image/jpeg;base64,${profileImageData.toString('base64')}`

	const fgColor1 = '#191918'
	const fgColor2 = '#494844'
	const fgColor3 = '#7C7B74'
	const bgColor = '#EEEEEC'

	return new ImageResponse(
		(
			<div
				style={{
					background: bgColor,
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '40px',
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						flex: 1,
						width: '100%',
					}}
				>
					<div
						style={{
							fontSize: post?.subtitle ? 46 : 56,
							fontWeight: 'medium',
							color: fgColor1,
							textAlign: 'left',
							marginBottom: '20px',
						}}
					>
						{title}
					</div>
					{post?.subtitle && (
						<div
							style={{
								fontSize: 28,
								color: fgColor2,
								textAlign: 'left',
							}}
						>
							{post.subtitle}
						</div>
					)}
				</div>

				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						width: '100%',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<img
							src={profileImageSrc}
							width={72}
							height={72}
							style={{
								borderRadius: '50%',
								marginRight: '24px',
							}}
						/>
						<div style={{ fontSize: 32, color: fgColor3 }}>Ilja Panic</div>
					</div>

					<div
						style={{
							fontSize: 20,
							color: fgColor3,
							display: 'flex',
							alignItems: 'center',
						}}
					>
						iljapanic.com
					</div>
				</div>
			</div>
		),
		{
			...size,
		},
	)
}

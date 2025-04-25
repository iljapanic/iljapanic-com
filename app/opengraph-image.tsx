import { ImageResponse } from 'next/og'

export const size = {
	width: 1200,
	height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
	// If no post is found, return a default image
	const title = 'Ilja Panic'
	const subtitle = 'Technologist, Designer & Information Ecologist'

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
							fontSize: 46,
							fontWeight: 'medium',
							color: fgColor1,
							textAlign: 'left',
							marginBottom: '20px',
						}}
					>
						{title}
					</div>

					<div
						style={{
							fontSize: 28,
							color: fgColor2,
							textAlign: 'left',
						}}
					>
						{subtitle}
					</div>
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
							src="https://iljapanic.com/images/iljapanic.jpg"
							width={72}
							height={72}
							style={{
								borderRadius: '50%',
								marginRight: '24px',
							}}
						/>
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

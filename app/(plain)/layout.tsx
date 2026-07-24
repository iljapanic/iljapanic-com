import { SharedLayout } from '@/app/shared-layout'

export const metadata = {
	metadataBase: new URL('https://iljapanic.com'),
	title: {
		default: 'Ilja Panic',
		template: '%s · Ilja Panic',
	},
	description: 'Designer & Technologist',
	keywords:
		'Ilja Panic, information ecologist, information designer, knowledge management, design technologist, designer and technologist',
	author: 'Ilja Panic',
	openGraph: {
		title: 'Ilja Panic',
		description: 'Designer & Technologist',
		type: 'website',
		authors: ['Ilja Panic'],
	},
}

export default function SiteLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <SharedLayout>{children}</SharedLayout>
}

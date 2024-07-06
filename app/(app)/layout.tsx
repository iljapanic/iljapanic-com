import { SharedLayout } from '@/app/shared-layout'
import { Footer } from '@/components/globals/footer'
import { Header } from '@/components/globals/header'

export const metadata = {
	title: {
		default: 'Ilja Panic',
		template: '%s · Ilja Panic',
	},
	description: 'Designer & Technologist',
	keywords: 'Ilja Panic, design technologist, designer and technologist',
	author: 'Ilja Panic',
	openGraph: {
		title: 'Ilja Panic',
		description: 'Design & Technologist',
		type: 'website',
		authors: ['Ilja Panic'],
	},
}

export default function SiteLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<SharedLayout>
			{/* top gradient  */}
			<div className="sticky top-0 z-20 h-16 w-full bg-gradient-to-b from-background from-10% to-transparent"></div>

			{/* header */}
			<Header />

			{/* main content */}
			<main className="container">{children}</main>

			{/* footer */}
			<Footer />

			{/* bottom gradient  */}
			<div className="sticky bottom-0 z-20 h-8 w-full bg-gradient-to-t from-background from-10% to-transparent"></div>
		</SharedLayout>
	)
}

import { SharedLayout } from '@/app/shared-layout'

export const metadata = {
	title: {
		default: 'Admin',
		template: '%s · Admin',
	},
	robots: {
		index: false,
		follow: false,
	},
}

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<SharedLayout>
			<main className="container mx-auto max-w-3xl py-12">{children}</main>
		</SharedLayout>
	)
}

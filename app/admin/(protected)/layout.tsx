import { AdminNav } from '@/components/admin/admin-nav'
import { requireAdmin } from '@/lib/admin'

export default async function ProtectedAdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const session = await requireAdmin()

	return (
		<>
			<AdminNav email={session.user.email} />
			{children}
		</>
	)
}

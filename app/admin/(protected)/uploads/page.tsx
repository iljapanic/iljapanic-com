import { ImageUploadField } from '@/components/admin/image-upload-field'
import { requireAdmin } from '@/lib/admin'

export const metadata = {
	title: 'Upload test',
}

export default async function AdminUploadsPage() {
	await requireAdmin()

	return (
		<section className="flex max-w-md flex-col gap-6">
			<h1 className="text-2xl font-medium">Upload test</h1>
			<ImageUploadField name="url" folder="test" />
		</section>
	)
}

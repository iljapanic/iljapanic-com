import { redirect } from 'next/navigation'

import Resume from '@/components/resume/resume'

import '@/styles/print.css'

export default async function CV({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined }
}) {
	// Check if access parameter is 'welcome'
	if (searchParams.s !== 'welcome') {
		redirect('/')
	}

	return <Resume />
}

import { redirect } from 'next/navigation'

import Resume from '@/components/resume/resume'

import '@/styles/print.css'

export default async function CV({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	const { s } = await searchParams

	// Check if access parameter is 'welcome'
	if (s !== 'welcome') {
		redirect('/')
	}

	return <Resume />
}

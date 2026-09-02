import { Resend } from 'resend'

export async function sendEmail({
	to,
	subject,
	text,
}: {
	to: string
	subject: string
	text: string
}): Promise<string> {
	const apiKey = process.env.RESEND_API_KEY
	if (!apiKey) {
		throw new Error('RESEND_API_KEY is not set')
	}

	const from = process.env.RESEND_FROM_EMAIL
	if (!from) {
		throw new Error('RESEND_FROM_EMAIL is not set')
	}

	const resend = new Resend(apiKey)
	const { data, error } = await resend.emails.send({ from, to, subject, text })

	if (error) {
		throw new Error(`Resend: ${error.message}`)
	}

	if (!data) {
		throw new Error('Resend: no response data')
	}

	return data.id
}

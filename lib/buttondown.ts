'use server'

/**
 * Buttondown API helper
 */

type SubscriptionError = {
	code: string
	message: string
}

type SubscriptionResult = {
	success: boolean
	message?: string
	error?: SubscriptionError
}

/**
 * Add a subscriber to Buttondown
 */
export async function subscribeToNewsletter(
	email: string,
): Promise<SubscriptionResult> {
	if (!email) {
		return {
			success: false,
			error: {
				code: 'invalid_email',
				message: 'Email address is required',
			},
		}
	}

	// Ensure API key is available
	const apiKey = process.env.BUTTONDOWN_API_KEY

	if (!apiKey) {
		console.error('BUTTONDOWN_API_KEY is not defined')
		return {
			success: false,
			error: {
				code: 'configuration_error',
				message: 'API key is not configured',
			},
		}
	}

	try {
		const response = await fetch('https://api.buttondown.com/v1/subscribers', {
			method: 'POST',
			headers: {
				Authorization: `Token ${apiKey}`,
				'Content-Type': 'application/json',
				'X-Buttondown-Collision-Behavior': 'overwrite', // Allow updating existing subscribers
			},
			body: JSON.stringify({
				email_address: email,
			}),
		})

		// Handle different response statuses
		if (response.status === 201) {
			return {
				success: true,
				message: 'Subscription successful! Please check your email to confirm.',
			}
		} else {
			const data = await response.json()
			// console.log(data)

			if (data.code === 'email_already_exists') {
				const message = data.detail?.includes(
					'but has not confirmed their email',
				)
					? 'You have already subscribed but has not confirmed their subscription. Please check your email for the confirmation link.'
					: 'This email is already subscribed to the newsletter.'

				return {
					success: false,
					error: {
						code: 'email_already_exists',
						message,
					},
				}
			}
			return {
				success: false,
				error: {
					code: `api_error_${response.status}`,
					message: 'Failed to subscribe. Please try again later.',
				},
			}
		}
	} catch (error) {
		console.error('Newsletter subscription error:', error)
		return {
			success: false,
			error: {
				code: 'network_error',
				message: 'Network error occurred. Please try again later.',
			},
		}
	}
}

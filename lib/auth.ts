import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { magicLink } from 'better-auth/plugins'
import { db } from '@/db'
import { isAllowedEmail } from '@/lib/admin'
import { sendEmail } from '@/lib/email'

const secret = process.env.BETTER_AUTH_SECRET
if (!secret) {
	throw new Error('BETTER_AUTH_SECRET is not set')
}

export const auth = betterAuth({
	secret,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: false },
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					if (!isAllowedEmail(user.email)) {
						throw new APIError('FORBIDDEN', {
							message: 'This email is not allowed',
						})
					}
					return { data: user }
				},
			},
		},
	},
	plugins: [
		magicLink({
			expiresIn: 60 * 15,
			sendMagicLink: async ({ email, url, token }, ctx) => {
				if (!isAllowedEmail(email)) {
					// The plugin stores the verification row before calling us;
					// remove it so non-admin addresses never leave a usable token.
					await ctx?.context.internalAdapter.deleteVerificationByIdentifier(
						token,
					)
					console.warn('magic link requested for non-admin email')
					return
				}
				const id = await sendEmail({
					to: email,
					subject: 'Sign in to iljapanic.com admin',
					text: `Sign in: ${url}\n\nThis link expires in 15 minutes.`,
				})
				console.info(`magic link email sent (resend id ${id})`)
			},
		}),
		nextCookies(), // must be last
	],
})

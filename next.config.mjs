/** @type {import('next').NextConfig} */

import createMDX from '@next/mdx'
import { withContentlayer } from 'next-contentlayer2'
import { withPlausibleProxy } from 'next-plausible'

const nextConfig = withPlausibleProxy()({
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn.simpleicons.org',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'iljapanic-com.s3.eu-central-1.amazonaws.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'www.google.com',
				pathname: '**',
			},
		],
	},
	async redirects() {
		return redirects
	},
})

const withMDX = createMDX({
	// Add markdown plugins here, as desired
})

export default withMDX(withContentlayer(nextConfig))

/* redirects */
const redirects = [
	/* external */
	{
		source: '/wishlist',
		destination:
			'https://iljapanic.notion.site/de8064e9359e4906b8e4571fa90361bc?v=9c13a84e76f2483cb03b3d30c155b997&pvs=4',
		permanent: false,
	},
	{
		source: '/meet',
		destination: 'https://cal.com/iljapanic/meet',
		permanent: false,
	},
	{
		source: '/x',
		destination: 'https://twitter.com/iljapanic',
		permanent: false,
	},
	{
		source: '/linkedin',
		destination: 'https://www.linkedin.com/in/iljapanic/',
		permanent: false,
	},

	/* pages */
	{
		source: '/music',
		destination: '/listen',
		permanent: true,
	},

	/* essays -> {root}  */
	{
		source: '/essays',
		destination: '/articles',
		permanent: true,
	},
	{
		source: '/essays/:slug*',
		destination: '/:slug*',
		permanent: true,
	},
	{
		source: '/essays/cyberbiomes/',
		destination: '/cyberbiomes',
		permanent: true,
	},
	{
		source: '/essays/citizen-first-ux/',
		destination: '/citizen-first-ux',
		permanent: true,
	},
	{
		source: '/essays/china-sharp-eyes/',
		destination: '/china-sharp-eyes',
		permanent: true,
	},
	{
		source: '/essays/critical-public-art/',
		destination: '/critical-public-art',
		permanent: true,
	},
	{
		source: '/essays/going-beyond-hci/',
		destination: '/going-beyond-hci',
		permanent: true,
	},
	{
		source: '/essays/not-so-smart-city/',
		destination: '/not-so-smart-city',
		permanent: true,
	},
]

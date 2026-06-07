import PlausibleProvider from 'next-plausible'
import { Newsreader } from 'next/font/google'
import localFont from 'next/font/local'

import { ThemeProvider } from '@/components/globals/theme-provider'
import { Toaster } from '@/components/ui/sonner'

import '@/styles/globals.css'

const serifFont = Newsreader({
	subsets: ['latin-ext'],
	variable: '--font-serif',
	display: 'swap',
	style: ['normal', 'italic'],
})

const innovatorGrotesk = localFont({
	src: '../styles/fonts/InnovatorGroteskVF-Thin.woff2',
	display: 'swap',
	variable: '--font-sans',
})

// const inter = Inter({
// 	subsets: ['latin-ext'],
// 	variable: '--font-sans',
// 	display: 'swap',
// })

// const sansFont = inter
const sansFont = innovatorGrotesk

export function SharedLayout({ children }: { children: React.ReactNode }) {
	const plausibleSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC

	return (
		<html lang="en" suppressHydrationWarning>
			<head>{plausibleSrc && <PlausibleProvider src={plausibleSrc} />}</head>
			<body className={`${sansFont.variable} ${serifFont.variable}`}>
				<ThemeProvider>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	)
}

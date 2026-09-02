import { ThemeToggle } from '@/components/globals/theme-toggle'
import { Connect } from '@/components/globals/connect'

export function Footer() {
	return (
		<footer className="container mt-20 pb-0 print:hidden">
			<div className="post-wrapper mx-auto">
				<div className="my-20 text-center tracking-[0.75rem] text-muted-foreground">
					***
				</div>

				<Connect className="mt-4" />

				<div className="mt-20 flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						With care and gusto, from Prague
					</div>
					<div className="-mx-2">
						<ThemeToggle />
					</div>
				</div>
			</div>
		</footer>
	)
}

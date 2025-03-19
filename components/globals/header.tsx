import Link from 'next/link'

export function Header() {
	return (
		<header className="container">
			<div className="post-wrapper mx-auto py-16 leading-none">
				<nav>
					<Link href="/" className="font-medium text-inherit no-underline">
						Ilja Panic
					</Link>
				</nav>
				<p className="mt-1 text-muted-foreground">Information Ecologist</p>
			</div>
		</header>
	)
}

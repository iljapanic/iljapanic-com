import React from 'react'

interface QuoteProps {
	children: React.ReactNode
	author: string
	url?: string
}

export const Quote: React.FC<QuoteProps> = ({ children, author, url }) => {
	let authorEl

	if (author) {
		authorEl = <span>{author}</span>
	}

	if (url) {
		authorEl = (
			<a href={url} target="_blank" rel="noreferrer">
				{author}
			</a>
		)
	}

	return (
		<blockquote className={`my-8 border-none pl-0`}>
			<div className="border-l-2 border-border pl-4 font-serif text-base italic text-foreground/50">
				{children}
			</div>
			<footer className="mt-1 text-right text-sm text-foreground/50">
				<cite className="font-sans not-italic">— {authorEl}</cite>
			</footer>
		</blockquote>
	)
}

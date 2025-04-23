---
title: MDX Sample
publishedAt: 2024-03-01
isPublished: true
---

# h1 Heading

## h2 Heading

### h3 Heading

#### h4 Heading

## Paragraph

Vestibulum id ligula porta felis euismod semper. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.

## Emphasis

**This is bold text**

_This is italic text_

~~Strikethrough~~

==Marked hopefully==

==Marked hopefully==

<mark>Marked text</mark>

## Blockquotes

> Vestibulum id ligula porta felis euismod semper. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.

## Horizontal Rules

---

## Lists

### Unordered

- Create a list by starting a line with `+`, `-`, or `*`
- Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    - Ac tristique libero volutpat at
    - Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit

### Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa

## Code

Here is some `inline code`

Here is a `.js` code sample with syntax highlighting:

```js
export default function PostWrapper({ children }) {
	return <article className="post">{children}</article>
}
```

You can also include line numbers (and highlight desired lines):

```js showLineNumbers {3, 7-9}
import Image from 'next/image'

export default function Figure({ src, caption }) {
	return (
		<figure className="w-full max-w-full">
			<Image alt={caption} src={src} layout="fill" />
			<figcaption className="text-center italic text-secondary">
				{caption}
			</figcaption>
		</figure>
	)
}
```

And also display filenames on top:

```js:PostWrapper.js showLineNumbers
export default function PostWrapper({ children }) {
  return <article className="post">{children}</article>
}
```

## Footnote

A note[^1]

[^1]: Big note.

## Strikethrough

~one~ or ~~two~~ tildes.

## Table

| a   | b   |   c |  d  |
| --- | :-- | --: | :-: |

## Tasklist

- [ ] to do
- [x] done

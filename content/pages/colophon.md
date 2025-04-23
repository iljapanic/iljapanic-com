---
title: Colophon
subtitle: A few notes on how this site was made
isPublished: true
---

I've designed and built this site myself. It's seriously overengineered for a personal website. But playing around with transient web technologies is a hobby I like to indulge in the evenings.

The [code is available on Github](https://github.com/iljapanic/iljapanic-com) if you'd like to poke around.

I've started building the current iteration early 2023 and tinker on it regularly. So things might change suddenty and sometimes even break.

As it goes with the personal sites it's a never ending endevour. I typically go througt several iterations, experimenting with unusual designs and approaches, just to end up at the clean and minimal style.

## Build system

Build using Next.js with /app directory structure, leveraging server components.

## Typography

Body fonts uses `ui-serif` and headings are set in `ui-sans-serif`. Using system fonts improves performance and results in smaller footprint. Also, it makes the site look more native to the operating system. Check out ??? to se what renders on different operating systems.

Headings and UI elements are set in `system-ui` font

Body text is set in transitional typefaces based on the OS

> Transitional typefaces are a mix between Old Style and Modern typefaces that was developed during The Enlightenment. One of the most famous examples of a Transitional typeface is Times New Roman, which was developed for the Times of London newspaper.

```css
font-family: Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif;
```

Font sizes are fluid and scale with the viewport width. I've used the [tailwindcss-fluid-type](https://github.com/davidhellmann/tailwindcss-fluid-type) to achieve this.

## Authoring

Uses MDX. It's like good ol’ Markdown but it allows you to use JSX components so you can do things like:

```md
# Markdown heading

Vestibulum id ligula porta felis euismod semper. Sed posuere consectetur est at lobortis.

<Book id="3322" />
```

The above example uses a custom `<Book />` component to fetch and preview a book from Airtable database which results in:

## Styles

I've always prided myself in writing entirely custom CSS for my personal site.

But after using Tailwind on many projects I've realized that maintaining a custom stylesheet and coming up with arbitrary class names is a pain in the ass.

So I've decided to use Tailwind.

Overal, this approach allowed me to focus more time on typography, layout and content, instead of wrangling CSS.

I hope it will allow me to iterate more quickly and lower the friction for implementing new ideas as they come, instead of postponing them forever because my site is so tightly coupled to whatever mindset I had when I originally made the site.

## Inspiration

Inspired by

Inspired by Frank Chimero, Manuel Moreale, and Carl Barenbrug .

Paco Coursey

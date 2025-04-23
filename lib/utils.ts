import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function sortByTitle(array: any[]) {
	array.sort((a, b) => {
		const titleA = a.title.toUpperCase()
		const titleB = b.title.toUpperCase()

		if (titleA < titleB) {
			return -1
		}
		if (titleA > titleB) {
			return 1
		}
		return 0
	})
	return array
}

export function slugify(text: string) {
	text = text.toString().toLowerCase().trim()

	const sets = [
		{ to: 'a', from: '[ÀÁÂÃÄÅÆĀĂĄẠẢẤẦẨẪẬẮẰẲẴẶ]' },
		{ to: 'c', from: '[ÇĆĈČ]' },
		{ to: 'd', from: '[ÐĎĐÞ]' },
		{ to: 'e', from: '[ÈÉÊËĒĔĖĘĚẸẺẼẾỀỂỄỆ]' },
		{ to: 'g', from: '[ĜĞĢǴ]' },
		{ to: 'h', from: '[ĤḦ]' },
		{ to: 'i', from: '[ÌÍÎÏĨĪĮİỈỊ]' },
		{ to: 'j', from: '[Ĵ]' },
		{ to: 'ij', from: '[Ĳ]' },
		{ to: 'k', from: '[Ķ]' },
		{ to: 'l', from: '[ĹĻĽŁ]' },
		{ to: 'm', from: '[Ḿ]' },
		{ to: 'n', from: '[ÑŃŅŇ]' },
		{ to: 'o', from: '[ÒÓÔÕÖØŌŎŐỌỎỐỒỔỖỘỚỜỞỠỢǪǬƠ]' },
		{ to: 'oe', from: '[Œ]' },
		{ to: 'p', from: '[ṕ]' },
		{ to: 'r', from: '[ŔŖŘ]' },
		{ to: 's', from: '[ßŚŜŞŠ]' },
		{ to: 't', from: '[ŢŤ]' },
		{ to: 'u', from: '[ÙÚÛÜŨŪŬŮŰŲỤỦỨỪỬỮỰƯ]' },
		{ to: 'w', from: '[ẂŴẀẄ]' },
		{ to: 'x', from: '[ẍ]' },
		{ to: 'y', from: '[ÝŶŸỲỴỶỸ]' },
		{ to: 'z', from: '[ŹŻŽ]' },
		{ to: '-', from: "[·/_,:;']" },
	]

	sets.forEach((set) => {
		text = text.replace(new RegExp(set.from, 'gi'), set.to)
	})

	text = text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/&/g, '-and-') // Replace & with 'and'
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, '') // Trim - from end of text

	return text
}

export function getCurrentTimeCET() {
	const now = new Date()
	const cetTime = now.toLocaleString('en-US', {
		timeZone: 'Europe/Paris',
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})

	return cetTime
}

export function getDomain(url: string) {
	const domain = new URL(url).hostname
	return domain
}

export function getFaviconUrl(url: string, size: number = 128) {
	const domain = getDomain(url)
	return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
}

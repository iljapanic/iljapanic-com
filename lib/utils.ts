import { format } from 'date-fns'
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

export function getTodayString() {
	const today = new Date()
	const year = today.getFullYear()
	const month = String(today.getMonth() + 1).padStart(2, '0')
	const day = String(today.getDate()).padStart(2, '0')

	const dateString = `${year}-${month}-${day}`

	return dateString
}

export function convertDate(inputDate: string) {
	const outputDate = format(new Date(inputDate), 'MMM yyyy')
	return outputDate
}

export function getDuration(startDate: string, endDate: string) {
	const start = new Date(startDate)
	const end = new Date(endDate)
	const duration = +end - +start

	const years = Math.floor(duration / (365 * 24 * 60 * 60 * 1000))
	const months = Math.floor(
		(duration % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000),
	)

	let durationString = ''
	if (years > 0) {
		durationString += years + (years === 1 ? ' yr ' : ' yrs ')
	}
	if (months > 0) {
		durationString += months + (months === 1 ? ' mo' : ' mos')
	}

	return durationString.trim()
}

export function getYear(inputDate: string) {
	const outputDate = format(new Date(inputDate), 'yyyy')
	return outputDate
}

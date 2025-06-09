import fs from 'fs'
import path from 'path'

type DataType = 'education' | 'work' | 'projects' | 'volunteering'

export function getResumeData(dataType: DataType) {
	const filePath = path.join(process.cwd(), 'data', resolvePath(dataType))
	const fileContents = fs.readFileSync(filePath, 'utf8')
	const data = JSON.parse(fileContents)
	return data
}

function resolvePath(dataType: DataType) {
	switch (dataType) {
		case 'education':
			return '../data/education.json'
		case 'work':
			return '../data/work.json'
		case 'projects':
			return '../data/projects.json'
		case 'volunteering':
			return '../data/volunteering.json'
	}
}

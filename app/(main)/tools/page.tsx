import { Tool } from '@/components/tools/tool'
import { PostHeader } from '@/components/post/post-header'
import { keystaticReader } from '@/lib/keystatic-reader'

const title = 'Tools'
const subtitle = 'My favorite tools and resources'

export const metadata = {
	title: title,
	description: subtitle,
}

export default async function Page() {
	// const nonFiction = await booksNonFiction
	// const fiction = await booksFiction

	const tools = await keystaticReader.singletons.toolbox.read()

	return (
		<div>
			<div className="post-wrapper mx-auto">
				<PostHeader title={title} subtitle={subtitle} />
			</div>

			<div className="post-wrapper mx-auto mt-12">
				{tools &&
					tools.sections.map((section) => (
						<div key={section.sectionTitle}>
							<h2>{section.sectionTitle}</h2>
							<div className="space-y-6">
								{section.tools.map((tool) => (
									<Tool key={tool} slug={tool} />
								))}
							</div>
						</div>
					))}
			</div>
		</div>
	)
}

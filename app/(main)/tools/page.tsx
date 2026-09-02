import { Tool } from '@/components/tools/tool'
import { PostHeader } from '@/components/post/post-header'
import { getToolSections } from '@/lib/tools'

const title = 'Tools'
const subtitle = 'My favorite tools and resources'

export const metadata = {
	title: title,
	description: subtitle,
}

export const dynamic = 'force-dynamic'

export default async function Page() {
	const sections = await getToolSections()

	return (
		<div>
			<div className="post-wrapper mx-auto">
				<PostHeader title={title} subtitle={subtitle} />
			</div>

			<div className="post-wrapper mx-auto mt-12">
				{sections.map((section) => (
					<div key={section.id}>
						<h2>{section.title}</h2>
						<div className="space-y-6">
							{section.tools.map((tool) => (
								<Tool key={tool.slug} tool={tool} />
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

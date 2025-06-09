import { v4 } from 'uuid'
import Image from 'next/image'
import { redirect } from 'next/navigation'

import { getResumeData } from '@/lib/resume'
import type { ResumeItemType } from '@/types'

import BioMdx from '@/content/snippets/bio.mdx'

import ResumeSection from '@/components/resume/resume-section'
import ResumeItem from '@/components/resume/resume-item'

import profilePic from '@/public/images/iljapanic.jpg'

export default async function CV({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined }
}) {
	// Check if access parameter is 'welcome'
	if (searchParams.s !== 'welcome') {
		redirect('/')
	}

	const work = await getResumeData('work')
	const education = await getResumeData('education')
	const volunteering = await getResumeData('volunteering')

	return (
		<div className="post-wrapper mx-auto">
			<div className="size-40">
				<Image
					src={profilePic}
					alt="Ilja Panic profile picture"
					width={300}
					height={300}
					className="object-fit"
				/>
			</div>

			{/* SUMMARY */}
			<ResumeSection
				title="Curriculum Vitae"
				titleClassName="italic font-serif font-medium"
			>
				<div>
					<BioMdx />
				</div>
			</ResumeSection>

			{/* WORK */}
			<ResumeSection title="Experience">
				<div className="grid gap-16">
					{work.map((item: ResumeItemType) => {
						const key = v4()
						return <ResumeItem key={key} item={item} itemType="work" />
					})}
				</div>
			</ResumeSection>

			{/* EDUCATION */}
			<ResumeSection title="Education">
				<div className="grid gap-16">
					{education.map((item: ResumeItemType) => {
						const key = v4()
						return <ResumeItem key={key} item={item} itemType="education" />
					})}
				</div>
			</ResumeSection>

			{/* VOLUNTEERING */}
			<ResumeSection title="Volunteering">
				<div className="grid gap-16">
					{volunteering.map((item: ResumeItemType) => {
						const key = v4()
						return <ResumeItem key={key} item={item} itemType="volunteering" />
					})}
				</div>
			</ResumeSection>

			{/* PROJECTS */}
			{/* <ResumeSection title="Projects">
        <div className="grid gap-16">
          {projects.map((item: ResumeItemType) => {
            const key = v4()
            return <div key={key}> {item.name} </div>
          })}
        </div>
      </ResumeSection> */}
		</div>
	)
}

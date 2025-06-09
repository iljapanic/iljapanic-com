import { v4 } from 'uuid'
import Image from 'next/image'
import { redirect } from 'next/navigation'

import { getResumeData } from '@/lib/resume'
import type { ResumeItemType } from '@/types'

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
					<p>
						I've been building products on the web professionally for a little
						over 10 years. I specialize in strategic UX design and web
						development with a penchant for clear information architecture,
						design systems, and bespoke frontends.
					</p>

					<p>
						I have worked with agencies, startups, non-profits, artists, small
						vendors, medium SaaS companies, and large corporations. I'm used to
						mediating between business, product, and development teams. I have
						experience leading design initiatives, establishing design
						processes, and shaping the overall design direction of
						organizations.
					</p>

					<p>
						I strive to approach my practice with a critical eye, stemming from
						my eclectic academic background in complex systems and emergent
						technologies.
					</p>

					<p>
						Besides day-to-day work, I dabble with 3D printing, parametric and
						generative design, programming microcontrollers, digging through
						records, and collecting obscure books. These days, many of these
						activities are now on the back burner as I spend more time with my
						little daughter.
					</p>
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

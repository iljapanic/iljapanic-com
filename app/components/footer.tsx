import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Twitter, Mail, Rss } from 'lucide-react'

const socials = [
  {
    href: 'https://buttondown.email/iljapanic',
    label: 'Subscribe',
    icon: Mail,
  },
  {
    href: 'https://twitter.com/iljapanic',
    label: 'Follow',
    icon: Twitter,
  },
  // {
  //   href: 'https://iljapanic.com/rss',
  //   label: 'RSS',
  //   icon: Rss,
  // },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="container pb-16 pt-16 lg:pb-24 lg:pt-32">
      <div className="post-wrapper mx-auto">
        <nav className="font-sans text-sm md:flex md:items-center md:justify-between">
          <div className="flex gap-4 lg:gap-8">
            {socials.map(({ href, label, icon }) => (
              <SocialLink
                key={`footer-social-link-${label}`}
                href={href}
                label={label}
                icon={icon}
              />
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-tertiary md:mt-0">
            <div>Prague, {currentYear}</div>
            {/* <div>|</div>
          <NavLink href="/colophon">Colophon</NavLink> */}
          </div>
        </nav>
      </div>
    </footer>
  )
}

function NavLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'font-sans text-tertiary no-underline text-sm hover:text-secondary',
        className,
      )}
    >
      {children}
    </Link>
  )
}

function SocialLink({
  href,
  className,
  icon,
  label,
}: {
  href: string
  icon: any
  label: string
  className?: string
}) {
  const Icon = icon
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center font-sans text-tertiary no-underline text-sm hover:text-primary',
        className,
      )}
    >
      <Icon size="18" />
      <span className="ml-1.5">{label}</span>
    </a>
  )
}

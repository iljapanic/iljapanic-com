import Link from 'next/link'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  CubeIcon,
  FileTextIcon,
  HamburgerMenuIcon,
} from '@radix-ui/react-icons'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Notes', href: '/admin/notes', icon: <FileTextIcon /> },
  { label: 'Tools', href: '/admin/tools', icon: <CubeIcon /> },
]

export function AdminHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'bg-background/80 sticky top-0 z-10 w-full px-2 py-1.5 backdrop-blur-xs',
        className,
      )}
    >
      <nav>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <HamburgerMenuIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {navItems.map((item) => (
              <DropdownMenuLink key={item.href} {...item} />
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}

function DropdownMenuLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon?: React.ReactNode
}) {
  return (
    <DropdownMenuItem>
      <Link href={href} className="inline-flex w-full items-center gap-1.5">
        {icon && <span className="">{icon}</span>}
        {label}
      </Link>
    </DropdownMenuItem>
  )
}

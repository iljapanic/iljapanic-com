'use client'

import { Button, type ButtonProps } from '@/components/ui/button'

type ConfirmButtonProps = ButtonProps & {
	message: string
}

// Submit button that asks for confirmation before the surrounding <form>
// posts its server action.
export function ConfirmButton({
	message,
	onClick,
	...props
}: ConfirmButtonProps) {
	return (
		<Button
			type="submit"
			{...props}
			onClick={(event) => {
				if (!window.confirm(message)) {
					event.preventDefault()
					return
				}
				onClick?.(event)
			}}
		/>
	)
}

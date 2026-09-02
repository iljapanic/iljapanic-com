'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { runReadwiseSync, type SyncResult } from '@/lib/readwise-sync'

export type TriggerReadwiseSyncResult =
	| ({ ok: true } & SyncResult)
	| { ok: false; message: string }

export async function triggerReadwiseSync(): Promise<TriggerReadwiseSyncResult> {
	await requireAdmin()

	try {
		const result = await runReadwiseSync('manual')
		revalidatePath('/admin')
		return { ok: true, ...result }
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		return { ok: false, message }
	}
}

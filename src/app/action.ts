'use server'

import { revalidatePath } from 'next/cache'

/**
 * Clears the server-side cache for a specific page.
 * @param path The route to refresh (e.g., '/expenses' or '/goals')
 */
export async function clearCache(path: string) {
	try {
		// 1. Clear the specific page
		revalidatePath(path)

		// 2. Always clear the home/dashboard since it usually
		// aggregates data from both expenses and goals.
		revalidatePath('/')
	} catch (error) {
		console.error('Failed to clear cache:', error)
	}
}

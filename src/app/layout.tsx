import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ClientShell from '@/components/ClientShell'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
}

export const metadata: Metadata = {
	title: 'FinMentor AI',
	description: 'Your intelligent expense and finance tracker.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			  <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 overflow-x-hidden overflow-y-auto min-h-screen`}>
				<ClientShell>{children}</ClientShell>
			</body>
		</html>
	)
}

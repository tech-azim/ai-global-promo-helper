import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/layout/app-shell'
import 'antd/dist/reset.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Kopi Kita',
  description: 'AI Promo Helper',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${geist.variable} font-sans antialiased`} style={{ margin: 0, padding: 0 }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
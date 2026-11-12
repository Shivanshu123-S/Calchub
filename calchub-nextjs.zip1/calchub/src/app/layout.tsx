import type { Metadata, Viewport } from 'next'
import { Syne, DM_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import '@/styles/globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'CalcHub — Every Calculator. One Place.', template: '%s | CalcHub' },
  description: '318+ free calculators across Finance, Math, Physics, Chemistry, Health and more. Fast, accurate, works on any device.',
  keywords: ['calculator', 'EMI', 'BMI', 'SIP', 'GST', 'finance calculator', 'math calculator'],
  authors: [{ name: 'CalcHub' }],
  creator: 'CalcHub',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://calchub.pages.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'CalcHub',
    title: 'CalcHub — Every Calculator. One Place.',
    description: '318+ free calculators. Finance, Math, Health & more.',
  },
  twitter: { card: 'summary_large_image', title: 'CalcHub', description: '318+ free calculators.' },
  manifest: '/manifest.json',
  icons: { apple: '/apple-touch-icon.png' },
}

export const viewport: Viewport = {
  themeColor: '#4f83e3',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-tx font-mono antialiased min-h-screen">
        {children}
        <Toaster
          position="bottom-right"
          offset={80}
          toastOptions={{
            style: {
              background: 'var(--card2)',
              border: '1px solid var(--b2)',
              color: 'var(--tx)',
              fontFamily: 'var(--font-syne)',
              fontWeight: '700',
              fontSize: '0.8rem',
            },
          }}
        />
      </body>
    </html>
  )
}

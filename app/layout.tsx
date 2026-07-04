import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Xai – Intelligence Workspace',
  description: 'From raw data to actionable intelligence. Xai transforms unstructured data into structured insights, powering decisions at the speed of thought.',
  keywords: ['AI', 'intelligence', 'data analytics', 'automation', 'insights', 'workspace'],
  authors: [{ name: 'Xai' }],
  openGraph: {
    title: 'Xai – Intelligence Workspace',
    description: 'From raw data to actionable intelligence.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xai – Intelligence Workspace',
    description: 'From raw data to actionable intelligence.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#060A0F" />
      </head>
      <body className="noise-overlay">{children}</body>
    </html>
  )
}

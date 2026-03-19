import type { Metadata } from 'next'
import React from 'react'
import '../src/styles/index.css'
import Providers from './Providers'

export const metadata: Metadata = {
  title: {
    default: 'Kapatid Ministry International',
    template: '%s | Kapatid Ministry',
  },
  description: 'Partnering with local churches to transform communities through the Gospel across the Philippines. Founded in 2003 by Titus and Beth Laxa.',
  openGraph: {
    siteName: 'Kapatid Ministry International',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

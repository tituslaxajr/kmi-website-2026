import type { Metadata } from 'next'
import React from 'react'
import '../src/styles/index.css'
import Providers from './Providers'

export const metadata: Metadata = {
  title: 'KMI Website 2026',
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

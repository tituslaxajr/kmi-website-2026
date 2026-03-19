'use client'

import React from 'react'
import { AuthProvider } from '../src/app/context/AuthContext'
import { SiteImagesContext, useSiteImagesProvider } from '../src/app/hooks/useSiteImages'
import { Toaster } from 'sonner'
import KeyboardShortcut from './KeyboardShortcut'

function SiteImagesWrapper({ children }: { children: React.ReactNode }) {
  const value = useSiteImagesProvider()
  return (
    <SiteImagesContext.Provider value={value}>
      {children}
    </SiteImagesContext.Provider>
  )
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SiteImagesWrapper>
        {children}
        <Toaster position="bottom-right" richColors />
        <KeyboardShortcut />
      </SiteImagesWrapper>
    </AuthProvider>
  )
}

import type { Metadata } from 'next'
import { StoriesPage } from '../../../src/app/pages/StoriesPage'

export const metadata: Metadata = {
  title: 'Field Stories',
  description: 'Read real stories of transformation from communities across the Philippines touched by Kapatid Ministry.',
}

export default function Page() {
  return <StoriesPage />
}

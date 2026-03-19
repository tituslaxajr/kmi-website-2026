import type { Metadata } from 'next'
import { MediaPage } from '../../../src/app/pages/MediaPage'

export const metadata: Metadata = {
  title: 'Media',
  description: 'Watch videos and view photos from Kapatid Ministry field work, events, and community outreach across the Philippines.',
}

export default function Page() {
  return <MediaPage />
}

import type { Metadata } from 'next'
import { AboutPage } from '../../../src/app/pages/AboutPage'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Kapatid Ministry International — our story, mission, and the team behind our work across the Philippines.',
}

export default function Page() {
  return <AboutPage />
}

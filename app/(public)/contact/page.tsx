import type { Metadata } from 'next'
import { ContactPage } from '../../../src/app/pages/ContactPage'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Kapatid Ministry — whether you want to partner, volunteer, or simply pray with us.',
}

export default function Page() {
  return <ContactPage />
}

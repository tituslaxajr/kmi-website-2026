import type { Metadata } from 'next'
import { PartnersPage } from '../../../src/app/pages/PartnersPage'

export const metadata: Metadata = {
  title: 'Partners',
  description: 'Meet the churches and individuals partnering with Kapatid Ministry to bring the Gospel to communities across the Philippines.',
}

export default function Page() {
  return <PartnersPage />
}

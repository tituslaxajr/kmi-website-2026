import type { Metadata } from 'next'
import { MinistriesPage } from '../../../src/app/pages/MinistriesPage'

export const metadata: Metadata = {
  title: 'Ministries',
  description: 'Explore the ministries of Kapatid — from OFW families to church planting and community transformation across the Philippines.',
}

export default function Page() {
  return <MinistriesPage />
}

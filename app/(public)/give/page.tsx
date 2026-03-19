import type { Metadata } from 'next'
import { GivePage } from '../../../src/app/pages/GivePage'

export const metadata: Metadata = {
  title: 'Give',
  description: 'Support Kapatid Ministry and help transform communities across the Philippines through local church partnerships.',
}

export default function Page() {
  return <GivePage />
}

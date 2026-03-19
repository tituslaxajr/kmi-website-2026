import type { Metadata } from 'next'
import { ImpactPage } from '../../../src/app/pages/ImpactPage'

export const metadata: Metadata = {
  title: 'Our Impact',
  description: 'See the measurable impact of Kapatid Ministry — lives changed, communities reached, and churches strengthened across the Philippines.',
}

export default function Page() {
  return <ImpactPage />
}

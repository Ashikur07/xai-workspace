'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GSAPProvider from '@/components/providers/GSAPProvider'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { useIsExport } from '@/hooks/useIsExport'

// Dynamic imports — disable SSR for Three.js / GSAP components
const Hero                 = dynamic(() => import('@/components/Hero'),                 { ssr: false })
const InsightFlow          = dynamic(() => import('@/components/InsightFlow'),          { ssr: false })
const Dashboard            = dynamic(() => import('@/components/Dashboard'),            { ssr: false })
const SignatureInteraction = dynamic(() => import('@/components/SignatureInteraction'), { ssr: false })

export default function Home() {
  const isExport = useIsExport()

  return (
    <GSAPProvider>
      {/* Loading screen — self-manages lifecycle and fades out */}
      {!isExport && <LoadingScreen />}

      <main className="min-h-screen" style={{ background: '#060A0F', color: '#E2E8F0' }}>
        <Navbar />
        <Hero />

        {/* Section divider */}
        <div className="relative h-px max-w-4xl mx-auto"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(91,141,239,0.15), transparent)' }} />

        <InsightFlow />

        {/* Section divider */}
        <div className="relative h-px max-w-4xl mx-auto"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.12), transparent)' }} />

        <Dashboard />

        {/* Section divider */}
        <div className="relative h-px max-w-4xl mx-auto"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.1), transparent)' }} />

        <SignatureInteraction />
        <Footer />
      </main>
    </GSAPProvider>
  )
}

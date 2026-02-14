import { Suspense } from 'react'
import { ClientPortal } from '@/components/ClientPortal'
import { LoadingSpinner } from '@/components/LoadingSpinner'

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-soft-denim">Loading portal...</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientPortal />
    </Suspense>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CustomerSelection } from '@/components/CustomerSelection'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { getProjectByToken } from '@/lib/supabase'
import type { Project } from '@/lib/supabase'

export function ClientPortal() {
  const searchParams = useSearchParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setError('Invalid access link. Please check your email for the correct link.')
      setLoading(false)
      return
    }

    async function loadProject() {
      try {
        const projectData = await getProjectByToken(token!)
        if (!projectData) {
          setError('Project not found. Please check your access link or contact support.')
        } else if (projectData.status === 'locked') {
          setError('Your finish selections have been locked and can no longer be modified.')
        } else {
          setProject(projectData)
        }
      } catch (err) {
        console.error('Error loading project:', err)
        setError('Unable to load project. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-soft-denim">Loading your project...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-red-500">
              If you need assistance, please contact MassDwell support.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-deep-navy mb-4">Welcome to MassDwell</h2>
          <p className="text-soft-denim">
            Please use the access link from your email to view your project.
          </p>
        </div>
      </div>
    )
  }

  return <CustomerSelection project={project} />
}
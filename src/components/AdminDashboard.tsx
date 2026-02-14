'use client'

import { useState, useEffect } from 'react'
import { getAllProjects, getProjectSelections, getFinishCategories } from '@/lib/supabase'
import type { Project, ProjectSelection, FinishCategory } from '@/lib/supabase'
import { ProjectList } from './ProjectList'
import { ProjectDetails } from './ProjectDetails'
import { CreateProjectModal } from './CreateProjectModal'
import { LoadingSpinner } from './LoadingSpinner'

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [categories, setCategories] = useState<FinishCategory[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [projectsData, categoriesData] = await Promise.all([
        getAllProjects(),
        getFinishCategories()
      ])
      setProjects(projectsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleProjectSelect(project: Project) {
    setSelectedProject(project)
  }

  function handleBackToList() {
    setSelectedProject(null)
  }

  function handleProjectCreated() {
    setShowCreateModal(false)
    loadData() // Reload projects
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-soft-denim">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-deep-navy">
                MassDwell Admin Dashboard
              </h1>
              {selectedProject && (
                <button
                  onClick={handleBackToList}
                  className="ml-6 text-soft-denim hover:text-deep-navy"
                >
                  ← Back to Projects
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {!selectedProject && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create New Project
                </button>
              )}
              
              <button
                onClick={onLogout}
                className="text-soft-denim hover:text-deep-navy"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {selectedProject ? (
          <ProjectDetails 
            project={selectedProject} 
            categories={categories}
            onBack={handleBackToList}
          />
        ) : (
          <ProjectList 
            projects={projects}
            onProjectSelect={handleProjectSelect}
            onRefresh={loadData}
          />
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  )
}
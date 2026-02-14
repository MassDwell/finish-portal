'use client'

import { useState, useEffect } from 'react'
import { getProjectSelections, getFinishOptionsByCategory } from '@/lib/supabase'
import type { Project, ProjectSelection, FinishCategory, FinishOption } from '@/lib/supabase'
import { LoadingSpinner } from './LoadingSpinner'
import { generateProjectPDF } from '@/lib/pdf-generator'
import { getLocalImageUrl } from '@/lib/imageUtils'

interface ProjectDetailsProps {
  project: Project
  categories: FinishCategory[]
  onBack: () => void
}

export function ProjectDetails({ project, categories, onBack }: ProjectDetailsProps) {
  const [selections, setSelections] = useState<ProjectSelection[]>([])
  const [options, setOptions] = useState<FinishOption[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    loadProjectData()
  }, [project.id])

  async function loadProjectData() {
    try {
      const [selectionsData, ...optionsData] = await Promise.all([
        getProjectSelections(project.id),
        ...categories.map(category => getFinishOptionsByCategory(category.id))
      ])
      
      setSelections(selectionsData)
      
      // Flatten all options
      const allOptions = optionsData.flat()
      setOptions(allOptions)
    } catch (error) {
      console.error('Error loading project data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleGeneratePDF() {
    setGeneratingPDF(true)
    try {
      await generateProjectPDF(project, selections, categories, options)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const getSelectionForCategory = (categoryId: string) => {
    return selections.find(s => s.category_id === categoryId)
  }

  const getOptionById = (optionId: string) => {
    return options.find(o => o.id === optionId)
  }

  const generateCustomerLink = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}?token=${project.access_token}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy link')
    }
  }

  const totalUpgradeCost = selections.reduce((total, selection) => {
    const option = getOptionById(selection.option_id)
    return total + (option?.price_upgrade || 0)
  }, 0)

  const completionPercentage = (selections.length / categories.length) * 100

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-soft-denim">Loading project details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-deep-navy mb-2">{project.project_name}</h2>
            <p className="text-lg text-soft-denim mb-4">ADU Model: {project.adu_model}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-600">{project.customer_email || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <p className="text-gray-600">{project.customer_phone || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <p className="text-gray-600">{new Date(project.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                project.status === 'locked' ? 'text-purple-600 bg-purple-100' :
                project.status === 'completed' ? 'text-green-600 bg-green-100' :
                project.status === 'in_progress' ? 'text-blue-600 bg-blue-100' :
                'text-gray-600 bg-gray-100'
              }`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
              </div>
              {project.completed_at && (
                <p className="text-xs text-gray-500 mt-1">
                  Completed: {new Date(project.completed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Selection Progress</span>
            <span>{selections.length} of {categories.length} categories</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => copyToClipboard(generateCustomerLink())}
            className="btn-secondary"
          >
            📋 Copy Customer Link
          </button>
          
          {selections.length > 0 && (
            <button
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              {generatingPDF ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Generating PDF...</span>
                </>
              ) : (
                '📄 Generate PDF'
              )}
            </button>
          )}
          
          {totalUpgradeCost > 0 && (
            <div className="ml-auto text-right">
              <p className="text-sm text-gray-600">Total Upgrade Cost:</p>
              <p className="text-xl font-bold text-deep-navy">+${totalUpgradeCost.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Selections */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-deep-navy">Finish Selections</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {categories.map((category) => {
              const selection = getSelectionForCategory(category.id)
              const option = selection ? getOptionById(selection.option_id) : null
              
              return (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-deep-navy mb-2">{category.display_name}</h4>
                      {category.description && (
                        <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      )}
                      
                      {selection && option ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            {option.image_url && (
                              <div className="flex-shrink-0">
                                <img 
                                  src={getLocalImageUrl(option.image_url)} 
                                  alt={option.name}
                                  className="w-20 h-20 object-contain bg-gray-50 rounded-lg"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{option.name}</h5>
                              {option.description && (
                                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  Selected: {new Date(selection.updated_at || selection.created_at).toLocaleDateString()}
                                </span>
                                {option.price_upgrade && option.price_upgrade > 0 ? (
                                  <span className="font-medium text-deep-navy">
                                    +${option.price_upgrade.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-green-600 text-sm">Standard</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-yellow-800 text-sm font-medium">No selection made</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
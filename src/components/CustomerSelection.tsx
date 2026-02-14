'use client'

import { useState, useEffect } from 'react'
import { 
  getFinishCategories, 
  getFinishOptionsByCategory, 
  getProjectSelections,
  updateProjectSelection,
  lockProjectSelections
} from '@/lib/supabase'
import type { Project, FinishCategory, FinishOption, ProjectSelection } from '@/lib/supabase'
import { ProgressBar } from './ProgressBar'
import { CategorySelector } from './CategorySelector'
import { OptionGrid } from './OptionGrid'
import { ConfirmationModal } from './ConfirmationModal'
import { LoadingSpinner } from './LoadingSpinner'

interface CustomerSelectionProps {
  project: Project
}

export function CustomerSelection({ project }: CustomerSelectionProps) {
  const [categories, setCategories] = useState<FinishCategory[]>([])
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [options, setOptions] = useState<FinishOption[]>([])
  const [selections, setSelections] = useState<ProjectSelection[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [categoriesData, selectionsData] = await Promise.all([
          getFinishCategories(),
          getProjectSelections(project.id)
        ])
        
        setCategories(categoriesData)
        setSelections(selectionsData)
        
        if (categoriesData.length > 0) {
          const initialOptions = await getFinishOptionsByCategory(categoriesData[0].id)
          setOptions(initialOptions)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [project.id])

  useEffect(() => {
    if (categories.length > 0 && currentCategoryIndex < categories.length) {
      loadOptionsForCategory(categories[currentCategoryIndex].id)
    }
  }, [currentCategoryIndex, categories])

  async function loadOptionsForCategory(categoryId: string) {
    try {
      const optionsData = await getFinishOptionsByCategory(categoryId)
      setOptions(optionsData)
    } catch (error) {
      console.error('Error loading options:', error)
    }
  }

  function getCurrentSelection(): ProjectSelection | undefined {
    const currentCategory = categories[currentCategoryIndex]
    return selections.find(s => s.category_id === currentCategory?.id)
  }

  async function handleOptionSelect(optionId: string) {
    const currentCategory = categories[currentCategoryIndex]
    if (!currentCategory) return

    try {
      const success = await updateProjectSelection(project.id, currentCategory.id, optionId)
      if (success) {
        // Update local selections state
        const existingIndex = selections.findIndex(s => s.category_id === currentCategory.id)
        const newSelection: ProjectSelection = {
          id: '', // Will be updated from server if needed
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          project_id: project.id,
          category_id: currentCategory.id,
          option_id: optionId
        }

        if (existingIndex >= 0) {
          const updatedSelections = [...selections]
          updatedSelections[existingIndex] = { ...updatedSelections[existingIndex], option_id: optionId }
          setSelections(updatedSelections)
        } else {
          setSelections([...selections, newSelection])
        }
      }
    } catch (error) {
      console.error('Error updating selection:', error)
    }
  }

  function navigateToCategory(index: number) {
    setCurrentCategoryIndex(index)
  }

  function goToNext() {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1)
    }
  }

  function goToPrevious() {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1)
    }
  }

  async function handleSubmit() {
    if (selections.length !== categories.length) {
      alert('Please make selections for all categories before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const success = await lockProjectSelections(project.id)
      if (success) {
        setSubmitted(true)
        setShowConfirmation(false)
      } else {
        alert('Error submitting selections. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting selections:', error)
      alert('Error submitting selections. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-soft-denim">Loading finish categories...</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Selections Submitted!</h2>
            <p className="text-green-700 mb-4">
              Thank you! Your finish selections have been successfully submitted and locked.
            </p>
            <p className="text-sm text-green-600">
              You will receive a confirmation email shortly with a summary of your selections.
              Your MassDwell team will be in touch regarding next steps.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-deep-navy mb-4">No Categories Available</h2>
          <p className="text-soft-denim">
            Please contact MassDwell support for assistance.
          </p>
        </div>
      </div>
    )
  }

  const currentCategory = categories[currentCategoryIndex]
  const currentSelection = getCurrentSelection()
  const completedCategories = selections.length
  const progress = (completedCategories / categories.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-deep-navy mb-2">{project.project_name}</h1>
            <p className="text-lg text-soft-denim mb-4">ADU Model: {project.adu_model}</p>
            
            <ProgressBar 
              current={completedCategories} 
              total={categories.length}
              percentage={progress}
            />
            
            <p className="text-sm text-soft-denim mt-2">
              {completedCategories} of {categories.length} categories complete
            </p>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <CategorySelector
            categories={categories}
            currentIndex={currentCategoryIndex}
            selections={selections}
            onCategorySelect={navigateToCategory}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-deep-navy mb-2">
              {currentCategory.display_name}
            </h2>
            {currentCategory.description && (
              <p className="text-soft-denim">
                {currentCategory.description}
              </p>
            )}
          </div>

          <OptionGrid
            options={options}
            selectedOptionId={currentSelection?.option_id}
            onOptionSelect={handleOptionSelect}
          />

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={goToPrevious}
              disabled={currentCategoryIndex === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Category
            </button>

            <div className="flex space-x-4">
              {currentCategoryIndex === categories.length - 1 && selections.length === categories.length ? (
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="btn-primary"
                >
                  Submit All Selections
                </button>
              ) : (
                <button
                  onClick={goToNext}
                  disabled={currentCategoryIndex === categories.length - 1}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Category
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <ConfirmationModal
          project={project}
          selections={selections}
          categories={categories}
          options={options}
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirmation(false)}
          submitting={submitting}
        />
      )}
    </div>
  )
}
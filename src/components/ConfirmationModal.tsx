'use client'

import type { Project, ProjectSelection, FinishCategory, FinishOption } from '@/lib/supabase'
import { LoadingSpinner } from './LoadingSpinner'

interface ConfirmationModalProps {
  project: Project
  selections: ProjectSelection[]
  categories: FinishCategory[]
  options: FinishOption[]
  onConfirm: () => void
  onCancel: () => void
  submitting: boolean
}

export function ConfirmationModal({
  project,
  selections,
  categories,
  options,
  onConfirm,
  onCancel,
  submitting
}: ConfirmationModalProps) {
  
  function getSelectionDetails() {
    return categories.map(category => {
      const selection = selections.find(s => s.category_id === category.id)
      const option = selection ? options.find(o => o.id === selection.option_id) : null
      
      return {
        category,
        option,
        hasSelection: !!selection
      }
    })
  }

  const selectionDetails = getSelectionDetails()
  const totalUpgrade = selectionDetails.reduce((total, detail) => {
    return total + (detail.option?.price_upgrade || 0)
  }, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-deep-navy">Review Your Selections</h2>
          <p className="text-soft-denim mt-2">
            Please review your finish selections for <strong>{project.project_name}</strong> before submitting.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {selectionDetails.map(({ category, option, hasSelection }) => (
            <div key={category.id} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <h3 className="font-medium text-deep-navy">{category.display_name}</h3>
                {hasSelection && option ? (
                  <div className="mt-1">
                    <p className="text-gray-800">{option.name}</p>
                    {option.description && (
                      <p className="text-sm text-gray-600">{option.description}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600 text-sm mt-1">No selection made</p>
                )}
              </div>
              <div className="ml-4 text-right">
                {hasSelection && option ? (
                  option.price_upgrade && option.price_upgrade > 0 ? (
                    <span className="text-deep-navy font-medium">
                      +${option.price_upgrade.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-green-600 text-sm">Standard</span>
                  )
                ) : (
                  <span className="text-red-600 text-sm">Missing</span>
                )}
              </div>
            </div>
          ))}

          {totalUpgrade > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="font-medium text-deep-navy">Total Upgrade Cost:</span>
                <span className="text-xl font-bold text-deep-navy">
                  +${totalUpgrade.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-soft-denim mt-2">
                This amount will be added to your project cost.
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <div className="flex items-start">
              <svg 
                className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div>
                <p className="font-medium text-yellow-800">Important Notice</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Once submitted, your selections will be locked and cannot be changed. 
                  Please ensure all selections are correct before confirming.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Review Again
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting || selectionDetails.some(d => !d.hasSelection)}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              'Confirm & Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
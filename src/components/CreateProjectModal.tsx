'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { LoadingSpinner } from './LoadingSpinner'

interface CreateProjectModalProps {
  onClose: () => void
  onProjectCreated: () => void
}

export function CreateProjectModal({ onClose, onProjectCreated }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    project_name: '',
    adu_model: '',
    customer_email: '',
    customer_phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const aduModels = [
    'Studio 400',
    'Studio 600',
    'One Bedroom 750',
    'One Bedroom 900',
    'Two Bedroom 1200',
    'Custom Design'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const accessToken = uuidv4()
      
      const { error: insertError } = await supabase
        .from('finish_portal_projects')
        .insert([
          {
            ...formData,
            access_token: accessToken,
            status: 'draft'
          }
        ])

      if (insertError) {
        throw insertError
      }

      onProjectCreated()
    } catch (err) {
      console.error('Error creating project:', err)
      setError('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-deep-navy">Create New Project</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              id="project_name"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              required
              placeholder="e.g., Smith Family ADU"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="adu_model" className="block text-sm font-medium text-gray-700 mb-1">
              ADU Model *
            </label>
            <select
              id="adu_model"
              name="adu_model"
              value={formData.adu_model}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
            >
              <option value="">Select ADU Model</option>
              {aduModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Email
            </label>
            <input
              type="email"
              id="customer_email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleChange}
              placeholder="customer@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Phone
            </label>
            <input
              type="tel"
              id="customer_phone"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> A unique access link will be generated for this project. 
              The customer can use this link to access their finish selection portal.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Creating...</span>
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
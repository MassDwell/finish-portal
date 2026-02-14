'use client'

import { useState } from 'react'
import type { FinishCategory, ProjectSelection } from '@/lib/supabase'

interface CategorySelectorProps {
  categories: FinishCategory[]
  currentIndex: number
  selections: ProjectSelection[]
  onCategorySelect: (index: number) => void
}

// Get section for a category
function getSection(name: string): string {
  if (name.includes('adu')) return 'ADU Model'
  if (name.includes('exterior')) return 'Exterior'
  if (name.includes('kitchen') || name.includes('cabinet') || name.includes('quartz')) return 'Kitchen'
  if (name.includes('bathroom') || name.includes('shower') || name.includes('vanity') || name.includes('toilet') || name.includes('ada')) return 'Bathroom'
  return 'Interior'
}

export function CategorySelector({ 
  categories, 
  currentIndex, 
  selections, 
  onCategorySelect 
}: CategorySelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const currentCategory = categories[currentIndex]
  const currentSection = currentCategory ? getSection(currentCategory.name) : ''
  
  // Group by section for dropdown
  const sections = ['ADU Model', 'Exterior', 'Interior', 'Kitchen', 'Bathroom']
  const sectionCategories: { [key: string]: { cat: FinishCategory; idx: number }[] } = {}
  categories.forEach((cat, idx) => {
    const section = getSection(cat.name)
    if (!sectionCategories[section]) sectionCategories[section] = []
    sectionCategories[section].push({ cat, idx })
  })

  function isCompleted(categoryId: string): boolean {
    return selections.some(s => s.category_id === categoryId)
  }

  // Count completed per section
  function getSectionProgress(section: string): { completed: number; total: number } {
    const cats = sectionCategories[section] || []
    const completed = cats.filter(({ cat }) => isCompleted(cat.id)).length
    return { completed, total: cats.length }
  }

  return (
    <div className="relative">
      {/* Section Tabs */}
      <div className="flex justify-center gap-2 py-4">
        {sections.map(section => {
          const { completed, total } = getSectionProgress(section)
          const isActive = section === currentSection
          const allDone = completed === total && total > 0
          
          if (total === 0) return null
          
          return (
            <button
              key={section}
              onClick={() => {
                const firstInSection = sectionCategories[section]?.[0]
                if (firstInSection) onCategorySelect(firstInSection.idx)
              }}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${isActive 
                  ? 'bg-deep-navy text-white shadow-lg' 
                  : allDone
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              {section}
              {allDone && <span className="ml-1">✓</span>}
              {!allDone && total > 0 && (
                <span className="ml-1 text-xs opacity-70">({completed}/{total})</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Current Category Dropdown */}
      <div className="flex justify-center pb-4">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <span className="text-gray-500">Jump to:</span>
            <span className="font-medium text-deep-navy">
              {currentCategory?.display_name || formatName(currentCategory?.name || '')}
            </span>
            <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto min-w-[300px]">
              {sections.map(section => {
                const cats = sectionCategories[section] || []
                if (cats.length === 0) return null
                
                return (
                  <div key={section}>
                    <div className="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide sticky top-0">
                      {section}
                    </div>
                    {cats.map(({ cat, idx }) => {
                      const done = isCompleted(cat.id)
                      const active = idx === currentIndex
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            onCategorySelect(idx)
                            setShowDropdown(false)
                          }}
                          className={`
                            w-full text-left px-4 py-2 text-sm flex items-center justify-between
                            ${active ? 'bg-blue-50 text-deep-navy font-medium' : 'hover:bg-gray-50'}
                          `}
                        >
                          <span>{cat.display_name || formatName(cat.name)}</span>
                          {done && <span className="text-green-500">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/interior |exterior |adu /gi, '')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

import type { FinishCategory, ProjectSelection } from '@/lib/supabase'

interface CategorySelectorProps {
  categories: FinishCategory[]
  currentIndex: number
  selections: ProjectSelection[]
  onCategorySelect: (index: number) => void
}

// Format category name nicely
function formatCategoryName(name: string, displayName?: string | null): string {
  if (displayName) return displayName
  
  // Convert snake_case to Title Case and clean up
  return name
    .replace(/_/g, ' ')
    .replace(/interior |exterior /gi, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Group categories by section
function getCategorySection(name: string): string {
  if (name.includes('adu')) return 'ADU Selection'
  if (name.includes('exterior')) return 'Exterior'
  if (name.includes('kitchen') || name.includes('cabinet')) return 'Kitchen'
  if (name.includes('bathroom') || name.includes('shower') || name.includes('vanity') || name.includes('toilet')) return 'Bathroom'
  return 'Interior'
}

export function CategorySelector({ 
  categories, 
  currentIndex, 
  selections, 
  onCategorySelect 
}: CategorySelectorProps) {
  function isCompleted(categoryId: string): boolean {
    return selections.some(s => s.category_id === categoryId)
  }

  // Group categories by section
  const sections: { [key: string]: { category: FinishCategory; index: number }[] } = {}
  categories.forEach((category, index) => {
    const section = getCategorySection(category.name)
    if (!sections[section]) sections[section] = []
    sections[section].push({ category, index })
  })

  const sectionOrder = ['ADU Selection', 'Exterior', 'Interior', 'Kitchen', 'Bathroom']

  return (
    <div className="border-b border-gray-200 bg-gray-50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-between py-3 border-b border-gray-200">
        <span className="text-sm text-gray-500">
          Step {currentIndex + 1} of {categories.length}
        </span>
        <span className="text-sm text-gray-500">
          {selections.length} of {categories.length} complete
        </span>
      </div>
      
      {/* Section tabs */}
      <div className="flex overflow-x-auto py-2 gap-1 scrollbar-hide">
        {sectionOrder.map(sectionName => {
          const sectionCategories = sections[sectionName] || []
          if (sectionCategories.length === 0) return null
          
          const isCurrentSection = sectionCategories.some(({ index }) => index === currentIndex)
          const allCompleted = sectionCategories.every(({ category }) => isCompleted(category.id))
          const someCompleted = sectionCategories.some(({ category }) => isCompleted(category.id))
          
          return (
            <div key={sectionName} className="flex-shrink-0">
              <div className={`
                px-3 py-1 rounded-t-lg text-xs font-semibold uppercase tracking-wide
                ${isCurrentSection 
                  ? 'bg-deep-navy text-white' 
                  : allCompleted
                    ? 'bg-green-100 text-green-700'
                    : someCompleted
                      ? 'bg-blue-50 text-admiral-blue'
                      : 'bg-gray-100 text-gray-500'
                }
              `}>
                {sectionName}
                {allCompleted && ' ✓'}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Category pills for current section */}
      <div className="flex flex-wrap gap-2 py-3">
        {categories.map((category, index) => {
          const isActive = index === currentIndex
          const completed = isCompleted(category.id)
          
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(index)}
              className={`
                inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 border
                ${isActive 
                  ? 'bg-deep-navy text-white border-deep-navy shadow-md scale-105' 
                  : completed
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }
              `}
            >
              {completed && !isActive && (
                <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span className="truncate max-w-[150px]">
                {formatCategoryName(category.name, category.display_name)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

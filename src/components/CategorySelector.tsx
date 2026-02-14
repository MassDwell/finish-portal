import type { FinishCategory, ProjectSelection } from '@/lib/supabase'

interface CategorySelectorProps {
  categories: FinishCategory[]
  currentIndex: number
  selections: ProjectSelection[]
  onCategorySelect: (index: number) => void
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

  return (
    <div className="flex overflow-x-auto py-4 scrollbar-hide">
      <div className="flex space-x-2 min-w-max">
        {categories.map((category, index) => {
          const isActive = index === currentIndex
          const completed = isCompleted(category.id)
          
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(index)}
              className={`
                flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                transition-colors duration-200
                ${isActive 
                  ? 'bg-deep-navy text-white' 
                  : completed
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {completed && (
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
              <span>{category.display_name}</span>
              {isActive && (
                <span className="ml-2 text-xs opacity-75">(Current)</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* Custom scrollbar styling - add to globals.css if needed */
/* 
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
*/
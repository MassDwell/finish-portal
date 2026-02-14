'use client'

import { useState } from 'react'
import type { FinishOption } from '@/lib/supabase'
import { getLocalImageUrl } from '@/lib/imageUtils'

interface OptionGridProps {
  options: FinishOption[]
  selectedOptionId?: string
  onOptionSelect: (optionId: string) => void
}

interface OptionCardProps {
  option: FinishOption
  isSelected: boolean
  onSelect: () => void
}

function OptionCard({ option, isSelected, onSelect }: OptionCardProps) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = getLocalImageUrl(option.image_url)

  return (
    <div
      onClick={onSelect}
      className={`
        card cursor-pointer transition-all duration-200 hover:shadow-lg
        ${isSelected 
          ? 'ring-4 ring-deep-navy border-deep-navy bg-blue-50' 
          : 'hover:border-soft-denim'
        }
      `}
    >
      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 mb-4">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={option.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <svg 
                className="w-12 h-12 mx-auto mb-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1" 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <p className="text-xs">Image Coming Soon</p>
            </div>
          </div>
        )}
        
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 bg-deep-navy text-white rounded-full p-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-deep-navy text-lg">{option.name}</h3>
        
        {option.description && (
          <p className="text-sm text-gray-600">{option.description}</p>
        )}
        
        {option.price_upgrade && option.price_upgrade > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Upgrade</span>
            <span className="font-medium text-deep-navy">
              +${option.price_upgrade.toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">Standard</span>
            <span className="text-sm text-gray-500">No additional cost</span>
          </div>
        )}
      </div>

      {/* Click to Select Indicator */}
      <div className={`
        mt-4 text-center text-sm font-medium py-2 rounded-lg transition-colors
        ${isSelected 
          ? 'bg-deep-navy text-white' 
          : 'bg-gray-100 text-gray-600'
        }
      `}>
        {isSelected ? 'Selected' : 'Click to Select'}
      </div>
    </div>
  )
}

export function OptionGrid({ options, selectedOptionId, onOptionSelect }: OptionGridProps) {
  if (options.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg 
            className="w-16 h-16 mx-auto" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1" 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Options Available</h3>
        <p className="text-gray-500">
          Options for this category will be available soon.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          isSelected={selectedOptionId === option.id}
          onSelect={() => onOptionSelect(option.id)}
        />
      ))}
    </div>
  )
}
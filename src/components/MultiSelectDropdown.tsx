'use client'

import React, { useState, useEffect, useRef } from 'react'

interface Specialization {
  category: string;
  items: string[];
}

interface MultiSelectDropdownProps {
  options: Specialization[]
  selectedOptions: string[]
  onChange: (selected: string[]) => void
}

export default function MultiSelectDropdown({ options = [], selectedOptions = [], onChange }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newTag, setNewTag] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleOption = (option: string) => {
    const updatedSelection = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option]
    onChange(updatedSelection)
  }

  const removeOption = (option: string) => {
    const updatedSelection = selectedOptions.filter(item => item !== option)
    onChange(updatedSelection)
  }

  const addNewTag = () => {
    if (newTag && !selectedOptions.includes(newTag)) {
      onChange([...selectedOptions, newTag])
      setNewTag('')
    }
  }

  const filteredOptions = options.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="border border-gray-300 rounded-md p-2 flex flex-wrap gap-2 min-h-[42px] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map(option => (
            <span 
              key={option} 
              className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center"
            >
              {option}
              <button
                type="button"
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  removeOption(option)
                }}
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400">Selecciona especializaciones</span>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg">
          <input
            type="text"
            placeholder="Buscar especializaciones..."
            className="w-full p-2 border-b border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(category => (
                <div key={category.category}>
                  <div className="px-2 py-1 bg-gray-100 font-semibold">{category.category}</div>
                  {category.items.map(item => (
                    <div
                      key={item}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => toggleOption(item)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(item)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="px-2 py-1 text-gray-500">No se encontraron especializaciones</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
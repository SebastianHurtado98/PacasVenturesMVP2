'use client'

import React, { useState, useEffect, useRef } from 'react'

interface Specialization {
  category: string;
  items: string[];
}

interface SingleSelectDropdownProps {
  options: Specialization[]
  selectedOption: string
  onChange: (selected: string) => void
}

export default function SingleSelectDropdown({ options = [], selectedOption = '', onChange }: SingleSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [inputValue, setInputValue] = useState(selectedOption)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setInputValue(selectedOption)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedOption])

  useEffect(() => {
    setInputValue(selectedOption)
  }, [selectedOption])

  const handleInputClick = () => {
    setIsOpen(true)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setSearchTerm(value)
    setIsOpen(true)
  }

  const selectOption = (option: string) => {
    onChange(option)
    setSearchTerm('')
    setInputValue(option)
    setIsOpen(false)
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
        className="border border-gray-300 rounded-md p-2 cursor-pointer"
        onClick={handleInputClick}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar especialización..."
          className="w-full outline-none cursor-pointer"
          value={inputValue}
          onChange={handleInputChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.map(category => (
              <div key={category.category}>
                <div className="px-2 py-1 bg-gray-100 font-semibold">{category.category}</div>
                {category.items.map(item => (
                  <div
                    key={item}
                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => selectOption(item)}
                  >
                    <input
                      type="radio"
                      checked={selectedOption === item}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    {item}
                  </div>
                ))}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-2 py-1 text-gray-500">No se encontraron especializaciones</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
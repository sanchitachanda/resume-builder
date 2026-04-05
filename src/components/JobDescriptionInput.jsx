import React from 'react'

export default function JobDescriptionInput({ value, onChange }) {
  const characterCount = value.length
  const maxCharacters = 5000

  const handleChange = (e) => {
    if (e.target.value.length <= maxCharacters) {
      onChange(e.target.value)
    }
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste the complete job description here. Include responsibilities, required skills, experience level, and qualifications."
        className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      
      <div className="flex justify-between items-center mt-3 text-sm">
        <p className="text-gray-600">
          {characterCount > 0 ? (
            <span>
              {characterCount} characters entered
              {characterCount > 500 && <span className="text-green-600"> ✓ Good</span>}
              {characterCount <= 500 && <span className="text-yellow-600"> (add more for better analysis)</span>}
            </span>
          ) : (
            <span className="text-gray-400">Enter job description...</span>
          )}
        </p>
        <p className="text-gray-500 text-xs">
          {characterCount} / {maxCharacters}
        </p>
      </div>

      {characterCount === maxCharacters && (
        <p className="text-yellow-600 text-sm mt-2">Maximum character limit reached</p>
      )}
    </div>
  )
}

import React from 'react'

export default function CompareButton({ onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        btn btn-primary flex-1 flex items-center justify-center gap-2 text-lg font-semibold
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
        transition-all
      `}
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Analyzing...
        </>
      ) : (
        <>
          <span>🔍</span>
          Compare & Rate
        </>
      )}
    </button>
  )
}

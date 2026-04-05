import React, { useState } from 'react'

export default function EditSuggestions({ suggestions }) {
  const [expandedSuggestions, setExpandedSuggestions] = useState({})
  const [copiedId, setCopiedId] = useState(null)

  const toggleExpanded = (id) => {
    setExpandedSuggestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-100 border-red-300 text-red-900'
    if (priority === 'medium') return 'bg-yellow-100 border-yellow-300 text-yellow-900'
    return 'bg-blue-100 border-blue-300 text-blue-900'
  }

  const getPriorityLabel = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const getSummaryStats = () => {
    return {
      total: suggestions.additions.length + suggestions.rewords.length,
      high: [...suggestions.additions, ...suggestions.rewords].filter(s => s.priority === 'high').length,
      medium: [...suggestions.additions, ...suggestions.rewords].filter(s => s.priority === 'medium').length,
      low: [...suggestions.additions, ...suggestions.rewords].filter(s => s.priority === 'low').length
    }
  }

  const stats = getSummaryStats()

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-300">
          <p className="text-xs text-red-700 font-semibold">HIGH PRIORITY</p>
          <p className="text-2xl font-bold text-red-900">{stats.high}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-300">
          <p className="text-xs text-yellow-700 font-semibold">MEDIUM PRIORITY</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.medium}</p>
        </div>
      </div>

      {/* Criticality Assessment */}
      <div className={`
        p-4 rounded-lg border-2
        ${suggestions.summary.criticality === 'high' ? 'bg-red-50 border-red-300' : ''}
        ${suggestions.summary.criticality === 'medium' ? 'bg-yellow-50 border-yellow-300' : ''}
        ${suggestions.summary.criticality === 'low' ? 'bg-green-50 border-green-300' : ''}
      `}>
        <p className="text-sm font-semibold">
          {suggestions.summary.criticality === 'high' && '⚠ Critical: Major gaps identified. Significant edits recommended.'}
          {suggestions.summary.criticality === 'medium' && '📋 Moderate: Some improvements suggested to improve match score.'}
          {suggestions.summary.criticality === 'low' && '✓ Minor: Only small adjustments recommended for optimization.'}
        </p>
      </div>

      {/* Additions Section */}
      {suggestions.additions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="text-xl">➕</span> Missing Qualifications ({suggestions.additions.length})
          </h3>
          <div className="space-y-2">
            {suggestions.additions.map(suggestion => (
              <div key={suggestion.id} className={`border rounded-lg overflow-hidden ${getPriorityColor(suggestion.priority)}`}>
                <button
                  onClick={() => toggleExpanded(suggestion.id)}
                  className="w-full p-4 flex items-start justify-between hover:opacity-75 transition"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(suggestion.priority)}`}>
                        {getPriorityLabel(suggestion.priority)}
                      </span>
                      <p className="font-semibold">{suggestion.content}</p>
                    </div>
                    <p className="text-sm mt-1 opacity-90">{suggestion.reason}</p>
                  </div>
                  <span className="text-lg ml-2">
                    {expandedSuggestions[suggestion.id] ? '▼' : '▶'}
                  </span>
                </button>

                {expandedSuggestions[suggestion.id] && (
                  <div className="px-4 pb-4 border-t border-current opacity-75">
                    <div className="bg-white bg-opacity-50 p-3 rounded mt-2 text-sm">
                      <p className="font-semibold mb-1">Suggested edit:</p>
                      <p className="mb-2">Add to your <span className="font-semibold capitalize">{suggestion.section}</span> section:</p>
                      <code className="block p-2 bg-gray-100 rounded text-xs">
                        {suggestion.content}
                      </code>
                      <button
                        onClick={() => copyToClipboard(suggestion.content, suggestion.id)}
                        className="mt-2 px-3 py-1 bg-white bg-opacity-70 rounded text-xs font-semibold hover:bg-opacity-100"
                      >
                        {copiedId === suggestion.id ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewording Section */}
      {suggestions.rewords.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="text-xl">✏️</span> Rewording Suggestions ({suggestions.rewords.length})
          </h3>
          <div className="space-y-2">
            {suggestions.rewords.map(suggestion => (
              <div key={suggestion.id} className={`border rounded-lg overflow-hidden ${getPriorityColor(suggestion.priority)}`}>
                <button
                  onClick={() => toggleExpanded(suggestion.id)}
                  className="w-full p-4 flex items-start justify-between hover:opacity-75 transition"
                >
                  <div className="text-left max-w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded whitespace-nowrap ${getPriorityColor(suggestion.priority)}`}>
                        {getPriorityLabel(suggestion.priority)}
                      </span>
                      <p className="font-semibold">Improve experience entry</p>
                    </div>
                    <p className="text-sm opacity-90">{suggestion.reason}</p>
                  </div>
                  <span className="text-lg ml-2 flex-shrink-0">
                    {expandedSuggestions[suggestion.id] ? '▼' : '▶'}
                  </span>
                </button>

                {expandedSuggestions[suggestion.id] && (
                  <div className="px-4 pb-4 border-t border-current opacity-75">
                    <div className="space-y-3 mt-3">
                      <div>
                        <p className="text-xs font-semibold mb-2">Current text:</p>
                        <div className="bg-red-100 bg-opacity-50 p-3 rounded text-sm border-l-4 border-red-500">
                          {suggestion.fullCurrent}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-2">Suggested text:</p>
                        <div className="bg-green-100 bg-opacity-50 p-3 rounded text-sm border-l-4 border-green-500">
                          {suggestion.fullSuggested}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(suggestion.fullSuggested, suggestion.id)}
                        className="w-full px-3 py-2 bg-white bg-opacity-70 rounded text-sm font-semibold hover:bg-opacity-100 border"
                      >
                        {copiedId === suggestion.id ? '✓ Copied' : 'Copy suggested text'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {suggestions.additions.length === 0 && suggestions.rewords.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p className="text-lg">✨ No suggestions needed</p>
          <p className="text-sm">Your resume already matches well with this job description!</p>
        </div>
      )}

      {/* Implementation Tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-900 mb-2">💡 Implementation Tips:</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Start with <span className="font-semibold">high priority</span> suggestions first</li>
          <li>• Use keywords directly from the job description when rewriting</li>
          <li>• Keep your changes authentic - don't exaggerate your experience</li>
          <li>• Test your updated resume with "Compare & Rate" again</li>
        </ul>
      </div>
    </div>
  )
}

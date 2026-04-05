import React from 'react'

export default function MatchingScore({ results }) {
  const score = results.score || 0
  const components = results.components || {}
  const details = results.details || {}

  /**
   * Determine score rating and styling
   */
  const getScoreRating = (score) => {
    if (score >= 8.5) return { label: 'Excellent Match', class: 'score-excellent', color: 'green' }
    if (score >= 7) return { label: 'Good Match', class: 'score-good', color: 'blue' }
    if (score >= 5) return { label: 'Fair Match', class: 'score-fair', color: 'yellow' }
    return { label: 'Poor Match', class: 'score-poor', color: 'red' }
  }

  const rating = getScoreRating(score)

  /**
   * Get color for score bar
   */
  const getScoreBarColor = (score) => {
    if (score >= 8.5) return 'bg-green-500'
    if (score >= 7) return 'bg-blue-500'
    if (score >= 5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Main Score */}
      <div className={`card ${rating.class} text-center py-8`}>
        <p className="text-gray-700 font-semibold mb-2">Overall Match Score</p>
        <p className="text-6xl font-bold mb-2">{score.toFixed(1)}</p>
        <p className="text-2xl font-semibold">{rating.label}</p>
        <p className="text-sm text-gray-600 mt-3">out of 10.0</p>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Score Breakdown</h3>
        
        <div className="space-y-3">
          {/* Keyword Match */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Keyword Match (60%)</span>
              <span className="text-sm font-semibold text-gray-800">{components.keywordMatch?.toFixed(1) || '0.0'}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(components.keywordMatch || 0) * 10}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">Required skills and keywords found in your resume</p>
          </div>

          {/* NLP Similarity */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Experience Relevance (30%)</span>
              <span className="text-sm font-semibold text-gray-800">{components.nlpSimilarity?.toFixed(1) || '0.0'}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(components.nlpSimilarity || 0) * 10}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">Semantic match between your experience and job responsibilities</p>
          </div>

          {/* Experience Level */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Experience Level (10%)</span>
              <span className="text-sm font-semibold text-gray-800">{components.experienceLevel?.toFixed(1) || '0.0'}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${(components.experienceLevel || 0) * 10}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">Years of experience relative to job requirements</p>
          </div>
        </div>
      </div>

      {/* Match Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Match Details</h3>

        {/* Matched Skills */}
        {details.matchedSkills && details.matchedSkills.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">✓ Matched Skills ({details.matchedSkills.length})</h4>
            <div className="flex flex-wrap gap-2">
              {details.matchedSkills.slice(0, 6).map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-200 text-green-900 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
              {details.matchedSkills.length > 6 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  +{details.matchedSkills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {details.missingSkills && details.missingSkills.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">✗ Missing Skills ({details.missingSkills.length})</h4>
            <div className="flex flex-wrap gap-2">
              {details.missingSkills.slice(0, 6).map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-red-200 text-red-900 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
              {details.missingSkills.length > 6 && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  +{details.missingSkills.length - 6} more
                </span>
              )}
            </div>
            <p className="text-sm text-red-800 mt-3">Consider adding these skills if you have experience with them</p>
          </div>
        )}

        {/* Matched Qualifications */}
        {details.matchedQualifications && details.matchedQualifications.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">✓ Matched Qualifications ({details.matchedQualifications.length})</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {details.matchedQualifications.slice(0, 3).map((qual, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-lg">•</span>
                  <span>{qual}</span>
                </li>
              ))}
            </ul>
            {details.matchedQualifications.length > 3 && (
              <p className="text-sm text-blue-700 mt-2">+{details.matchedQualifications.length - 3} more qualifications matched</p>
            )}
          </div>
        )}

        {/* Missing Qualifications */}
        {details.missingQualifications && details.missingQualifications.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠ Missing Qualifications ({details.missingQualifications.length})</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              {details.missingQualifications.slice(0, 3).map((qual, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-lg">•</span>
                  <span>{qual}</span>
                </li>
              ))}
            </ul>
            {details.missingQualifications.length > 3 && (
              <p className="text-sm text-yellow-700 mt-2">+{details.missingQualifications.length - 3} more qualifications listed in job description</p>
            )}
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-sm text-indigo-800">
          <span className="font-semibold">💡 Click "Suggest Edits"</span> to see specific recommendations for improving your resume to match this job description.
        </p>
      </div>
    </div>
  )
}

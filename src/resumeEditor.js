/**
 * Generate comprehensive edit suggestions for resume optimization
 * Returns both missing additions and rewording suggestions
 * @param {Object} resume - Parsed resume object
 * @param {Object} requirements - Extracted job requirements
 * @param {Object} matchDetails - Match details from job matcher
 * @returns {Object} Edit suggestions with two categories
 */
export function suggestEdits(resume, requirements, matchDetails) {
  if (!resume || !requirements) {
    throw new Error('Resume and requirements must be provided')
  }

  const suggestions = {
    additions: [],
    rewords: [],
    summary: {
      totalSuggestions: 0,
      criticality: 'medium'
    }
  }

  // Generate missing additions suggestions
  const additionsSuggestions = generateAdditionsSuggestions(resume, requirements, matchDetails)
  suggestions.additions = additionsSuggestions

  // Generate rewording suggestions
  const rewordSuggestions = generateRewordingSuggestions(resume, requirements, matchDetails)
  suggestions.rewords = rewordSuggestions

  suggestions.summary.totalSuggestions = additionsSuggestions.length + rewordSuggestions.length

  // Determine overall criticality based on missing skills
  if (matchDetails && matchDetails.missingSkills) {
    if (matchDetails.missingSkills.length > 5) {
      suggestions.summary.criticality = 'high'
    } else if (matchDetails.missingSkills.length > 2) {
      suggestions.summary.criticality = 'medium'
    } else {
      suggestions.summary.criticality = 'low'
    }
  }

  return suggestions
}

/**
 * Generate suggestions for missing qualifications/skills to add
 * @param {Object} resume - Resume object
 * @param {Object} requirements - Job requirements
 * @param {Object} matchDetails - Match details
 * @returns {Array} Array of addition suggestions
 */
function generateAdditionsSuggestions(resume, requirements, matchDetails) {
  const suggestions = []

  if (!matchDetails) {
    return suggestions
  }

  // Suggest adding missing skills
  if (matchDetails.missingSkills && matchDetails.missingSkills.length > 0) {
    matchDetails.missingSkills.forEach((skill, index) => {
      suggestions.push({
        id: `add-skill-${index}`,
        type: 'add',
        section: 'skills',
        priority: index < 3 ? 'high' : 'medium',
        content: skill,
        reason: `The job description requires: "${skill}". Consider adding this skill to your resume if you have experience with it.`,
        category: 'missing-skill'
      })
    })
  }

  // Suggest adding missing qualifications
  if (matchDetails.missingQualifications && matchDetails.missingQualifications.length > 0) {
    matchDetails.missingQualifications.forEach((qual, index) => {
      suggestions.push({
        id: `add-qual-${index}`,
        type: 'add',
        section: 'education',
        priority: index < 2 ? 'high' : 'medium',
        content: qual,
        reason: `The job description mentions: "${qual}". If applicable to your background, consider highlighting this qualification.`,
        category: 'missing-qualification'
      })
    })
  }

  return suggestions.slice(0, 8) // Limit to top 8 suggestions
}

/**
 * Generate rewording suggestions to align with job description
 * @param {Object} resume - Resume object
 * @param {Object} requirements - Job requirements
 * @param {Object} matchDetails - Match details
 * @returns {Array} Array of rewording suggestions
 */
function generateRewordingSuggestions(resume, requirements, matchDetails) {
  const suggestions = []

  if (!resume.experience || resume.experience.length === 0) {
    return suggestions
  }

  // Analyze each experience entry and suggest alignments
  resume.experience.forEach((exp, index) => {
    const responsibilities = exp.responsibilities || ''

    if (!responsibilities.trim()) {
      return // Skip empty responsibilities
    }

    // Find best matching responsibility from job description
    const jobResponsibilities = requirements.responsibilities || []
    let bestMatch = null
    let bestScore = 0

    jobResponsibilities.forEach(jobResp => {
      const score = calculateTextSimilarity(responsibilities, jobResp)
      if (score > bestScore) {
        bestScore = score
        bestMatch = jobResp
      }
    })

    // If we found a reasonable match but could improve wording
    if (bestMatch && bestScore > 0.3 && bestScore < 0.9) {
      const suggestedText = enhanceWithJobKeywords(responsibilities, bestMatch)
      
      if (suggestedText !== responsibilities) {
        suggestions.push({
          id: `reword-exp-${index}`,
          type: 'reword',
          section: 'experience',
          experienceIndex: index,
          priority: 'medium',
          currentText: responsibilities.substring(0, 100),
          suggestedText: suggestedText.substring(0, 120),
          fullCurrent: responsibilities,
          fullSuggested: suggestedText,
          reason: `Align with job description requirements. Keywords from job posting: "${getBestKeywords(bestMatch, 3).join('", "')}".`,
          category: 'alignment'
        })
      }
    } else if (bestScore < 0.3) {
      // Suggest reframing with job keywords
      const keywordsFromJob = extractKeywordsFromResponsibilities(requirements.responsibilities)
      const reframedText = reframeWithKeywords(responsibilities, keywordsFromJob)
      
      if (reframedText !== responsibilities) {
        suggestions.push({
          id: `reword-exp-${index}-reframe`,
          type: 'reword',
          section: 'experience',
          experienceIndex: index,
          priority: 'low',
          currentText: responsibilities.substring(0, 100),
          suggestedText: reframedText.substring(0, 120),
          fullCurrent: responsibilities,
          fullSuggested: reframedText,
          reason: 'Consider using more job-relevant keywords to highlight similar accomplishments.',
          category: 'keyword-enhancement'
        })
      }
    }
  })

  return suggestions.slice(0, 5) // Limit to top 5 rewording suggestions
}

/**
 * Calculate similarity between two text strings (0-1 scale)
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Similarity score
 */
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0

  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)

  const commonWords = words1.filter(w => words2.includes(w))
  const totalWords = Math.max(words1.length, words2.length)

  return commonWords.length / totalWords
}

/**
 * Enhance text with keywords from target text
 * @param {string} currentText - Current resume text
 * @param {string} targetText - Target job description text to extract keywords from
 * @returns {string} Enhanced text with job keywords
 */
function enhanceWithJobKeywords(currentText, targetText) {
  const currentWords = new Set(currentText.toLowerCase().split(/\s+/))
  const targetWords = targetText.toLowerCase().split(/\s+/)

  // Extract keywords from target that aren't in current text
  const newKeywords = targetWords.filter(word =>
    !currentWords.has(word) &&
    word.length > 4 &&
    !isCommonWord(word)
  )

  if (newKeywords.length === 0) {
    return currentText
  }

  // Insert keywords naturally into the current text
  if (currentText.length < 100) {
    return `${currentText} (including ${newKeywords.slice(0, 2).join(' and ')})`
  } else {
    // Insert before a period or at the end
    const periodIndex = currentText.lastIndexOf('.')
    if (periodIndex > 0) {
      return `${currentText.substring(0, periodIndex)}, including ${newKeywords.slice(0, 2).join(', ')}${currentText.substring(periodIndex)}`
    }
    return `${currentText}. Skills: ${newKeywords.slice(0, 2).join(', ')}.`
  }
}

/**
 * Reframe text to emphasize job-relevant keywords
 * @param {string} currentText - Current text
 * @param {Array} keywords - Keywords to emphasize
 * @returns {string} Reframed text
 */
function reframeWithKeywords(currentText, keywords) {
  if (!keywords || keywords.length === 0) {
    return currentText
  }

  // Add relevant keywords at the beginning if the text is achievement-focused
  if (currentText.match(/^(Designed|Built|Developed|Created|Implemented|Led|Managed)/i)) {
    // Already strong, just add keywords
    return `${currentText} - proficient in ${keywords.slice(0, 2).join(', ')}`
  }

  // Otherwise, strengthen the opening verb
  const strengthenedStart = `Developed and maintained solutions involving ${keywords.slice(0, 2).join(' and ')}. `
  return strengthenedStart + currentText
}

/**
 * Extract keywords from responsibility descriptions
 * @param {Array} responsibilities - Array of responsibility strings
 * @returns {Array} Extracted keywords
 */
function extractKeywordsFromResponsibilities(responsibilities) {
  if (!Array.isArray(responsibilities)) {
    return []
  }

  const allWords = responsibilities.join(' ').toLowerCase().split(/\s+/)
  const keywords = allWords.filter(word =>
    word.length > 5 &&
    !isCommonWord(word) &&
    word.match(/^[a-z]/)
  )

  return [...new Set(keywords)].slice(0, 10)
}

/**
 * Get best keywords from text
 * @param {string} text - Text to extract keywords from
 * @param {number} count - Number of keywords to return
 * @returns {Array} Top keywords
 */
function getBestKeywords(text, count = 3) {
  const words = text.toLowerCase().split(/\s+/)
  const filtered = words.filter(word => word.length > 5 && !isCommonWord(word))
  return filtered.slice(0, count)
}

/**
 * Check if a word is a common English word (stop word)
 * @param {string} word - Word to check
 * @returns {boolean} True if common word
 */
function isCommonWord(word) {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'from', 'have', 'that', 'this', 'more', 'time',
    'other', 'which', 'their', 'your', 'they', 'been', 'have', 'were', 'also',
    'about', 'into', 'than', 'could', 'would', 'should', 'only', 'being', 'when',
    'where', 'what', 'some', 'such', 'these', 'those', 'will', 'work', 'well'
  ])

  return stopWords.has(word) || word.length < 3
}

/**
 * Apply a single suggestion to resume
 * Used for implementing suggestions into the resume
 * @param {Object} resume - Resume object
 * @param {Object} suggestion - Suggestion object
 * @returns {Object} Updated resume
 */
export function applySuggestion(resume, suggestion) {
  const updatedResume = JSON.parse(JSON.stringify(resume)) // Deep clone

  if (suggestion.type === 'add') {
    if (suggestion.section === 'skills') {
      updatedResume.skills.push({
        name: suggestion.content,
        level: undefined,
        years: undefined
      })
    } else if (suggestion.section === 'education') {
      updatedResume.education.push({
        school: '',
        degree: '',
        field: '',
        year: '',
        description: suggestion.content
      })
    }
  } else if (suggestion.type === 'reword') {
    if (suggestion.section === 'experience' && suggestion.experienceIndex !== undefined) {
      updatedResume.experience[suggestion.experienceIndex].responsibilities = suggestion.fullSuggested
    }
  }

  return updatedResume
}

/**
 * Format suggestions for display
 * @param {Array} suggestions - Array of suggestion objects
 * @returns {Array} Formatted suggestions
 */
export function formatSuggestionsForDisplay(suggestions) {
  return suggestions.map(suggestion => ({
    ...suggestion,
    displayText: getDisplayText(suggestion),
    diffHighlight: getDiffHighlight(suggestion)
  }))
}

/**
 * Get human-readable display text for a suggestion
 * @param {Object} suggestion - Suggestion object
 * @returns {string} Display text
 */
function getDisplayText(suggestion) {
  if (suggestion.type === 'add') {
    return `Add "${suggestion.content}" to ${suggestion.section}`
  } else if (suggestion.type === 'reword') {
    return `Reword ${suggestion.section} entry to better align with job description`
  }
  return suggestion.reason
}

/**
 * Get diff highlight markup for display
 * @param {Object} suggestion - Suggestion object
 * @returns {Object} Object with highlighted text
 */
function getDiffHighlight(suggestion) {
  if (suggestion.type !== 'reword') {
    return null
  }

  const current = suggestion.fullCurrent || suggestion.currentText
  const suggested = suggestion.fullSuggested || suggestion.suggestedText

  const highlighted = {}

  // Find differences
  const currentWords = current.split(/\s+/)
  const suggestedWords = suggested.split(/\s+/)

  // Simple diff: find what was added or changed
  const addedWords = suggestedWords.filter(word => !currentWords.includes(word))
  const removedWords = currentWords.filter(word => !suggestedWords.includes(word))

  highlighted.removed = removedWords
  highlighted.added = addedWords

  return highlighted
}

/**
 * Generate a summary of all suggestions
 * @param {Object} editSuggestions - Edit suggestions object from suggestEdits()
 * @returns {Object} Summary statistics
 */
export function getSuggestionsSummary(editSuggestions) {
  return {
    totalAdditions: editSuggestions.additions.length,
    totalRewords: editSuggestions.rewords.length,
    highPriority: [
      ...editSuggestions.additions.filter(s => s.priority === 'high'),
      ...editSuggestions.rewords.filter(s => s.priority === 'high')
    ].length,
    mediumPriority: [
      ...editSuggestions.additions.filter(s => s.priority === 'medium'),
      ...editSuggestions.rewords.filter(s => s.priority === 'medium')
    ].length,
    lowPriority: [
      ...editSuggestions.additions.filter(s => s.priority === 'low'),
      ...editSuggestions.rewords.filter(s => s.priority === 'low')
    ].length,
    criticality: editSuggestions.summary.criticality
  }
}

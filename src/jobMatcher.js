import nlp from 'compromise'

/**
 * Extract required skills, experience level, and qualifications from job description
 * @param {string} jobDescription - Full job description text
 * @returns {Object} Extracted requirements
 */
export function extractJobRequirements(jobDescription) {
  if (!jobDescription || typeof jobDescription !== 'string') {
    throw new Error('Job description must be a non-empty string')
  }

  const requirements = {
    skills: [],
    experience: {
      yearsRequired: 0,
      level: 'entry' // entry, mid, senior
    },
    qualifications: [],
    responsibilities: [],
    keywords: [],
    rawText: jobDescription
  }

  // Process with NLP
  const doc = nlp(jobDescription)

  // Extract years of experience requirement
  const yearMatches = jobDescription.match(/(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)/gi)
  if (yearMatches) {
    const years = parseInt(yearMatches[0].match(/\d+/)[0])
    requirements.experience.yearsRequired = years
    
    // Determine level based on years
    if (years >= 8) requirements.experience.level = 'senior'
    else if (years >= 4) requirements.experience.level = 'mid'
    else requirements.experience.level = 'entry'
  }

  // Extract required skills (common keywords)
  const skillKeywords = extractSkillKeywords(jobDescription)
  requirements.skills = skillKeywords

  // Extract qualifications
  const qualMatches = jobDescription.match(/(?:Required|Must have|Qualifications?)[:\n]+([^]*?)(?=\n(?:Nice to have|Skills|Responsibilities))/gi)
  if (qualMatches) {
    const qualText = qualMatches[0].replace(/(?:Required|Must have|Qualifications?)[:\n]*/gi, '')
    const quals = qualText.split(/[,\n]/).filter(q => q.trim() && q.trim().length > 5)
    requirements.qualifications = quals.map(q => q.trim())
  }

  // Extract responsibilities
  const respMatches = jobDescription.match(/(?:Responsibilities?|You will|You'll)[:\n]+([^]*?)(?=\n(?:Qualifications|Requirements|Nice to have|$))/gi)
  if (respMatches) {
    const respText = respMatches[0].replace(/(?:Responsibilities?|You will|You'll)[:\n]*/gi, '')
    const resps = respText.split(/[\n-•]/).filter(r => r.trim() && r.trim().length > 5)
    requirements.responsibilities = resps.map(r => r.replace(/^\d+\.\s*/, '').trim())
  }

  // Extract important keywords (nouns, proper nouns, technical terms)
  const termsExtracted = doc.nouns().out('array')
  requirements.keywords = [...new Set([...requirements.skills, ...termsExtracted])].slice(0, 30)

  return requirements
}

/**
 * Extract technical skills from text
 * @param {string} text - Text to analyze
 * @returns {Array} Array of identified skills
 */
function extractSkillKeywords(text) {
  // Common technical skill patterns
  const technicalSkills = [
    'javascript', 'python', 'java', 'csharp', 'c\\+\\+', 'php', 'ruby', 'go', 'rust', 'kotlin',
    'react', 'angular', 'vue', 'express', 'django', 'flask', 'spring', 'dotnet',
    'node.js', 'nodejs', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'linux', 'git', 'jenkins',
    'html', 'css', 'typescript', 'rest', 'graphql', 'api', 'microservices',
    'agile', 'scrum', 'jira', 'ci/cd', 'devops', 'cloud', 'ai', 'machine learning', 'data science'
  ]

  const foundSkills = []
  const textLower = text.toLowerCase()

  for (const skill of technicalSkills) {
    const regex = new RegExp(`\\b${skill}\\b`, 'gi')
    if (regex.test(textLower)) {
      foundSkills.push(skill.replace(/\\/g, ''))
    }
  }

  // Also extract exact phrases in quotes or after "including"/"such as"
  const phraseMatches = text.match(/(?:including|such as|like)[:\s]+([^,.]*)/gi)
  if (phraseMatches) {
    phraseMatches.forEach(phrase => {
      const skills = phrase.replace(/(?:including|such as|like)[:\s]*/i, '').split(/[,\s]+and\s+/)
      skills.forEach(s => {
        const trimmed = s.trim()
        if (trimmed && trimmed.length > 2) foundSkills.push(trimmed)
      })
    })
  }

  return [...new Set(foundSkills)]
}

/**
 * Calculate match score between resume and job requirements
 * Returns score 0-10 with component breakdown
 * @param {Object} resume - Parsed resume object
 * @param {Object} requirements - Extracted job requirements
 * @returns {Object} Score and component breakdown
 */
export function calculateMatchScore(resume, requirements) {
  if (!resume || !requirements) {
    throw new Error('Resume and requirements must be provided')
  }

  // Component scores (each 0-100)
  const keywordMatchScore = calculateKeywordMatch(resume, requirements)
  const nlpSimilarityScore = calculateNLPSimilarity(resume, requirements)
  const experienceLevelScore = calculateExperienceMatch(resume, requirements)

  // Weighted average: keywords 60%, NLP 30%, experience 10%
  const totalScore = (
    keywordMatchScore * 0.6 +
    nlpSimilarityScore * 0.3 +
    experienceLevelScore * 0.1
  ) / 100

  // Convert to 0-10 scale
  const score = Math.min(10, Math.max(0, totalScore * 10))

  return {
    score: parseFloat(score.toFixed(2)),
    components: {
      keywordMatch: parseFloat((keywordMatchScore / 10).toFixed(2)),
      nlpSimilarity: parseFloat((nlpSimilarityScore / 10).toFixed(2)),
      experienceLevel: parseFloat((experienceLevelScore / 10).toFixed(2))
    },
    matchDetails: generateMatchDetails(resume, requirements)
  }
}

/**
 * Calculate keyword matching score
 * @param {Object} resume - Resume object
 * @param {Object} requirements - Job requirements
 * @returns {number} Score 0-100
 */
function calculateKeywordMatch(resume, requirements) {
  const resumeText = `${resume.name} ${resume.summary} ${resume.skills.map(s => s.name).join(' ')} ${resume.experience.map(e => e.responsibilities).join(' ')}`.toLowerCase()

  let matches = 0
  let totalKeywords = 0

  // Check required skills
  requirements.skills.forEach(skill => {
    totalKeywords++
    if (resumeText.includes(skill.toLowerCase())) {
      matches += 2 // Weight skills heavily
    }
  })

  // Check qualifications
  requirements.qualifications.forEach(qual => {
    totalKeywords++
    // Loose matching - check if any significant word from qualification is in resume
    const qualWords = qual.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const wordMatches = qualWords.filter(w => resumeText.includes(w))
    if (wordMatches.length >= Math.ceil(qualWords.length * 0.5)) {
      matches += 1
    }
  })

  // Check keywords
  if (totalKeywords === 0) totalKeywords = 1 // Prevent division by zero
  const score = (matches / (totalKeywords * 2)) * 100

  return Math.min(100, score)
}

/**
 * Calculate NLP-based semantic similarity
 * Uses compromise.js for basic NLP analysis
 * @param {Object} resume - Resume object
 * @param {Object} requirements - Job requirements
 * @returns {number} Score 0-100
 */
function calculateNLPSimilarity(resume, requirements) {
  const resumeFullText = `${resume.summary} ${resume.experience.map(e => e.responsibilities).join(' ')}`
  const jobFullText = requirements.responsibilities.join(' ')

  if (!resumeFullText.trim() || !jobFullText.trim()) {
    return 0
  }

  // Process both texts with NLP
  const resumeDoc = nlp(resumeFullText)
  const jobDoc = nlp(jobFullText)

  // Extract verbs and nouns from both sides
  const resumeVerbs = resumeDoc.verbs().out('array')
  const jobVerbs = jobDoc.verbs().out('array')
  const resumeNouns = resumeDoc.nouns().out('array')
  const jobNouns = jobDoc.nouns().out('array')

  // Calculate overlap
  const verbOverlap = resumeVerbs.filter(v => jobVerbs.some(jv => similarity(v, jv) > 0.8)).length
  const nounOverlap = resumeNouns.filter(n => jobNouns.some(jn => similarity(n, jn) > 0.8)).length

  const totalJobTerms = Math.max(jobVerbs.length + jobNouns.length, 1)
  const overlapScore = ((verbOverlap + nounOverlap) / totalJobTerms) * 100

  return Math.min(100, overlapScore)
}

/**
 * Calculate experience level match
 * @param {Object} resume - Resume object
 * @param {Object} requirements - Job requirements
 * @returns {number} Score 0-100
 */
function calculateExperienceMatch(resume, requirements) {
  const resumeExperience = resume.experience.length
  const requiredYears = requirements.experience.yearsRequired

  // Simple heuristic: assume ~2 years per experience entry
  const estimatedYears = resumeExperience * 2

  if (estimatedYears >= requiredYears) {
    return 100
  } else if (estimatedYears >= requiredYears * 0.75) {
    return 75
  } else if (estimatedYears >= requiredYears * 0.5) {
    return 50
  } else {
    return Math.max(0, (estimatedYears / requiredYears) * 100)
  }
}

/**
 * Generate detailed match insights
 * @param {Object} resume - Resume object
 * @param {Object} requirements - Job requirements
 * @returns {Object} Detailed matching info
 */
export function generateMatchDetails(resume, requirements) {
  const resumeText = `${resume.name} ${resume.summary} ${resume.skills.map(s => s.name).join(' ')}`.toLowerCase()

  // Matched skills
  const matchedSkills = requirements.skills.filter(skill =>
    resumeText.includes(skill.toLowerCase())
  )

  // Missing skills
  const missingSkills = requirements.skills.filter(skill =>
    !resumeText.includes(skill.toLowerCase())
  )

  // Matched qualifications
  const matchedQualifications = requirements.qualifications.filter(qual => {
    const qualWords = qual.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const wordMatches = qualWords.filter(w => resumeText.includes(w))
    return wordMatches.length >= Math.ceil(qualWords.length * 0.6)
  })

  // Missing qualifications
  const missingQualifications = requirements.qualifications.filter(qual => {
    const qualWords = qual.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const wordMatches = qualWords.filter(w => resumeText.includes(w))
    return wordMatches.length < Math.ceil(qualWords.length * 0.6)
  })

  return {
    matchedSkills,
    missingSkills,
    matchedQualifications,
    missingQualifications,
    strengths: resume.skills.slice(0, 5).map(s => s.name),
    gaps: missingSkills.slice(0, 5)
  }
}

/**
 * Simple string similarity function (Levenshtein-like)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score 0-1
 */
function similarity(str1, str2) {
  if (!str1 || !str2) return 0

  str1 = str1.toLowerCase()
  str2 = str2.toLowerCase()

  if (str1 === str2) return 1
  if (str1.includes(str2) || str2.includes(str1)) return 0.9

  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1
  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calculate Levenshtein edit distance
 * @param {string} s1 - First string
 * @param {string} s2 - Second string
 * @returns {number} Edit distance
 */
function getEditDistance(s1, s2) {
  const costs = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  return costs[s2.length]
}

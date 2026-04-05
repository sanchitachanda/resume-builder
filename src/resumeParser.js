import { marked } from 'marked'
import mammoth from 'mammoth'

/**
 * Standardized resume JSON structure
 */
export const RESUME_SCHEMA = {
  name: '',
  email: '',
  phone: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
  rawText: ''
}

/**
 * Main dispatcher - detects file type and routes to appropriate parser
 * @param {File} file - File object from upload
 * @returns {Promise<Object>} Standardized resume JSON
 */
export async function parseResume(file) {
  if (!file) {
    throw new Error('No file provided')
  }

  const fileType = file.type
  const fileName = file.name.toLowerCase()

  try {
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      return await parseDOCX(file)
    } else if (fileType === 'text/markdown' || fileName.endsWith('.md')) {
      const content = await file.text()
      return parseMarkdown(content)
    } else if (fileType === 'application/json' || fileName.endsWith('.json')) {
      const content = await file.text()
      return parseJSON(content)
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      const content = await file.text()
      return parseText(content)
    } else {
      throw new Error(`Unsupported file type: ${fileType}. Supported formats: DOCX, Markdown, JSON, Text`)
    }
  } catch (error) {
    throw new Error(`Error parsing file: ${error.message}`)
  }
}

/**
 * Parse DOCX file using mammoth library
 * @param {File} file - DOCX file
 * @returns {Promise<Object>} Standardized resume JSON
 */
export async function parseDOCX(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    const text = result.value
    return parseText(text)
  } catch (error) {
    throw new Error(`Error parsing DOCX file: ${error.message}`)
  }
}

/**
 * Parse plain text resume
 * Uses regex to extract common resume sections
 * @param {string} content - Text content
 * @returns {Object} Standardized resume JSON
 */
export function parseText(content) {
  const resume = { ...RESUME_SCHEMA }
  resume.rawText = content

  // Extract name (usually first meaningful line that's not a section header)
  const nameMatch = content.split('\n')[0]
  if (nameMatch && nameMatch.trim().length > 0 && !nameMatch.match(/^[A-Z\s]+[^a-z0-9]*$/i)) {
    resume.name = nameMatch.trim()
  }

  // Extract email
  const emailMatch = content.match(/[\w\.-]+@[\w\.-]+\.\w+/)
  if (emailMatch) {
    resume.email = emailMatch[0]
  }

  // Extract phone
  const phoneMatch = content.match(/(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/)
  if (phoneMatch) {
    resume.phone = phoneMatch[0]
  }

  // Extract skills section
  const skillsMatch = content.match(/(?:Skills?|Technical Skills?|Core Competencies?)[:\n]+([^]*?)(?=\n(?:[A-Z][a-z]+|$))/gi)
  if (skillsMatch) {
    const skillsText = skillsMatch[0].replace(/(?:Skills?|Technical Skills?|Core Competencies?)[:\n]*/gi, '')
    const skillsList = skillsText.split(/[,\n]/).filter(s => s.trim())
    resume.skills = skillsList.map(skill => ({
      name: skill.trim(),
      level: undefined,
      years: undefined
    }))
  }

  // Extract experience section
  const expMatch = content.match(/(?:Experience|Work Experience|Professional Experience)[:\n]+([^]*?)(?=\n(?:Education|Skills|$))/gi)
  if (expMatch) {
    const expText = expMatch[0].replace(/(?:Experience|Work Experience|Professional Experience)[:\n]*/gi, '')
    // Split by common patterns (company name followed by job title or dates)
    const jobs = expText.split(/\n(?=[A-Z][a-z]|\d{4})/).filter(j => j.trim())
    resume.experience = jobs.map(job => ({
      company: '',
      role: '',
      duration: '',
      responsibilities: job.trim()
    }))
  }

  // Extract education section
  const eduMatch = content.match(/(?:Education|Academic Background)[:\n]+([^]*?)(?=\n(?:Experience|Skills|$))/gi)
  if (eduMatch) {
    const eduText = eduMatch[0].replace(/(?:Education|Academic Background)[:\n]*/gi, '')
    const schools = eduText.split(/\n/).filter(e => e.trim())
    resume.education = schools.map(school => ({
      school: '',
      degree: '',
      field: '',
      year: '',
      description: school.trim()
    }))
  }

  // Extract summary (usually after name, before Experience)
  const summaryMatch = content.match(/(?:Summary|Professional Summary|Objective)[:\n]+([^]*?)(?=\n(?:Experience|Skills|Education))/gi)
  if (summaryMatch) {
    resume.summary = summaryMatch[0].replace(/(?:Summary|Professional Summary|Objective)[:\n]*/gi, '').trim()
  }

  return resume
}

/**
 * Parse Markdown formatted resume
 * @param {string} content - Markdown content
 * @returns {Object} Standardized resume JSON
 */
export function parseMarkdown(content) {
  const resume = { ...RESUME_SCHEMA }
  resume.rawText = content

  const lines = content.split('\n')
  let currentSection = null

  for (const line of lines) {
    // H1 header - likely name
    if (line.startsWith('# ')) {
      resume.name = line.replace(/^# /, '').trim()
    }
    // H2 headers - section identifiers
    if (line.startsWith('## ')) {
      currentSection = line.replace(/^## /, '').toLowerCase().trim()
    }

    // Extract email from content
    const emailMatch = line.match(/[\w\.-]+@[\w\.-]+\.\w+/)
    if (emailMatch && !resume.email) {
      resume.email = emailMatch[0]
    }

    // Extract phone from content
    const phoneMatch = line.match(/(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/)
    if (phoneMatch && !resume.phone) {
      resume.phone = phoneMatch[0]
    }

    // Process section content
    if (currentSection) {
      if (currentSection.includes('skill')) {
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const skill = line.replace(/^[\-\*] /, '').trim()
          if (skill) {
            resume.skills.push({ name: skill, level: undefined, years: undefined })
          }
        }
      } else if (currentSection.includes('education')) {
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const edu = line.replace(/^[\-\*] /, '').trim()
          if (edu) {
            resume.education.push({
              school: '',
              degree: '',
              field: '',
              year: '',
              description: edu
            })
          }
        }
      } else if (currentSection.includes('experience') || currentSection.includes('work')) {
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const exp = line.replace(/^[\-\*] /, '').trim()
          if (exp) {
            resume.experience.push({
              company: '',
              role: '',
              duration: '',
              responsibilities: exp
            })
          }
        }
      } else if (currentSection.includes('summary') || currentSection.includes('objective')) {
        if (!line.startsWith('#') && line.trim()) {
          resume.summary += (resume.summary ? ' ' : '') + line.trim()
        }
      }
    }
  }

  return resume
}

/**
 * Parse JSON formatted resume
 * Validates structure and fills in defaults for missing fields
 * @param {string} jsonContent - JSON string
 * @returns {Object} Standardized resume JSON
 */
export function parseJSON(jsonContent) {
  try {
    const data = JSON.parse(jsonContent)
    const resume = { ...RESUME_SCHEMA }

    // Map provided fields to schema
    if (data.name) resume.name = data.name
    if (data.email) resume.email = data.email
    if (data.phone) resume.phone = data.phone
    if (data.summary) resume.summary = data.summary
    
    if (Array.isArray(data.skills)) {
      resume.skills = data.skills.map(skill => ({
        name: typeof skill === 'string' ? skill : skill.name || '',
        level: skill.level || undefined,
        years: skill.years || undefined
      }))
    }

    if (Array.isArray(data.experience)) {
      resume.experience = data.experience.map(exp => ({
        company: exp.company || '',
        role: exp.role || '',
        duration: exp.duration || '',
        responsibilities: exp.responsibilities || exp.description || ''
      }))
    }

    if (Array.isArray(data.education)) {
      resume.education = data.education.map(edu => ({
        school: edu.school || '',
        degree: edu.degree || '',
        field: edu.field || '',
        year: edu.year || '',
        description: edu.description || ''
      }))
    }

    resume.rawText = JSON.stringify(data)
    return resume
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error.message}`)
  }
}

/**
 * Validate resume structure
 * @param {Object} resume - Resume object to validate
 * @returns {boolean} True if valid
 */
export function validateResume(resume) {
  return (
    typeof resume === 'object' &&
    typeof resume.name === 'string' &&
    Array.isArray(resume.skills) &&
    Array.isArray(resume.experience) &&
    Array.isArray(resume.education) &&
    typeof resume.rawText === 'string'
  )
}

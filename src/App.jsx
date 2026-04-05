import React, { useState } from 'react'
import ResumeUpload from './components/ResumeUpload'
import JobDescriptionInput from './components/JobDescriptionInput'
import CompareButton from './components/CompareButton'
import MatchingScore from './components/MatchingScore'
import EditSuggestions from './components/EditSuggestions'
import { parseResume } from './resumeParser'
import { extractJobRequirements, calculateMatchScore } from './jobMatcher'
import { suggestEdits } from './resumeEditor'

export default function App() {
  const [uploadedResume, setUploadedResume] = useState(null)
  const [resumeFileName, setResumeFileName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [matchingResults, setMatchingResults] = useState(null)
  const [editSuggestions, setEditSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [showEdits, setShowEdits] = useState(false)

  /**
   * Handle resume file upload
   */
  const handleResumeUpload = async (files) => {
    if (!files || files.length === 0) return

    const file = files[0]
    setResumeFileName(file.name)
    setLoading(true)
    setError(null)

    try {
      const parsed = await parseResume(file)
      setUploadedResume(parsed)
      setError(null)
    } catch (err) {
      setError(`Error parsing resume: ${err.message}`)
      setUploadedResume(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle job description input change
   */
  const handleJobDescriptionChange = (text) => {
    setJobDescription(text)
  }

  /**
   * Handle compare button click
   */
  const handleCompare = () => {
    if (!uploadedResume || !jobDescription) {
      setError('Please upload a resume and enter a job description')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Extract job requirements
      const requirements = extractJobRequirements(jobDescription)

      // Calculate match score
      const results = calculateMatchScore(uploadedResume, requirements)

      // Store results
      setMatchingResults({
        score: results.score,
        components: results.components,
        details: results.matchDetails,
        requirements: requirements
      })

      setShowResults(true)
      setShowEdits(false)
      setEditSuggestions(null)
    } catch (err) {
      setError(`Error comparing resume: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle suggest edits button click
   */
  const handleSuggestEdits = () => {
    if (!matchingResults || !uploadedResume) {
      setError('Please compare first before suggesting edits')
      return
    }

    try {
      const suggestions = suggestEdits(uploadedResume, matchingResults.requirements, matchingResults.details)
      setEditSuggestions(suggestions)
      setShowEdits(true)
    } catch (err) {
      setError(`Error generating suggestions: ${err.message}`)
    }
  }

  /**
   * Clear all data
   */
  const handleClear = () => {
    setUploadedResume(null)
    setResumeFileName('')
    setJobDescription('')
    setMatchingResults(null)
    setEditSuggestions(null)
    setShowResults(false)
    setShowEdits(false)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Resume Builder</h1>
        <p className="text-gray-600 text-lg">Match your resume with job descriptions and optimize with AI-powered suggestions</p>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Resume Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Upload Resume</h2>
            <ResumeUpload
              onUpload={handleResumeUpload}
              fileName={resumeFileName}
              loading={loading}
            />
            {uploadedResume && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-semibold">✓ Resume uploaded successfully</p>
                <p className="text-sm text-green-600 mt-1">
                  Detected: {uploadedResume.skills.length} skills, {uploadedResume.experience.length} experiences
                </p>
              </div>
            )}
          </div>

          {/* Job Description Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Paste Job Description</h2>
            <JobDescriptionInput
              value={jobDescription}
              onChange={handleJobDescriptionChange}
            />
            {jobDescription && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 font-semibold">✓ Job description entered</p>
                <p className="text-sm text-blue-600 mt-1">
                  {jobDescription.length} characters
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <CompareButton
              onClick={handleCompare}
              disabled={!uploadedResume || !jobDescription || loading}
              loading={loading}
            />
            <button
              onClick={handleClear}
              className="btn btn-secondary flex-1"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Matching Score Section */}
          {showResults && matchingResults && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Match Results</h2>
              <MatchingScore results={matchingResults} />
              
              {/* Suggest Edits Button */}
              <button
                onClick={handleSuggestEdits}
                className="w-full btn btn-primary mt-6"
              >
                💡 Suggest Edits
              </button>
            </div>
          )}

          {/* Edit Suggestions Section */}
          {showEdits && editSuggestions && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Suggestions</h2>
              <EditSuggestions suggestions={editSuggestions} />
            </div>
          )}

          {/* Empty State */}
          {!showResults && (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-gray-600">
                Upload a resume and enter a job description to see matching results here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-12 text-gray-600">
        <p>Resume Builder • Optimize your resume for every job posting</p>
      </footer>
    </div>
  )
}

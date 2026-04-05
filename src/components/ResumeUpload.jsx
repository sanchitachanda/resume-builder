import React from 'react'
import { useDropzone } from 'react-dropzone'

export default function ResumeUpload({ onUpload, fileName, loading }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'text/markdown': ['.md']
    },
    multiple: false,
    disabled: loading
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
        ${isDragActive ? 'drag-active border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="text-4xl mb-4">📄</div>
      
      {loading ? (
        <div>
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : isDragActive ? (
        <div>
          <p className="text-blue-700 font-semibold">Drop your resume here</p>
          <p className="text-blue-600 text-sm mt-1">DOCX, Text, JSON, or Markdown</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-800 font-semibold mb-2">Drag and drop your resume here</p>
          <p className="text-gray-600 text-sm mb-4">or click to select a file</p>
          <p className="text-gray-500 text-xs">Supported formats: DOCX, TXT, JSON, MD</p>
        </div>
      )}

      {fileName && !loading && (
        <div className="mt-4 text-sm text-gray-600">
          <p>Selected: <span className="font-semibold text-gray-800">{fileName}</span></p>
        </div>
      )}
    </div>
  )
}

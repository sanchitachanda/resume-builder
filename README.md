# Resume Builder - Match & Optimize

An AI-powered resume analysis tool that compares your resume with job descriptions and provides targeted edit suggestions to improve your match score.

## Features

✨ **Resume Parsing**
- Upload resumes in multiple formats: DOCX, Markdown, JSON, or plain text
- Automatic extraction of resume data into a standardized JSON format
- Support for extracting: name, email, phone, summary, skills, experience, and education

🔍 **Job Matching**
- Compare your resume against job descriptions
- Hybrid matching algorithm using:
  - Keyword matching (60%) - checks for required skills and keywords
  - NLP semantic similarity (30%) - compares experience relevance
  - Experience level matching (10%) - evaluates years of experience
- Numeric scoring on a 0-10 scale with detailed breakdown

💡 **Edit Suggestions**
- View missing skills and qualifications
- Get specific rewording suggestions with examples
- See which qualifications are matched
- Copy-to-clipboard for easy implementation

📊 **Detailed Results**
- Visualization of match score with breakdown by category
- Color-coded results (green for matches, red for gaps)
- List of matched and missing qualifications
- Strength and gap analysis

## Tech Stack

- **Frontend**: React 18+ with Vite
- **Styling**: Tailwind CSS
- **File Parsing**: 
  - Mammoth.js for DOCX files
  - Marked for Markdown files
  - Native JSON parsing for JSON files
  - Regex-based extraction for plain text
- **NLP**: Compromise.js for lightweight semantic analysis
- **Build Tool**: Vite

## Installation

### Required
- Node.js 16+ and npm

### Steps

1. **Clone the repository**
```bash
cd resume-builder
```

2. **Install dependencies**
```bash
npm install
```

## Usage

### Development

```bash
npm run dev
```

This will start the Vite development server at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## How to Use the App

1. **Upload Your Resume**
   - Drag and drop a file onto the upload area, or click to select
   - Supported formats: DOCX, Markdown (.md), JSON, or plain text (.txt)

2. **Enter Job Description**
   - Paste the complete job description into the text area
   - Include responsibilities, required skills, qualifications, and experience level
   - Aim for at least 500 characters for accurate analysis

3. **Click "Compare & Rate"**
   - The app analyzes your resume against the job requirements
   - You'll see a 0-10 match score with component breakdown
   - View matched skills, missing skills, and qualification gaps

4. **View Suggestions (Optional)**
   - Click "Suggest Edits" to see specific recommendations
   - Two categories:
     - **Missing Qualifications**: Skills or qualifications you should add
     - **Rewording Suggestions**: Ways to improve your existing content
   - Copy suggestions directly to your clipboard

5. **Iterate**
   - Update your resume based on suggestions
   - Upload the updated version and compare again
   - Repeat until you reach your desired match score

## Resume Format Guidelines

### Plain Text (.txt)
- Use clear section headers: Experience, Education, Skills, Summary
- One line per skill
- Company name and job title on separate lines when possible

### Markdown (.md)
- Use standard markdown headers (# for name, ## for sections)
- Use bullet points for lists
- Example:
```markdown
# John Doe
## Skills
- Python
- React
- AWS

## Experience
- Developed web applications using React
```

### JSON (.json)
- Must include these fields:
```json
{
  "name": "Your Name",
  "email": "email@example.com",
  "phone": "123-456-7890",
  "summary": "Professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "2020-2023",
      "responsibilities": "What you did"
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "BS",
      "field": "Computer Science",
      "year": "2020"
    }
  ]
}
```

### DOCX (.docx)
- Standard Microsoft Word format
- Supported resume layouts work best

## Score Interpretation

| Score | Rating | Meaning |
|-------|--------|---------|
| 8.5-10 | Excellent Match | Your resume is well-aligned with the job |
| 7-8.5 | Good Match | Most requirements are met with minor gaps |
| 5-7 | Fair Match | Some overlap, but significant gaps exist |
| 0-5 | Poor Match | Limited alignment with job requirements |

## Features in Detail

### Keyword Matching (60% weight)
- Checks if your resume contains the required skills mentioned in the job description
- Looks for exact keyword matches and variations
- Higher weight because job descriptions are keyword-centric

### NLP Similarity (30% weight)
- Uses Compromise.js to analyze semantic meaning
- Compares the verbs and nouns in your experience descriptions with job responsibilities
- Helps identify conceptual matches even if keywords differ

### Experience Level (10% weight)
- Estimates total years of experience from resume entries
- Compares against experience requirements in the job description
- Provides perfect score if you meet or exceed requirements

## Suggestions Algorithm

### Missing Additions
- Identifies required skills in the job description that are absent from your resume
- Ranks by priority based on frequency and importance
- Suggests exact text to add

### Rewording Suggestions
- Analyzes each experience entry for keyword alignment
- Recommends incorporating job-specific terminology
- Shows before/after examples
- Prioritizes entries with lowest relevance scores

## Limitations & Known Issues

- **PDF files**: Currently not supported. Convert PDFs to DOCX or text first
- **Partial parsing**: Some complex resume layouts may not parse perfectly
- **Language**: English resumes only
- **AI sophistication**: While uses NLP, results are rule-based, not ML/deep learning
- **Privacy**: All processing happens in your browser; nothing is saved or sent to servers

## Future Enhancements

- [ ] PDF file support
- [ ] Support for additional languages
- [ ] Grammar and spell check suggestions
- [ ] Resume template generator
- [ ] Interview question suggestions based on resume
- [ ] Salary range prediction
- [ ] ATS (Applicant Tracking System) optimization tips
- [ ] Resume comparison analytics
- [ ] Export suggestions as PDF or Word document

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern browsers with ES6 support

## Performance

- All processing happens client-side (in your browser)
- Fast parsing for most file sizes
- No server calls = instant results and complete privacy
- Suitable for use with resumes up to 10,000 characters

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Support

For issues, feature requests, or questions, please open an issue on GitHub.

---

**Made with ❤️ to help you land your dream job!**

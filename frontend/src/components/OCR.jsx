import React, { useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Globe,
  Wrench,
  Eye,
} from "lucide-react";

const ResumeSummarizer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);

  // Replace with your actual Gemini API key
  const GEMINI_API_KEY = "AIzaSyBoc8G9zbFUiMRrj_h2xTBAFId0Q55x6so";

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
      setSummary("");
      setExtractedText("");
      setShowExtractedText(false);
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Extract text from PDF using PDF.js (loaded via CDN)
  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = async function () {
        try {
          // Load PDF.js library dynamically
          if (!window.pdfjsLib) {
            const script = document.createElement("script");
            script.src =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            document.head.appendChild(script);

            await new Promise((resolve) => {
              script.onload = resolve;
            });

            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          }

          const typedarray = new Uint8Array(this.result);
          const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item) => item.str)
              .join(" ");
            fullText += pageText + "\n";
          }

          resolve(fullText);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error("Failed to read file"));
      fileReader.readAsArrayBuffer(file);
    });
  };

  // Summarize text using Gemini API
  const summarizeWithGemini = async (text) => {
    const prompt = `You are an AI helping recruiters summarize resumes of job applicants.

Generate a short, structured summary of the following resume:

Resume:
"""
${text}
"""

Summary (include Name, Education, Skills, Experience, Roles fit for, Languages, Certifications):`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.candidates[0]?.content?.parts[0]?.text || "No summary generated"
    );
  };

  const processResume = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("your-api-key")) {
      setError("Please configure your Gemini API key in the code");
      return;
    }

    setLoading(true);
    setError("");
    setSummary("");

    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file);
      setExtractedText(text);

      if (!text || text.trim().length === 0) {
        throw new Error("Could not extract text from PDF or PDF is empty");
      }

      // Generate summary using Gemini
      const summaryText = await summarizeWithGemini(text);
      setSummary(summaryText);
    } catch (err) {
      console.error("Error processing resume:", err);
      if (err.message.includes("Gemini API")) {
        setError(
          "Failed to generate summary. Please check your API key and internet connection."
        );
      } else if (err.message.includes("extract text")) {
        setError(
          "Could not extract text from this PDF. Please try a different file."
        );
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([summary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "resume_summary.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatSummary = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const sections = [];
    let currentSection = { title: "", content: [] };

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (
        trimmedLine.includes(":") &&
        !trimmedLine.startsWith("*") &&
        !trimmedLine.startsWith("-")
      ) {
        if (currentSection.title) {
          sections.push(currentSection);
        }
        const [title, ...content] = trimmedLine.split(":");
        currentSection = {
          title: title.trim(),
          content: content.join(":").trim() ? [content.join(":").trim()] : [],
        };
      } else if (trimmedLine) {
        currentSection.content.push(trimmedLine);
      }
    });

    if (currentSection.title) {
      sections.push(currentSection);
    }

    return sections;
  };

  const formatContentWithTags = (content) => {
    return content.map((item) => {
      // Convert bullet points and special formatting
      let formatted = item
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
        .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic text
        .replace(/- /g, "• ") // Convert dashes to bullets
        .replace(/\|/g, " • "); // Convert pipes to bullets

      return formatted;
    });
  };

  const getSectionIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("name")) return <User className="w-5 h-5" />;
    if (lowerTitle.includes("education"))
      return <GraduationCap className="w-5 h-5" />;
    if (lowerTitle.includes("experience") || lowerTitle.includes("role"))
      return <Briefcase className="w-5 h-5" />;
    if (lowerTitle.includes("skill")) return <Wrench className="w-5 h-5" />;
    if (lowerTitle.includes("language")) return <Globe className="w-5 h-5" />;
    if (lowerTitle.includes("certification"))
      return <Award className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Resume Summarizer
          </h1>
          <p className="text-gray-600">
            Upload your PDF resume and get an AI-powered summary instantly
          </p>
          <p className="text-sm text-gray-500 mt-2">
            ✨ Frontend-only processing - No server required!
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : file
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              {file ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-500" />
                  <div>
                    <p className="text-green-700 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      Drop your PDF resume here or
                    </p>
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                      browse files
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={processResume}
              disabled={!file || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Resume...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Generate Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Extracted Text Section */}
        {extractedText && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Extracted Text
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="text-sm text-gray-700 space-y-1">
                {extractedText
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, index) => (
                    <p key={index} className="leading-relaxed">
                      {line.trim()}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Section */}
        {summary && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Resume Summary
              </h2>
              <button
                onClick={downloadSummary}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>

            {/* Summary Content - Line by Line */}
            <div className="space-y-4">
              {summary
                .split("\n")
                .filter((line) => line.trim())
                .map((line, index) => {
                  const trimmedLine = line.trim();

                  // Check if line is a section header (contains colon and not a bullet point)
                  const isHeader =
                    trimmedLine.includes(":") &&
                    !trimmedLine.startsWith("*") &&
                    !trimmedLine.startsWith("-") &&
                    !trimmedLine.startsWith("•");

                  if (isHeader) {
                    const [title, ...content] = trimmedLine.split(":");
                    return (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {getSectionIcon(title)}
                          <h3 className="text-lg font-semibold text-gray-800">
                            {title.trim()}
                          </h3>
                        </div>
                        {content.join(":").trim() && (
                          <p className="text-gray-700 ml-7">
                            {content.join(":").trim()}
                          </p>
                        )}
                      </div>
                    );
                  } else if (trimmedLine) {
                    // Regular content line
                    return (
                      <div
                        key={index}
                        className="ml-7 flex items-start space-x-2"
                      >
                        <span className="text-blue-500 mt-2">•</span>
                        <p className="text-gray-700 leading-relaxed flex-1">
                          {trimmedLine
                            .replace(/^\*+\s*/, "")
                            .replace(/^-\s*/, "")}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Generated on {new Date().toLocaleDateString()}</span>
                <span>Powered by Gemini AI</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Powered by Gemini AI & PDF.js | Client-side processing</p>
          <p className="text-xs mt-1">
            Make sure to add your Gemini API key in the code
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeSummarizer;

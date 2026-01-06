import React, { useState } from "react";
import { X, BookOpen, Loader, FileText, AlertCircle, CheckCircle } from "lucide-react";
import QuizTaker from "./QuizTaker";

// Helper function to extract text from TipTap JSON content
function extractTextFromTipTap(content) {
  if (!content) return "";
  
  // If it's already a string, return it
  if (typeof content === "string") {
    return content;
  }
  
  // If it's not an object, convert to string
  if (typeof content !== "object") {
    return String(content);
  }
  
  // Handle PDF content structure
  if (content.type === "pdf" && content.text) {
    return content.text;
  }
  
  // Handle TipTap JSON structure
  const extractFromNode = (node) => {
    if (!node) return "";
    
    let text = "";
    
    // Extract text from the node itself
    if (node.text) {
      text += node.text;
    }
    
    // Recursively extract from content array
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        text += extractFromNode(child);
      }
      // Add newlines between paragraphs, headings, list items
      if (["paragraph", "heading", "listItem", "blockquote"].includes(node.type)) {
        text += "\n";
      }
    }
    
    return text;
  };
  
  // If it's a TipTap doc structure
  if (content.type === "doc" && Array.isArray(content.content)) {
    return extractFromNode(content).trim();
  }
  
  // Handle pages structure (multi-page documents)
  if (content.pages && typeof content.pages === "object") {
    const pageTexts = [];
    for (const pageKey of Object.keys(content.pages).sort()) {
      const pageContent = content.pages[pageKey];
      const pageText = extractTextFromTipTap(pageContent);
      if (pageText) {
        pageTexts.push(pageText);
      }
    }
    return pageTexts.join("\n\n").trim();
  }
  
  // Fallback: try to stringify and extract any readable text
  try {
    const jsonStr = JSON.stringify(content);
    // Extract all text values from the JSON
    const textMatches = jsonStr.match(/"text"\s*:\s*"([^"]+)"/g) || [];
    const texts = textMatches.map(m => {
      const match = m.match(/"text"\s*:\s*"([^"]+)"/);
      return match ? match[1] : "";
    });
    if (texts.length > 0) {
      return texts.join(" ").trim();
    }
  } catch (e) {
    // Ignore JSON stringify errors
  }
  
  return "";
}

export default function QuizModal({ isOpen, onClose, documents = [], courseId }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState(null);
  const [error, setError] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [statusMessage, setStatusMessage] = useState("");

  const handleGenerateQuiz = async (doc) => {
    if (!doc.id || !doc.title) {
      setError("Invalid document selected");
      return;
    }

    setLoading(true);
    setLoadingDocId(doc.id);
    setError("");
    setStatusMessage("Fetching document...");

    try {
      // Fetch the document content
      const docResponse = await fetch(`/api/notes/${doc.id}`);
      if (!docResponse.ok) {
        throw new Error(`Failed to fetch document: ${docResponse.status}`);
      }

      let docData;
      try {
        docData = await docResponse.json();
      } catch (e) {
        throw new Error(`Invalid response from server`);
      }

      // Extract text content from the document
      let content = extractTextFromTipTap(docData.content);
      
      // Check if this is a PDF document that needs text extraction
      const isPDF = docData.noteType === "SCANNED" || 
                    docData.content?.type === "pdf" || 
                    (docData.uploads && docData.uploads.length > 0 && 
                     docData.uploads.some(u => u.fileType === "application/pdf"));
      
      // If no content and it's a PDF, try to extract text from PDF
      if (!content.trim() && isPDF) {
        setStatusMessage("Extracting text from PDF...");
        
        try {
          const extractResponse = await fetch(`/api/notes/${doc.id}/extract-text`);
          const extractData = await extractResponse.json();
          
          if (extractResponse.ok) {
            if (extractData.text && extractData.text.trim()) {
              content = extractData.text;
              console.log("Extracted PDF text length:", content.length);
              console.log("Sample:", content.substring(0, 200));
            } else {
              console.warn("PDF extraction returned empty text");
            }
          } else {
            console.warn("PDF text extraction failed:", extractResponse.status, extractData.error);
          }
        } catch (extractError) {
          console.error("Error extracting PDF text:", extractError);
        }
      }
      
      // If document has no extracted text content, check uploads for extractedText field
      if (!content.trim() && docData.uploads && docData.uploads.length > 0) {
        const upload = docData.uploads[0];
        if (upload && upload.extractedText) {
          content = upload.extractedText;
        }
      }
      
      // If still no content, try using the title and any available metadata
      if (!content.trim()) {
        // Check for text in various possible locations
        if (docData.topic) {
          content = `Topic: ${docData.topic}\n`;
        }
        if (docData.tags && docData.tags.length > 0) {
          content += `Tags: ${docData.tags.join(", ")}\n`;
        }
        
        // Last resort - provide helpful error
        if (!content.trim()) {
          if (isPDF) {
            throw new Error("Could not extract text from this PDF. The PDF may be scanned or image-based. Try a text-based PDF or document.");
          }
          throw new Error("This document has no text content. Please add some content to generate a quiz.");
        }
      }

      console.log("Extracted content for quiz:", content.substring(0, 200) + "...");
      setStatusMessage("Generating quiz questions...");

      // Generate quiz
      const quizResponse = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          documentId: doc.id,
          documentContent: content,
          documentTitle: doc.title,
          numQuestions: parseInt(numQuestions),
        }),
      });

      // Check status BEFORE reading the body
      if (!quizResponse.ok) {
        const errorText = await quizResponse.text();
        console.error("Quiz API error:", errorText);
        throw new Error(`Server error (${quizResponse.status}): Failed to generate quiz`);
      }

      let quizData;
      try {
        quizData = await quizResponse.json();
      } catch (e) {
        throw new Error(`Invalid quiz response: ${e.message}`);
      }

      if (!quizData || !quizData.quiz) {
        throw new Error("No quiz data returned from server");
      }

      // Validate that quiz has questions
      if (!quizData.quiz.questions || quizData.quiz.questions.length === 0) {
        throw new Error("Quiz generated but contains no questions. Try a document with more content.");
      }

      setQuiz({ ...quizData.quiz, documentId: doc.id });
      setSelectedDoc(doc);
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(err.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
      setLoadingDocId(null);
      setStatusMessage("");
    }
  };

  const handleBackToDocumentList = () => {
    setQuiz(null);
    setSelectedDoc(null);
    setError("");
    setStatusMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {quiz ? "Take Quiz" : "Generate Quiz"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {quiz ? (
            // Quiz Taking Interface
            <QuizTaker
              quiz={quiz}
              onBack={handleBackToDocumentList}
            />
          ) : (
            // Document Selection
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Settings */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">
                    {numQuestions}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Choose how many questions you want in the quiz (5-30)
                </p>
              </div>

              {/* Document List */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Select a Document to Generate Quiz
                </h3>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No documents available</p>
                    <p className="text-sm text-gray-500">
                      Upload a document or create a note to generate a quiz
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {documents.map((doc) => {
                      const isPDF = doc.noteType === "SCANNED" || doc.content?.type === "pdf";
                      const isLoadingThis = loadingDocId === doc.id;
                      
                      return (
                        <button
                          key={doc.id}
                          onClick={() => handleGenerateQuiz(doc)}
                          disabled={loading}
                          className={`text-left p-4 border rounded-lg transition ${
                            isLoadingThis 
                              ? "border-blue-400 bg-blue-50 shadow-md" 
                              : "border-gray-200 hover:border-blue-400 hover:shadow-md"
                          } disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <FileText className={`w-4 h-4 ${isPDF ? "text-red-500" : "text-blue-500"}`} />
                                <p className="font-medium text-gray-900">{doc.title || "Untitled"}</p>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {isPDF ? "📄 PDF Document" : "📝 Text Document"}
                              </p>
                              {doc.course && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Course: {doc.course.code}
                                </p>
                              )}
                              {doc.topic && (
                                <p className="text-xs text-gray-400">
                                  Topic: {doc.topic}
                                </p>
                              )}
                            </div>
                            {isLoadingThis && (
                              <div className="flex flex-col items-end gap-1 ml-2">
                                <div className="flex items-center gap-2">
                                  <Loader className="w-5 h-5 animate-spin text-blue-500" />
                                  <span className="text-sm text-blue-600 font-medium">
                                    {statusMessage || "Generating..."}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

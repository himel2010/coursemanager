import React, { useState } from "react";
import { X, BookOpen, Loader } from "lucide-react";
import QuizTaker from "./QuizTaker";

export default function QuizModal({ isOpen, onClose, documents = [], courseId }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);

  const handleGenerateQuiz = async (doc) => {
    if (!doc.id || !doc.title) {
      setError("Invalid document selected");
      return;
    }

    setLoading(true);
    setError("");

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

      let content = docData.content || "";

      // Convert content to string if it's an object
      if (typeof content === "object" && content !== null) {
        // If it's a PDF or has type field, extract text content
        if (content.type === "pdf" || content.text) {
          content = content.text || `Document: ${doc.title}\nNote: PDF content needs to be extracted`;
        } else {
          // Convert object to string
          content = JSON.stringify(content);
        }
      }

      // Ensure content is a string
      if (typeof content !== "string") {
        content = "";
      }

      // If it's a PDF with uploads, use a placeholder
      if ((doc.type === "pdf" || (docData.uploads && docData.uploads.length > 0)) && !content.trim()) {
        content = `Document: ${doc.title}\nNote: PDF content. Please ensure the document has extractable text for quiz generation.`;
      }

      if (!content || !content.trim()) {
        setError("Document has no content to generate quiz from");
        setLoading(false);
        return;
      }

      // Generate quiz using Qwen 3
      const quizResponse = await fetch("/api/quiz-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentContent: content,
          documentTitle: doc.title,
          numQuestions: parseInt(numQuestions),
        }),
      });

      // Check status BEFORE reading the body
      if (!quizResponse.ok) {
        throw new Error(`Server error (${quizResponse.status}): Failed to generate quiz`);
      }

      let quizData;
      try {
        // Now safely parse response as JSON
        quizData = await quizResponse.json();
      } catch (e) {
        throw new Error(`Invalid quiz response: ${e.message}`);
      }

      if (!quizData || !quizData.quiz) {
        throw new Error("No quiz data returned from server");
      }

      setQuiz(quizData.quiz);
      setSelectedDoc(doc);
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(err.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDocumentList = () => {
    setQuiz(null);
    setSelectedDoc(null);
    setError("");
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
                  Select a Document
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
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleGenerateQuiz(doc)}
                        disabled={loading}
                        className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition disabled:opacity-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{doc.title}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {doc.type === "pdf" ? "📄 PDF" : "📝 Text"}
                            </p>
                            {doc.course && (
                              <p className="text-xs text-gray-400 mt-1">
                                {doc.course.code}
                              </p>
                            )}
                          </div>
                          {loading && (
                            <div className="flex items-center gap-2">
                              <Loader className="w-4 h-4 animate-spin text-blue-500" />
                              <span className="text-xs text-blue-600">Generating...</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
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

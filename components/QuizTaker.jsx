import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Download, AlertCircle } from "lucide-react";

export default function QuizTaker({ quiz, onBack, onQuizComplete = null }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSavingResults, setIsSavingResults] = useState(false);

  // Safety check for quiz questions
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
        <p className="text-gray-600 mb-4">
          The quiz could not be generated. This may be because the document has insufficient content.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const currentEvaluation = evaluations[currentIndex];

  // Safety check for current question
  if (!currentQuestion || !currentQuestion.options) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Question</h2>
        <p className="text-gray-600 mb-4">
          This question appears to be invalid. Please try regenerating the quiz.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleSelectOption = (optionIndex) => {
    if (!showResults) {
      setAnswers({
        ...answers,
        [currentIndex]: optionIndex,
      });
    }
  };

  const handleEvaluateAnswer = async () => {
    if (currentAnswer === undefined) {
      alert("Please select an answer");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/quizzes/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          userAnswer: currentQuestion.options[currentAnswer],
          correctAnswer: currentQuestion.options[currentQuestion.correctOption],
          options: currentQuestion.options,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.evaluation) {
          setEvaluations({
            ...evaluations,
            [currentIndex]: data.evaluation,
          });
        } else {
          // Fallback to local evaluation
          const localEval = localEvaluate(currentIndex);
          setEvaluations({ ...evaluations, [currentIndex]: localEval });
        }
      } else {
        const localEval = localEvaluate(currentIndex);
        setEvaluations({ ...evaluations, [currentIndex]: localEval });
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
      // Fallback to local evaluation on any failure
      const localEval = localEvaluate(currentIndex);
      setEvaluations({ ...evaluations, [currentIndex]: localEval });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = () => {
    // Check which questions are unanswered
    const unanswered = quiz.questions
      .map((_, idx) => (answers[idx] === undefined ? idx + 1 : null))
      .filter(Boolean);

    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered.length} unanswered questions. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    setShowResults(true);
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all answers?")) {
      setAnswers({});
      setEvaluations({});
      setShowResults(false);
      setCurrentIndex(0);
    }
  };

  // Save results when results are first shown
  useEffect(() => {
    if (showResults) {
      // Fill missing evaluations before saving
      const filled = { ...evaluations };
      quiz.questions.forEach((q, idx) => {
        if (!filled[idx]) {
          filled[idx] = localEvaluate(idx);
        }
      });
      if (Object.keys(filled).length !== Object.keys(evaluations).length) {
        setEvaluations(filled);
      }
      if (!isSavingResults) {
        handleSaveResults();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults]);

  function localEvaluate(idx) {
    const q = quiz.questions[idx];
    const userIdx = answers[idx];
    const isCorrect = userIdx !== undefined && userIdx === q.correctOption;
    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect
        ? "Correct."
        : `Incorrect. Correct answer: ${q.options[q.correctOption]}`,
    };
  }

  const calculateScore = () => {
    const evaluatedAnswers = Object.values(evaluations);
    if (evaluatedAnswers.length === 0) return 0;
    const totalScore = evaluatedAnswers.reduce((sum, evaluation) => sum + evaluation.score, 0);
    return Math.round(totalScore / evaluatedAnswers.length);
  };

  const handleSaveResults = async () => {
    setIsSavingResults(true);
    try {
      const correctAnswers = Object.values(evaluations).filter((e) => e.isCorrect).length;
      const response = await fetch("/api/quizzes/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: quiz.documentId,
          documentTitle: quiz.documentTitle,
          totalQuestions: quiz.questions.length,
          correctAnswers,
          score: calculateScore(),
          answers: Object.entries(answers).map(([idx, optionIdx]) => ({
            questionIndex: parseInt(idx),
            question: quiz.questions[idx].question,
            userAnswer: quiz.questions[idx].options[optionIdx],
            correctAnswer: quiz.questions[idx].options[quiz.questions[idx].correctOption],
            evaluation: evaluations[idx],
          })),
        }),
      });

      if (!response.ok) {
        console.error("Failed to save quiz results");
      }
      if (onQuizComplete) {
        onQuizComplete({
          score: calculateScore(),
          correctAnswers,
          totalQuestions: quiz.questions.length,
        });
      }
    } catch (error) {
      console.error("Error saving quiz results:", error);
    } finally {
      setIsSavingResults(false);
    }
  };

  const downloadResults = () => {
    const results = {
      title: quiz.title,
      score: calculateScore(),
      totalQuestions: quiz.questions.length,
      evaluatedQuestions: Object.keys(evaluations).length,
      timestamp: new Date().toLocaleString(),
      questions: quiz.questions.map((q, idx) => ({
        question: q.question,
        userAnswer: answers[idx] !== undefined ? q.options[answers[idx]] : "Not answered",
        correctAnswer: q.options[q.correctOption],
        evaluation: evaluations[idx],
      })),
    };

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quiz-results-${Date.now()}.json`;
    link.click();
  };

  if (showResults) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Quiz Results</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Your Score</p>
            <p className="text-3xl font-bold text-blue-600">{calculateScore()}%</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Evaluated</p>
            <p className="text-3xl font-bold text-green-600">
              {Object.keys(evaluations).length}/{quiz.questions.length}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Correct</p>
            <p className="text-3xl font-bold text-purple-600">
              {Object.values(evaluations).filter((e) => e.isCorrect).length}
            </p>
          </div>
        </div>

        {/* Open-ended Questions Section (read-only) */}
        {Array.isArray(quiz.sections?.questions) && quiz.sections.questions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Question Section</h3>
            <div className="space-y-3">
              {quiz.sections.questions.map((q, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Item {idx + 1}</p>
                  <p className="font-medium text-gray-900">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6 mb-8">
          {quiz.questions.map((question, idx) => {
            const evaluation = evaluations[idx];
            const userAnswer = answers[idx];

            return (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Question {idx + 1}</p>
                    <p className="font-semibold text-gray-900">{question.question}</p>
                  </div>
                  {evaluation && (
                    <div
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        evaluation.isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {evaluation.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Your answer:</p>
                  {userAnswer !== undefined ? (
                    <p className="text-gray-900 font-medium">{question.options[userAnswer]}</p>
                  ) : (
                    <p className="text-gray-400 italic">Not answered</p>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Correct answer:</p>
                  <p className="text-gray-900 font-medium">{question.options[question.correctOption]}</p>
                </div>

                {evaluation && (
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                    <p className="text-sm text-gray-700">{evaluation.feedback}</p>
                    {evaluation.score !== undefined && (
                      <p className="text-xs text-gray-500 mt-2">
                        Score: {evaluation.score}/100
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
          <button
            onClick={downloadResults}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4" />
            Download Results
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">
            Question {currentIndex + 1} of {quiz.questions.length}
          </h2>
          <span className="text-sm text-gray-500">
            {Object.keys(answers).length} answered
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Section (read-only, optional) */}
      {Array.isArray(quiz.sections?.questions) && quiz.sections.questions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Question Section</h3>
          <div className="space-y-2">
            {quiz.sections.questions.map((q, idx) => (
              <div key={idx} className="border rounded p-3">
                <p className="text-sm text-gray-500">Item {idx + 1}</p>
                <p className="text-gray-900 font-medium">{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MCQ Question */}
      <div className="mb-6">
        <p className="text-xl font-semibold text-gray-900 mb-4">{currentQuestion.question}</p>

        {/* Options */}
        <div className="space-y-2 mb-6">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`w-full p-4 text-left rounded-lg border-2 transition ${
                currentAnswer === idx
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${
                currentEvaluation
                  ? idx === currentQuestion.correctOption
                    ? "border-green-500 bg-green-50"
                    : idx === currentAnswer && !currentEvaluation.isCorrect
                      ? "border-red-500 bg-red-50"
                      : ""
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    currentAnswer === idx
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {currentAnswer === idx && <span className="text-white text-sm">✓</span>}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Evaluation Display */}
        {currentEvaluation && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              currentEvaluation.isCorrect
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`font-semibold mb-2 ${
                currentEvaluation.isCorrect ? "text-green-800" : "text-red-800"
              }`}
            >
              {currentEvaluation.isCorrect ? "✓ Correct!" : "✗ Incorrect"}
            </p>
            <p className="text-gray-700 mb-2">{currentEvaluation.feedback}</p>
            <p className="text-sm text-gray-600">
              Score: {currentEvaluation.score}/100
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-2">
          {!currentEvaluation && currentAnswer !== undefined && (
            <button
              onClick={handleEvaluateAnswer}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
            >
              {loading ? "Evaluating..." : "Check Answer"}
            </button>
          )}

          {currentIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}

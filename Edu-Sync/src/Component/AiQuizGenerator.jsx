import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  RefreshCw,
  History,
  AlertCircle,
  Loader2,
  BookOpen
} from "lucide-react";
import axios from "axios";
import apiClient from "../services/api"; // Added API client import

const AIQuizGenerator = () => {
  const AI_BASE_URL = "https://edusync-ai-latest.onrender.com";
  const [step, setStep] = useState("setup");

  // --- Material Hub State ---
  const [materials, setMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

  // --- Form State ---
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [error, setError] = useState("");

  // --- Quiz Data State ---
  const [quizData, setQuizData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  // --- History State ---
  const [quizHistory, setQuizHistory] = useState([]);

  // Load history from local storage and fetch materials on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("edusync_quiz_history");
    if (savedHistory) setQuizHistory(JSON.parse(savedHistory));

    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setIsLoadingMaterials(true);
    try {
      const response = await apiClient.get('/api/v1/materials/');
      // Filter for verified notes only, exactly like SharedResources
      const verifiedNotesOnly = response.data.filter(file => 
        file.is_verified === true && file.tags !== 'Notice' && file.tags !== 'Syllabus'
      );
      setMaterials(verifiedNotesOnly);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError("Failed to load study materials from the hub.");
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  // --- Timer Logic ---
  useEffect(() => {
    let timer;
    if (step === "active" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (step === "active" && timeLeft === 0) {
      handleFinishQuiz(); // Auto-submit when time is up
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setError("");

    if (!docTitle.trim() || !docUrl.trim()) {
      return setError("Please select a valid study material.");
    }
    let safeUrl = docUrl.trim();
    if (!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")) {
      safeUrl = "https://" + safeUrl;
    }

    setStep("loading");

    try {
      const response = await axios.post(`${AI_BASE_URL}/generate-quiz`, {
        urls: [safeUrl],
        num_questions: parseInt(numQuestions),
      });

      const rawQuizArray = Array.isArray(response.data)
        ? response.data
        : response.data?.quiz;

      if (rawQuizArray && Array.isArray(rawQuizArray)) {
        const normalizedQuiz = rawQuizArray.map((q) => {
          const getVal = (keyName) => {
            const foundKey = Object.keys(q).find(
              (k) => k.toLowerCase() === keyName.toLowerCase(),
            );
            return foundKey ? q[foundKey] : null;
          };

          return {
            question: getVal("question") || "Missing Question?",
            options: getVal("options") || [],
            answer: getVal("answer") || "",
            explanation: getVal("explanation") || "No explanation provided.",
          };
        });

        setQuizData(normalizedQuiz);
        setTimeLeft(normalizedQuiz.length * 60);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setStep("active");
      } else {
        throw new Error("Invalid response format from AI.");
      }
    } catch (err) {
      console.error("FastAPI Error Details:", err.response?.data?.detail);

      const errorDetail = err.response?.data?.detail;

      if (Array.isArray(errorDetail)) {
        setError(
          `Validation Error: ${errorDetail[0].msg} (${errorDetail[0].loc.join(".")})`,
        );
      } else if (typeof errorDetail === "string") {
        setError(errorDetail);
      } else {
        setError(
          "Failed to generate quiz. AI could not process the selected document.",
        );
      }

      setStep("setup");
    }
  };

  const handleSelectOption = (option) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: option,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    setStep("results");

    // Calculate final score
    let correctCount = 0;
    quizData.forEach((q, index) => {
      if (userAnswers[index] === q.answer) correctCount++;
    });

    // Save to history
    const newHistoryEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      title: docTitle,
      score: correctCount,
      total: quizData.length,
    };

    const updatedHistory = [newHistoryEntry, ...quizHistory];
    setQuizHistory(updatedHistory);
    localStorage.setItem(
      "edusync_quiz_history",
      JSON.stringify(updatedHistory),
    );
  };

  const resetQuiz = () => {
    setDocTitle("");
    setDocUrl("");
    setNumQuestions(5);
    setStep("setup");
  };

  const SetupView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Quiz Generator Form */}
      <div className="lg:col-span-2">
        <form
          onSubmit={handleGenerateQuiz}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                AI Study Quiz Generator
              </h2>
              <p className="text-sm text-slate-500">
                Select a document from your academic vault, and AI will test your knowledge.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center text-sm font-bold">
              <AlertCircle className="w-4 h-4 mr-2" /> {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Material Selection Dropdown */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                Select Study Material
              </label>
              
              {isLoadingMaterials ? (
                <div className="w-full h-12 border border-slate-200 rounded-xl px-4 flex items-center bg-slate-50 text-slate-500">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading materials...
                </div>
              ) : (
                <select
                  required
                  value={docUrl}
                  onChange={(e) => {
                    const selectedUrl = e.target.value;
                    setDocUrl(selectedUrl);
                    const selectedMat = materials.find(m => m.file_url === selectedUrl);
                    if (selectedMat) {
                      setDocTitle(selectedMat.title);
                    }
                  }}
                  className="w-full h-12 border border-slate-200 rounded-xl px-4 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 appearance-none cursor-pointer"
                >
                  <option value="" disabled>-- Choose a verified document --</option>
                  {materials.map(mat => (
                    <option key={mat.id} value={mat.file_url}>
                      {mat.title} (Sem {mat.semester} • {mat.tags})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Number of Questions (1-20)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="w-full h-12 border border-slate-200 rounded-xl px-4 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 max-w-[150px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!docUrl || isLoadingMaterials}
            className="mt-8 w-full h-12 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BrainCircuit className="w-5 h-5 mr-2" /> Generate Smart Quiz
          </button>
        </form>
      </div>

      {/* History Sidebar */}
      <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-6 shadow-xl text-white">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
          <History className="w-5 h-5 text-indigo-400" /> Past Quiz Scores
        </h3>
        <div className="space-y-4 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-700 pr-2">
          {quizHistory.length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center py-10">
              No quizzes taken yet. Generate your first one!
            </p>
          ) : (
            quizHistory.map((hist) => (
              <div
                key={hist.id}
                className="bg-slate-800 p-4 rounded-2xl border border-slate-700"
              >
                <p className="text-xs text-indigo-300 font-bold mb-1">
                  {hist.date}
                </p>
                <h4 className="font-bold text-slate-100 truncate mb-2">
                  {hist.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      hist.score / hist.total >= 0.7
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    Score: {hist.score} / {hist.total}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const ActiveQuizView = () => {
    const currentQ = quizData[currentQuestionIndex];
    const isAnswered = userAnswers[currentQuestionIndex] !== undefined;

    return (
      <div className="max-w-3xl mx-auto">
        {/* Header / Timer */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <FileText className="w-5 h-5 text-indigo-500" /> {docTitle}
          </div>
          <div
            className={`flex items-center gap-2 font-mono font-bold px-4 py-2 rounded-xl ${timeLeft < 60 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-100 text-slate-700"}`}
          >
            <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-6">
          <div className="text-sm font-bold text-indigo-600 mb-4 uppercase tracking-wider">
            Question {currentQuestionIndex + 1} of {quizData.length}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
            {currentQ.question}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${
                  userAnswers[currentQuestionIndex] === option
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 text-slate-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-end">
          <button
            disabled={!isAnswered}
            onClick={handleNextQuestion}
            className="flex items-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {currentQuestionIndex === quizData.length - 1
              ? "Submit Quiz"
              : "Next Question"}{" "}
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  const ResultsView = () => {
    let score = 0;
    quizData.forEach((q, i) => {
      if (userAnswers[i] === q.answer) score++;
    });
    const percentage = Math.round((score / quizData.length) * 100);

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
        {/* Score Header */}
        <div
          className={`p-8 rounded-3xl shadow-lg text-center text-white ${percentage >= 70 ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-rose-500 to-orange-500"}`}
        >
          <h2 className="text-3xl font-bold mb-2">
            {percentage >= 70 ? "Great Job!" : "Keep Studying!"}
          </h2>
          <p className="text-white/80 font-medium mb-6">{docTitle}</p>
          <div className="text-6xl font-black mb-4">
            {score}{" "}
            <span className="text-3xl opacity-75">/ {quizData.length}</span>
          </div>
          <p className="font-bold uppercase tracking-widest text-sm opacity-90">
            {percentage}% Accuracy
          </p>
        </div>

        {/* Detailed Review */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            Detailed Review
            <button
              onClick={resetQuiz}
              className="text-sm px-4 py-2 bg-slate-100 text-slate-700 rounded-lg flex items-center hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Generate Another
            </button>
          </h3>

          <div className="space-y-8">
            {quizData.map((q, i) => {
              const isCorrect = userAnswers[i] === q.answer;
              return (
                <div
                  key={i}
                  className={`p-6 rounded-2xl border-2 ${isCorrect ? "border-emerald-100 bg-emerald-50/30" : "border-rose-100 bg-rose-50/30"}`}
                >
                  <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 mb-3">
                        {i + 1}. {q.question}
                      </p>

                      <div className="text-sm font-medium mb-4 space-y-1">
                        <p className="text-slate-500">
                          Your Answer:{" "}
                          <span
                            className={
                              isCorrect
                                ? "text-emerald-600"
                                : "text-rose-600 line-through"
                            }
                          >
                            {userAnswers[i] || "Skipped"}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-emerald-600">
                            Correct Answer: {q.answer}
                          </p>
                        )}
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed shadow-sm">
                        <span className="font-bold text-indigo-600">
                          AI Explanation:
                        </span>{" "}
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      {step === "setup" && SetupView()}
      {step === "loading" && (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-800">
            AI is reading your document...
          </h3>
          <p className="text-slate-500 mt-2">
            Generating smart questions based on the content.
          </p>
        </div>
      )}
      {step === "active" && ActiveQuizView()}
      {step === "results" && ResultsView()}
    </div>
  );
};

export default AIQuizGenerator;
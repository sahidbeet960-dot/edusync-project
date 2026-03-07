import React, { useState, useEffect } from "react";
import {
  BookOpen,
  BarChart2,
  FileText,
  AlertCircle,
  Loader2,
  TrendingUp,
  Target
} from "lucide-react";
import axios from "axios";
import apiClient from "../services/api";

const PYQAnalyzer = () => {
  const AI_BASE_URL = "https://edusync-ai-latest.onrender.com"; // Your AI backend URL

  // --- State Variables ---
  const [pyqs, setPyqs] = useState([]);
  const [isLoadingPyqs, setIsLoadingPyqs] = useState(true);
  
  const [selectedPyqId, setSelectedPyqId] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  // Fetch PYQs from your PYQ table on mount
  useEffect(() => {
    fetchPYQs();
  }, []);

  const fetchPYQs = async () => {
    setIsLoadingPyqs(true);
    setError("");
    try {
      // Assumes you have an endpoint for your PYQ table. 
      // If PYQs are part of materials, you could use: apiClient.get('/api/v1/materials/') and filter by tag.
      const response = await apiClient.get('/api/v1/pyqs/');
      setPyqs(response.data);
    } catch (err) {
      console.error("Error fetching PYQs:", err);
      setError("Failed to load Previous Year Questions from the database.");
    } finally {
      setIsLoadingPyqs(false);
    }
  };

  const handleSelectPyq = (e) => {
    const pyqId = e.target.value;
    setSelectedPyqId(pyqId);
    
    // Find the selected PYQ from the array to grab its title and URL
    const selected = pyqs.find(p => p.id.toString() === pyqId);
    if (selected) {
      setDocTitle(selected.title || selected.subject);
      setDocUrl(selected.file_url);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");
    setAnalysisResult(null);

    if (!docUrl) {
      return setError("Please select a valid PYQ to analyze.");
    }

    // Ensure URL is safely formatted
    let safeUrl = docUrl.trim();
    if (!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")) {
      safeUrl = "https://" + safeUrl;
    }

    setIsAnalyzing(true);

    try {
      // Send the selected PYQ URL to the AI Analyzer Endpoint
      // Make sure the endpoint path matches your FastAPI backend!
      const response = await axios.post(`${AI_BASE_URL}/analyze-topics`, {
        urls: [safeUrl]
      });

      // Assuming the AI returns an object or array of important topics
      setAnalysisResult(response.data);
      
    } catch (err) {
      console.error("Analysis Error:", err);
      setError("Failed to generate topic importance. AI could not process the selected PYQ.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Area */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
              <BarChart2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">PYQ Topic Analyzer</h1>
              <p className="text-slate-500 mt-1">
                Select a Previous Year Question paper to reveal the most frequently asked topics and their weightage.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center text-sm font-bold">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                Select Subject / PYQ Paper
              </label>
              
              {isLoadingPyqs ? (
                <div className="w-full h-14 border border-slate-200 rounded-xl px-4 flex items-center bg-slate-50 text-slate-500 font-medium">
                  <Loader2 className="w-5 h-5 mr-3 animate-spin text-indigo-500" /> Loading uploaded PYQs...
                </div>
              ) : pyqs.length === 0 ? (
                <div className="w-full h-14 border border-rose-200 rounded-xl px-4 flex items-center bg-rose-50 text-rose-600 font-medium text-sm">
                  No PYQs found in the database. Please upload some first.
                </div>
              ) : (
                <select
                  required
                  value={selectedPyqId}
                  onChange={handleSelectPyq}
                  className="w-full h-14 border border-slate-200 rounded-xl px-4 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 appearance-none cursor-pointer font-medium text-slate-700"
                >
                  <option value="" disabled>-- Choose a PYQ to Analyze --</option>
                  {pyqs.map(pyq => (
                    <option key={pyq.id} value={pyq.id}>
                      {pyq.title || pyq.subject} (Sem {pyq.semester})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              disabled={!selectedPyqId || isAnalyzing || isLoadingPyqs}
              className="w-full h-14 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Document...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" /> Extract Topic Importance
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Area */}
        {analysisResult && (
          <div className="animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <Target className="w-6 h-6 mr-2 text-emerald-500" /> 
                    Analysis Report
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">{docTitle}</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              {/* Display Logic Based on AI Output */}
              {/* Assuming the backend returns an array of topics with importance/weightage */}
              <div className="space-y-4">
                {Array.isArray(analysisResult) ? (
                  analysisResult.map((topic, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-colors">
                      <div className="mb-3 sm:mb-0">
                        <h4 className="font-bold text-slate-800 text-lg">
                          {topic.topic_name || topic.title}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {topic.description || "Repeated frequently across previous years."}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                          {topic.frequency ? `${topic.frequency} Appearances` : "High Importance"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback if AI returns plain markdown or text
                  <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult, null, 2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PYQAnalyzer;
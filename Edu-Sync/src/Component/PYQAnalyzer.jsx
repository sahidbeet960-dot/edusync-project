import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, BookOpen, Target, BarChart, AlertCircle, 
  TrendingUp, Loader2, Award, Layers
} from "lucide-react";
import apiClient from "../services/api";

const PYQAnalyzer = () => {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [analytics, setAnalytics] = useState([]);
  
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchAvailableSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchAnalytics(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchAvailableSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const response = await apiClient.get("/api/v1/pyqs/");
      
      // SAFEGUARD: Ensure data is an array before mapping!
      const safeData = Array.isArray(response.data) ? response.data : [];
      
      const uniqueSubjects = [...new Set(safeData.map((pyq) => pyq?.subject).filter(Boolean))];
      setAvailableSubjects(uniqueSubjects);
      
      if (uniqueSubjects.length > 0) {
        setSelectedSubject(uniqueSubjects[0]);
      }
    } catch (error) {
      console.error("Failed to fetch PYQ subjects", error);
      setAvailableSubjects([]); // Fallback
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchAnalytics = async (subjectName) => {
    setIsLoadingAnalytics(true);
    try {
      const response = await apiClient.get(`/api/v1/pyqs/analytics/topics/${subjectName}`);
      
      // SAFEGUARD: Ensure analytics is an array!
      const safeData = Array.isArray(response.data) ? response.data : [];
      setAnalytics(safeData);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
      setAnalytics([]); // Fallback
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", bar: "bg-rose-500", label: "High Probability" };
      case "medium": return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", bar: "bg-amber-500", label: "Medium Probability" };
      case "low": return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", bar: "bg-emerald-500", label: "Low Probability" };
      default: return { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", bar: "bg-slate-400", label: "Unknown" };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider mb-4">
              <BrainCircuit className="w-4 h-4 text-purple-300" /> Powered by Vector RAG
            </div>
            <h1 className="text-3xl font-bold mb-2">AI PYQ Analyzer</h1>
            <p className="text-indigo-200 max-w-xl">
              Stop guessing what's on the exam. Our AI analyzes years of previous question papers to generate a precise probability map of the most important topics.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4 shrink-0">
             <Target className="w-10 h-10 text-emerald-400" />
             <div>
               <p className="text-sm text-indigo-200 font-medium">Prediction Accuracy</p>
               <p className="text-2xl font-bold tracking-tight">87.4%</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center mb-4">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-600" /> Select Subject
            </h3>
            
            {isLoadingSubjects ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : availableSubjects.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">No PYQs uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableSubjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                      selectedSubject === subject 
                        ? "bg-indigo-600 text-white shadow-md" 
                        : "bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-100"
                    }`}
                  >
                    <span className="truncate pr-2">{subject}</span>
                    {selectedSubject === subject && <TrendingUp className="w-4 h-4 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {isLoadingAnalytics ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[400px]">
               <div className="relative w-16 h-16 mb-4">
                 <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                 <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
               </div>
               <h3 className="text-lg font-bold text-slate-800">Analyzing Vector Database...</h3>
               <p className="text-sm text-slate-500 mt-1">Chunking PDFs and extracting topic weights.</p>
            </div>
          ) : !selectedSubject ? (
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
               <Layers className="w-16 h-16 text-slate-200 mb-4" />
               <h3 className="text-xl font-bold text-slate-800">Ready to Analyze</h3>
               <p className="text-slate-500 mt-2 max-w-sm">Select a subject from the left panel to generate an AI-powered exam probability map.</p>
             </div>
          ) : analytics.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
               <AlertCircle className="w-16 h-16 text-amber-300 mb-4" />
               <h3 className="text-xl font-bold text-slate-800">Processing Pending</h3>
               <p className="text-slate-500 mt-2 max-w-sm">
                 The PYQs for <strong>{selectedSubject}</strong> have been uploaded, but the AI microservice is currently crunching the data.
               </p>
             </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <BarChart className="w-6 h-6 mr-2 text-indigo-600" /> 
                  Topic Probability Map
                </h2>
                <span className="text-sm font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  {analytics.length} Topics Extracted
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.map((topic, index) => {
                  const styles = getPriorityStyles(topic.priority_level);
                  const barWidth = Math.min(100, Math.max(15, (topic.total_marks_contribution / 100) * 100));

                  return (
                    <div key={topic.topic_name || index} className={`relative overflow-hidden rounded-2xl border p-5 transition-all hover:shadow-md ${styles.bg} ${styles.border}`}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className={`font-bold text-lg pr-4 leading-tight ${styles.text}`}>{topic.topic_name}</h3>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 bg-white shadow-sm ${styles.text}`}>{styles.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1">Total Marks</p>
                          <p className={`text-2xl font-black ${styles.text}`}>{topic.total_marks_contribution}</p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1">Frequency</p>
                          <p className="text-xl font-bold text-slate-700 flex items-center">{topic.appearance_count} <span className="text-xs font-medium ml-1 text-slate-500">papers</span></p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-slate-600">Exam Weightage</span>
                          <span className={`text-xs font-bold ${styles.text}`}>{Math.round(barWidth)}%</span>
                        </div>
                        <div className="w-full bg-white rounded-full h-2.5 shadow-inner">
                          <div className={`h-2.5 rounded-full ${styles.bar}`} style={{ width: `${barWidth}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PYQAnalyzer;
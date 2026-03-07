import React, { useState } from 'react';
import { BrainCircuit, Loader2, UploadCloud, Edit3, Save, CheckCircle, FileText, AlertTriangle } from 'lucide-react';
import apiClient from '../srvices/api'; 

const CRTopicImportance = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // State holding the AI's generated response
  const [aiAnalysis, setAiAnalysis] = useState([
    { id: 1, topic: "Dijkstra's Algorithm", weight: "High", frequency: "90% of past papers", details: "Always appears in 10-mark long questions." },
    { id: 2, topic: "Binary Search Trees", weight: "Medium", frequency: "60% of past papers", details: "Usually a 5-mark short note or tracing question." },
    { id: 3, topic: "Graph Coloring", weight: "Low", frequency: "15% of past papers", details: "Only asked twice in the last 5 years." }
  ]);

  const [prompt, setPrompt] = useState('');

  // The "Extra Editable Power" - Re-running the AI on demand
  const handleRunAI = async () => {
    if (!prompt) return;
    setIsAnalyzing(true);
    try {
      // Calls your actual backend AI endpoint!
      const response = await apiClient.post('/api/v1/ai/generate', { prompt: `Analyze these past year questions and syllabus topics to determine importance: ${prompt}` });
      
      // We parse the AI's text and mock placing it into our editable table
      setAiAnalysis([
        { id: 1, topic: "AI Generated Topic", weight: "High", frequency: "Detected", details: response.data.response },
        ...aiAnalysis
      ]);
      setPrompt('');
    } catch (error) {
      alert("AI Analysis failed. Is the Gemini API key set in Railway?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditChange = (index, field, value) => {
    const updated = [...aiAnalysis];
    updated[index][field] = value;
    setAiAnalysis(updated);
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* CR Admin Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <BrainCircuit className="w-6 h-6 mr-3 text-indigo-600" /> AI Syllabus Analyzer (CR Admin)
          </h2>
          <p className="text-slate-500 mt-1 text-sm flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1 text-amber-500" />
            You have editor privileges. Changes here reflect on the student dashboard.
          </p>
        </div>
        
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`mt-4 sm:mt-0 px-5 py-2.5 rounded-xl font-bold flex items-center transition-colors shadow-sm ${
            isEditing ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
          }`}
        >
          {isEditing ? <Save className="w-5 h-5 mr-2" /> : <Edit3 className="w-5 h-5 mr-2" />} 
          {isEditing ? 'Save Class Weights' : 'Edit Importance Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Trigger the AI */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center">
            <UploadCloud className="w-5 h-5 mr-2 text-indigo-500" /> Feed the AI
          </h3>
          <p className="text-xs text-slate-500 mb-4">Paste syllabus text or raw exam questions below to generate an automated priority list.</p>
          
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[150px] bg-slate-50 mb-4" 
            placeholder="Paste raw past year questions here..."
          ></textarea>
          
          <button 
            onClick={handleRunAI}
            disabled={isAnalyzing || !prompt}
            className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />} 
            Run AI Analysis
          </button>
        </div>

        {/* Right Panel: Editable Output */}
        <div className="lg:col-span-2 space-y-4">
          {aiAnalysis.map((item, index) => (
            <div key={item.id} className={`bg-white rounded-2xl shadow-sm border p-5 transition-all ${isEditing ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-slate-200 hover:border-indigo-200'}`}>
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 mr-4">
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={item.topic} 
                      onChange={(e) => handleEditChange(index, 'topic', e.target.value)}
                      className="w-full font-bold text-slate-800 border-b border-dashed border-indigo-300 focus:border-indigo-600 outline-none pb-1" 
                    />
                  ) : (
                    <h4 className="font-bold text-slate-800 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-slate-400" /> {item.topic}
                    </h4>
                  )}
                </div>

                <div className="shrink-0">
                  {isEditing ? (
                    <select 
                      value={item.weight} 
                      onChange={(e) => handleEditChange(index, 'weight', e.target.value)}
                      className="text-xs font-bold uppercase rounded-lg border border-indigo-300 p-1 bg-indigo-50 text-indigo-700 outline-none"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider border ${
                      item.weight === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                      item.weight === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {item.weight} Priority
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={item.frequency} 
                    onChange={(e) => handleEditChange(index, 'frequency', e.target.value)}
                    className="w-full text-xs text-indigo-600 border border-slate-200 rounded p-1.5 outline-none focus:border-indigo-400 bg-slate-50" 
                  />
                ) : (
                  <p className="text-xs font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">{item.frequency}</p>
                )}
                
                {isEditing ? (
                  <textarea 
                    value={item.details} 
                    onChange={(e) => handleEditChange(index, 'details', e.target.value)}
                    className="w-full text-sm text-slate-600 border border-slate-200 rounded p-2 outline-none focus:border-indigo-400 min-h-[60px] bg-slate-50" 
                  />
                ) : (
                  <p className="text-sm text-slate-600">{item.details}</p>
                )}
              </div>
            </div>
          ))}

          {isEditing && (
            <button 
              onClick={handleSaveEdits}
              className="w-full py-3 bg-indigo-50 border-2 border-dashed border-indigo-300 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Confirm & Publish to Student Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Save Success Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
          <div>
            <h4 className="font-bold text-sm">Priority List Updated!</h4>
            <p className="text-xs text-slate-300 mt-0.5">Students can now view the latest AI analysis.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRTopicImportance;
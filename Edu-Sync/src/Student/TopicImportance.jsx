import React, { useState } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, BarChart3, BrainCircuit } from 'lucide-react';

const TopicImportance = () => {
  const [activeSubject, setActiveSubject] = useState('Data Structures');

  const subjects = ['Data Structures', 'Digital Logic', 'Operating Systems'];

  const topicsData = {
    'Data Structures': [
      { id: 1, name: 'Trees & Graphs (BST, AVL, Dijkstra)', importance: 'High', frequency: '85%', notes: 'Guaranteed 15-mark question every year.' },
      { id: 2, name: 'Dynamic Programming', importance: 'High', frequency: '70%', notes: 'Usually asked in algorithmic problem solving.' },
      { id: 3, name: 'Sorting Algorithms (Quick, Merge)', importance: 'Medium', frequency: '50%', notes: 'Focus on time complexity analysis.' },
      { id: 4, name: 'Linked Lists & Arrays', importance: 'Low', frequency: '20%', notes: 'Basic concepts, mostly 2-mark questions.' }
    ],
    'Digital Logic': [
      { id: 5, name: 'Combinational Circuits (Mux, Decoders)', importance: 'High', frequency: '90%', notes: 'Core topic. Design problems are highly likely.' },
      { id: 6, name: 'Sequential Logic (Flip-Flops, Counters)', importance: 'High', frequency: '80%', notes: 'State diagram questions appear frequently.' }
    ]
  };

  const currentTopics = topicsData[activeSubject] || [];

  const getImportanceBadge = (importance) => {
    switch(importance) {
      case 'High': return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> High Priority</span>;
      case 'Medium': return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> Medium Priority</span>;
      case 'Low': return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Low Priority</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Target className="w-6 h-6 mr-3 text-indigo-600" /> Syllabus Topic Importance
          </h2>
          <p className="text-slate-500 mt-1 flex items-center">
            <BrainCircuit className="w-4 h-4 mr-1 text-purple-500" />
            AI-generated insights based on 10 years of past exam papers.
          </p>
        </div>
        
        {/* Subject Selector */}
        <div className="mt-4 md:mt-0 flex space-x-2 bg-slate-100 p-1 rounded-xl">
          {subjects.map(sub => (
            <button 
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeSubject === sub ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-sm text-white">
          <h3 className="text-indigo-100 font-medium text-sm mb-1">Most Important Topic</h3>
          <p className="text-xl font-bold truncate">{currentTopics.find(t => t.importance === 'High')?.name || 'N/A'}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">Total Topics Analyzed</h3>
            <p className="text-2xl font-bold text-slate-800">{currentTopics.length}</p>
          </div>
          <BarChart3 className="w-8 h-8 text-indigo-100" />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">High Priority Topics</h3>
            <p className="text-2xl font-bold text-red-600">{currentTopics.filter(t => t.importance === 'High').length}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-50" />
        </div>
      </div>

      {/* Topics List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800">Topic Breakdown: {activeSubject}</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {currentTopics.map(topic => (
            <div key={topic.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1 mb-4 md:mb-0 pr-4">
                <h4 className="text-lg font-bold text-slate-800 mb-1">{topic.name}</h4>
                <p className="text-sm text-slate-600">{topic.notes}</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Appearance Probability</p>
                  <p className="text-lg font-bold text-indigo-600">{topic.frequency}</p>
                </div>
                <div className="w-32 flex justify-end">
                  {getImportanceBadge(topic.importance)}
                </div>
              </div>
            </div>
          ))}
          {currentTopics.length === 0 && (
            <div className="p-12 text-center text-slate-500">No data available for this subject yet.</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default TopicImportance;
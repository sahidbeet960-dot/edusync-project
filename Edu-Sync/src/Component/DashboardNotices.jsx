import React, { useState, useEffect } from 'react';
import { Megaphone, BookOpen, ExternalLink, Loader2, Clock } from 'lucide-react';
import apiClient from '../services/api';

const DashboardNotices = () => {
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await apiClient.get('/api/v1/materials/');
        
        // 1. Filter: Only get VERIFIED files that are marked as Notice or Syllabus
        const officialUpdates = response.data.filter(file => 
          file.is_verified === true && 
          (file.tags === 'Notice' || file.tags === 'Syllabus')
        );

        // 2. Sort: Newest first based on created_at date
        const sortedUpdates = officialUpdates.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );

        // 3. Keep only the 5 most recent ones for the dashboard widget
        setUpdates(sortedUpdates.slice(0, 5));
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Official Updates</h3>
        <p className="text-sm text-slate-500">No new notices or syllabus updates at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
        <h3 className="font-bold text-blue-900 flex items-center">
          <Megaphone className="w-5 h-5 mr-2 text-blue-600" />
          Official Updates & Notices
        </h3>
        <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
          {updates.length} New
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {updates.map((update) => (
          <div key={update.id} className="p-5 hover:bg-slate-50 transition-colors flex items-start">
            
            <div className={`p-2 rounded-lg shrink-0 mr-4 mt-1 ${update.tags === 'Notice' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {update.tags === 'Notice' ? <Megaphone className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-800 text-sm">{update.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 flex items-center shrink-0 ml-2">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(update.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              {update.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{update.description}</p>
              )}
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  Sem {update.semester} • {update.tags}
                </span>
                
                <a 
                  href={update.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                >
                  View Document <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardNotices;
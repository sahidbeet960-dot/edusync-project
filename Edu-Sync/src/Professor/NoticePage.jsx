import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';

const NoticePage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleBroadcast = (e) => {
    e.preventDefault();
    alert(`Notice Broadcasted: ${title}`);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <AlertCircle className="w-6 h-6 mr-3 text-blue-600" /> Broadcast Official Notice
      </h2>
      
      <form onSubmit={handleBroadcast} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Notice Title</label>
          <input 
            type="text" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Change in Exam Schedule"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Message Content</label>
          <textarea 
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px] resize-y"
            placeholder="Type your official announcement here..."
          ></textarea>
        </div>

        <button type="submit" className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto">
          <Send className="w-5 h-5 mr-2" /> Broadcast to Students
        </button>
      </form>
    </div>
  );
};

export default NoticePage;
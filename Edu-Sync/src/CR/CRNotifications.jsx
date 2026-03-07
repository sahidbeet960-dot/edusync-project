import React, { useState } from 'react';
import { Search, Bell, AlertCircle, Calendar } from 'lucide-react';

const CRNotifications = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [notifications] = useState([
    { id: 1, title: 'Professor Notice', message: 'Dr. Smith updated the Syllabus.', time: '2 mins ago', type: 'alert' },
    { id: 2, title: 'Schedule Update', message: 'Your proposed schedule was published.', time: '1 hour ago', type: 'system' },
  ]);

  // --- ACTIVE SEARCH LOGIC ---
  const filteredNotifs = notifications.filter(notif => 
    notif.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    notif.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center"><Bell className="w-6 h-6 mr-3 text-teal-600" /> Notifications</h2>
        
        {/* --- ACTIVE SEARCH BAR --- */}
        <div className="relative w-64">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
        {filteredNotifs.length === 0 ? (
          <p className="text-center py-6 text-slate-500">No notifications found.</p>
        ) : (
          filteredNotifs.map(notif => (
            <div key={notif.id} className="p-4 border-b border-slate-100 flex items-start hover:bg-slate-50">
              <div className="bg-teal-100 text-teal-600 p-2 rounded-full mr-4"><AlertCircle className="w-5 h-5" /></div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">{notif.title}</h4>
                <p className="text-sm text-slate-600">{notif.message}</p>
                <span className="text-xs text-slate-400 mt-1 block">{notif.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CRNotifications;
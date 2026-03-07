import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, FileText, MessageCircleQuestion, CalendarDays, Loader2 } from 'lucide-react';
import apiClient from '../services/api'; // Ensure this points to your Axios config

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // NEW: State to hold the dynamic user data
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // NEW: Fetch the real logged-in user's data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/v1/users/me');
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // If unauthorized, kick them back to login
        if (error.response?.status === 401) {
           localStorage.removeItem('edusync_token');
           navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Mock Database for Search
  const searchableItems = [
    { id: 1, title: 'View Timetable', type: 'Tool', icon: <CalendarDays className="w-4 h-4" />, link: '/dashboard/student/schedule' },
    { id: 2, title: 'CS-301 Syllabus.pdf', type: 'Resource', icon: <FileText className="w-4 h-4" />, link: '/dashboard/student/resources' },
    { id: 3, title: 'Dijkstra Algorithm Doubt', type: 'Forum', icon: <MessageCircleQuestion className="w-4 h-4" />, link: '/dashboard/student/discussions' },
  ];

  const searchResults = searchableItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResultClick = (link) => {
    navigate(link);
    setSearchQuery(''); 
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-20 relative">
      <h2 className="text-xl font-semibold text-slate-800">Student Space</h2>
      
      <div className="flex items-center space-x-4">
        
        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-64">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classes, forums..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 transition-all"
          />

          {/* Search Dropdown */}
          {searchQuery && (
            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              {searchResults.length > 0 ? (
                searchResults.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleResultClick(item.link)}
                    className="flex items-center p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                  >
                    <div className="text-indigo-600 mr-3">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{item.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-slate-500 text-center">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button 
          onClick={() => navigate('/dashboard/student/notifications')}
          className="text-slate-500 hover:text-indigo-600 relative p-2 rounded-full hover:bg-indigo-50 transition-colors"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Section (DYNAMIC) */}
        <div 
          onClick={() => navigate('/dashboard/student/profile')}
          className="flex items-center pl-4 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors ml-2"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
               <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
               <div className="hidden sm:block space-y-1">
                 <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
                 <div className="h-2 w-10 bg-slate-200 rounded animate-pulse"></div>
               </div>
            </div>
          ) : (
            <>
              {/* Dynamic Initials Avatar instead of hardcoded Unsplash image */}
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mr-2 border border-indigo-200 shadow-sm">
                {(userProfile?.full_name || 'U')[0].toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <span className="block font-bold text-sm text-slate-800 leading-tight">
                  {userProfile?.full_name || 'Student'}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium uppercase tracking-wider truncate max-w-[120px]">
                  {userProfile?.department || 'Student Dept'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
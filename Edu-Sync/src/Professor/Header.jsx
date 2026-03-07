import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, FileText, MessageCircleQuestion } from 'lucide-react';
import apiClient from '../services/api'; // Make sure to import your API client!

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // NEW: State to hold the fetched user profile
  const [userProfile, setUserProfile] = useState(null);
  
  const profilePicUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

  // NEW: Fetch the profile data when the Header loads
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Since we set up the interceptor in api.js, the token is automatically sent!
        const response = await apiClient.get('/api/v1/users/me/profile');
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Optional: If unauthorized (401), you might want to log the user out
        if (error.response?.status === 401) {
           localStorage.removeItem('edusync_token');
           navigate('/login');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const searchableItems = [
    { id: 1, title: 'CS-301 Syllabus.pdf', type: 'Resource', icon: <FileText className="w-4 h-4" />, link: '/dashboard/professor/resources' },
    { id: 2, title: 'Lecture_Notes_Unit1.zip', type: 'Resource', icon: <FileText className="w-4 h-4" />, link: '/dashboard/professor/resources' },
    { id: 3, title: 'Dijkstra Algorithm Doubt', type: 'Forum', icon: <MessageCircleQuestion className="w-4 h-4" />, link: '/dashboard/professor/discussions' },
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
      {/* Dynamic Title based on fetched role */}
      <h2 className="text-xl font-semibold text-slate-800">
        {userProfile ? `${userProfile.role.charAt(0) + userProfile.role.slice(1).toLowerCase()} Dashboard` : 'Dashboard'}
      </h2>
      
      <div className="flex items-center space-x-4">
        
        <div className="relative hidden sm:block w-64">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources, forums..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all"
          />

          {searchQuery && (
            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              {searchResults.length > 0 ? (
                searchResults.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleResultClick(item.link)}
                    className="flex items-center p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                  >
                    <div className="text-blue-600 mr-3">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{item.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-slate-500 text-center">No results found for "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate('/dashboard/professor/notifications')}
          className="text-slate-500 hover:text-slate-700 relative p-2 rounded-full hover:bg-slate-100 transition-all"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div 
          onClick={() => navigate('/dashboard/professor/profile')}
          className="flex items-center pl-4 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
        >
          <img src={profilePicUrl} alt="User Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm mr-2" />
          <div className="hidden sm:block">
            {/* NEW: Render the real fetched name and role! */}
            <span className="block font-medium text-sm text-slate-700 leading-tight">
              {userProfile ? userProfile.full_name : 'Loading...'}
            </span>
            <span className="block text-xs text-slate-500">
              {userProfile ? userProfile.role : '...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
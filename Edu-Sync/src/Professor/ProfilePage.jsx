import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, School, Hash, Edit3, Save, X, BookOpen, MessageCircleQuestion, Loader2 } from 'lucide-react';
import apiClient from '../services/api';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State to hold the profile data
  const [profileData, setProfileData] = useState({
    full_name: 'Loading...',
    role: 'Loading...',
    email: 'Loading...',
    phone: '+91 Not Set', // Fallback if not in DB yet
    location: 'Not Set',
    department: 'Computer Science & Engineering',
    employeeId: 'EMP-TBD',
    subjects: 'Not Set',
    stats: {
      studyMinutes: 0,
      questionsAsked: 0
    }
  });

  // Fetch real data from the backend when the page loads
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/v1/users/me/profile');
        const data = response.data;
        
        // Merge the backend data with our local state
        setProfileData(prevData => ({
          ...prevData,
          full_name: data.full_name || prevData.full_name,
          role: data.role || prevData.role,
          email: data.email || prevData.email,
          // Map backend stats to our state
          stats: {
            studyMinutes: data.total_study_minutes || 0,
            questionsAsked: data.total_questions_asked || 0
          }
        }));
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = () => {
    // TODO: Connect to a PUT /api/v1/users/me endpoint later to save changes!
    setIsEditing(false);
    alert('Profile updated locally!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-blue-600" /> Loading Profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Cover and Profile Picture */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 mb-6">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white mb-4 sm:mb-0"
            />
            
            <div className="flex w-full sm:w-auto mt-2 sm:mt-0">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center text-sm border border-slate-200"
                >
                  <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2 w-full sm:w-auto">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-2 bg-white text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center text-sm border border-slate-200 flex-1 sm:flex-none">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm shadow-sm flex-1 sm:flex-none">
                    <Save className="w-4 h-4 mr-2" /> Save
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              {profileData.full_name} 
              <span className="ml-3 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full uppercase tracking-wider font-bold">
                {profileData.role}
              </span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">{profileData.department}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Contact Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Contact Details</h3>
          <div className="space-y-4">
            <div className="flex items-center text-slate-600">
              <Mail className="w-5 h-5 mr-3 text-blue-500 shrink-0" /> 
              {/* Email should generally be read-only since it's the login credential */}
              <span className="truncate">{profileData.email}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <Phone className="w-5 h-5 mr-3 text-blue-500 shrink-0" /> 
              {!isEditing ? profileData.phone : <input type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="flex-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 px-1 py-0.5 text-sm" />}
            </div>
            <div className="flex items-center text-slate-600">
              <MapPin className="w-5 h-5 mr-3 text-blue-500 shrink-0" /> 
              {!isEditing ? 
              <span className="truncate">{profileData.location}</span> 
              : <input type="text" value={profileData.location}
               onChange={(e) => setProfileData({...profileData, location: e.target.value})} 
               className="flex-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 px-1 py-0.5 text-sm" />}
            </div>
          </div>
        </div>

        {/* Academic Details Box */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Academic Details</h3>
          <div className="space-y-4">
            <div className="flex items-center text-slate-600">
              <School className="w-5 h-5 mr-3 text-blue-500 shrink-0" /> 
              {!isEditing ? 
              <span className="truncate">{profileData.department}</span>
               : <input type="text" value={profileData.department} 
               onChange={(e) => setProfileData({...profileData, department: e.target.value})} 
               className="flex-1 border-b border-blue-300 focus:outline-none focus:border-blue-600 px-1 py-0.5 text-sm" />}
            </div>
            <div className="flex items-center text-slate-600">
              <Hash className="w-5 h-5 mr-3 text-blue-500 shrink-0" /> 
              <span className="text-slate-500 text-sm">{profileData.employeeId} (Locked)</span>
            </div>
            <div className="flex items-start text-slate-600 mt-2">
              <span className="font-medium mr-3 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded mt-0.5 uppercase tracking-wider">Subjects</span> 
              <div className="flex-1">
                {!isEditing ? (
                  <p className="text-sm font-medium mt-1">{profileData.subjects}</p>
                ) : (
                  <input type="text" value={profileData.subjects} onChange={(e) => setProfileData({...profileData, subjects: e.target.value})} className="w-full border-b border-blue-300 focus:outline-none focus:border-blue-600 px-1 py-0.5 text-sm" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Platform Activity Stats */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">EduSync Platform Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg mr-4"><BookOpen className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Study Minutes</p>
                <p className="text-2xl font-bold text-slate-800">{profileData.stats.studyMinutes}</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center">
              <div className="p-3 bg-teal-100 text-teal-600 rounded-lg mr-4"><MessageCircleQuestion className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Platform Interactions</p>
                <p className="text-2xl font-bold text-slate-800">{profileData.stats.questionsAsked}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
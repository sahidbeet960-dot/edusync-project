import React, { useState, useEffect } from 'react';
import { Mail, GraduationCap, School, Edit3, Save, X, Code, Loader2 } from 'lucide-react';
import apiClient from '../services/api'; // Ensure this path matches your structure

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Student Profile Data State (Mapped to Backend Schema)
  const [profileData, setProfileData] = useState({
    full_name: 'Sahid Al Afzal',
    role: 'STUDENT',
    email: 'sahidalafzal960@gmail.com',
    department: 'Computer Science & Engineering',
    university: 'Jadavpur University',
    semester: 4,
    bio: 'FastAPI Backend Developer & Competitive Programmer (C++). Building MessBook and railBay.'
  });

  // State for handling edits before saving
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      // Fetch the current user's data from the backend
      const response = await apiClient.get('/api/v1/users/me');
      
      // Inject the 'university' field since it's standard for this portal
      const fetchedData = {
        ...response.data,
        university: 'Jadavpur University' 
      };
      
      setProfileData(fetchedData);
      setFormData(fetchedData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Send the PATCH request to your backend
      const payload = {
        full_name: formData.full_name,
        department: formData.department,
        semester: parseInt(formData.semester) || 0,
        bio: formData.bio
      };

      const response = await apiClient.patch('/api/v1/users/me', payload);
      
      // Update UI with fresh DB data
      setProfileData({ ...response.data, university: 'Jadavpur University' });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner and Profile Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white mb-4 sm:mb-0 flex items-center justify-center text-4xl font-bold text-indigo-600 bg-indigo-50">
              {(profileData.full_name || 'S')[0].toUpperCase()}
            </div>
            
            <div className="flex w-full sm:w-auto mt-2 sm:mt-0">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center text-sm border border-slate-200"
                >
                  <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2 w-full sm:w-auto">
                  <button onClick={handleCancel} className="px-4 py-2 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center text-sm border border-slate-200 flex-1 sm:flex-none">
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center text-sm shadow-sm flex-1 sm:flex-none disabled:opacity-70">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} 
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.full_name || ''} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                  className="border-b-2 border-indigo-500 outline-none bg-slate-50 px-2 py-1 rounded w-full max-w-sm text-2xl" 
                />
              ) : (
                profileData.full_name
              )}
              {!isEditing && <span className="ml-3 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full uppercase tracking-wider font-bold">{profileData.role}</span>}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {profileData.semester ? `Semester ${profileData.semester}` : 'New Student'} • {profileData.university}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Contact & Academic Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Academic Information</h3>
          <div className="space-y-5">
            <div className="flex items-center text-slate-600">
              <Mail className="w-5 h-5 mr-3 text-indigo-500 shrink-0" /> 
              <span className="truncate">{profileData.email} <span className="text-xs text-slate-400 ml-2">(Locked)</span></span>
            </div>
            
            <div className="flex items-center text-slate-600">
              <School className="w-5 h-5 mr-3 text-indigo-500 shrink-0" /> 
              {!isEditing ? (
                <span className="truncate font-medium">{profileData.department || 'Not specified'}</span>
              ) : (
                <input 
                  type="text" 
                  placeholder="e.g. Computer Science"
                  value={formData.department || ''} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})} 
                  className="flex-1 border-b border-indigo-300 focus:outline-none focus:border-indigo-600 px-1 py-0.5 text-sm" 
                />
              )}
            </div>

            <div className="flex items-center text-slate-600">
              <GraduationCap className="w-5 h-5 mr-3 text-indigo-500 shrink-0" /> 
              {!isEditing ? (
                <span className="truncate font-medium">Semester {profileData.semester || 'Not set'}</span>
              ) : (
                <input 
                  type="number" 
                  min="1" max="8"
                  placeholder="e.g. 4"
                  value={formData.semester || ''} 
                  onChange={(e) => setFormData({...formData, semester: e.target.value})} 
                  className="flex-1 border-b border-indigo-300 focus:outline-none focus:border-indigo-600 px-1 py-0.5 text-sm" 
                />
              )}
            </div>
          </div>
        </div>

        {/* Bio / Skills Box */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">About Me</h3>
          <div className="space-y-4">
            <div className="flex items-start text-slate-600 mt-2">
              <Code className="w-5 h-5 mr-3 text-indigo-500 shrink-0 mt-0.5" /> 
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-2">Bio & Skills</span>
                {!isEditing ? (
                  <p className="text-sm font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[80px]">
                    {profileData.bio || 'Add a bio to let classmates know your skills!'}
                  </p>
                ) : (
                  <textarea 
                    value={formData.bio || ''} 
                    onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                    className="w-full border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-3 text-sm min-h-[100px] bg-slate-50" 
                    placeholder="Write a short bio or list your skills..."
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
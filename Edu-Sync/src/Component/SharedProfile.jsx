import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, GraduationCap, Edit2, Save, X, Loader2, BookOpen, Camera } from 'lucide-react';
import apiClient from '../services/api';

const SharedProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile State matched EXACTLY to your backend schema
  const [profileData, setProfileData] = useState({
    id: 0,
    email: '',
    full_name: '',
    role: 'STUDENT',
    department: '',
    semester: 0,
    bio: ''
  });

  // Form State (used while editing before saving)
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  // 1. Fetch Current Profile Details
  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/users/me/profile');
      setProfileData(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Failed to load profile details. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Form Inputs
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Submit the PATCH Request
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Payload matched EXACTLY to the allowed modifiable fields in your schema
      const payload = {
        full_name: formData.full_name,
        department: formData.department || '',
        // Ensure semester is sent as an integer
        semester: parseInt(formData.semester) || 0, 
        bio: formData.bio || ''
      };

      const response = await apiClient.patch('/api/v1/users/me', payload);
      
      // Update the main profile state with the fresh data from the backend
      setProfileData(response.data || formData);
      setIsEditing(false);
      alert("Profile updated successfully!");

    } catch (error) {
      console.error("Profile update error:", error);
      alert(error.response?.data?.detail || "Failed to update profile. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel Editing
  const handleCancel = () => {
    setFormData(profileData); // Revert form back to original data
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-teal-500"></div>
        
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 sm:-mt-16 mb-6">
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full p-1.5 shadow-md">
                <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl sm:text-4xl font-bold border border-slate-100">
                  {(profileData.full_name || 'U')[0].toUpperCase()}
                </div>
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 shadow-sm transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 sm:mt-0 flex space-x-3">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-200 flex items-center shadow-sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleCancel}
                    className="px-5 py-2.5 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors border border-slate-300 flex items-center shadow-sm"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center shadow-sm disabled:opacity-70"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} 
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              {isEditing ? (
                <input 
                  type="text" 
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleInputChange}
                  className="font-bold text-2xl sm:text-3xl border-b-2 border-indigo-500 outline-none bg-slate-50 px-2 py-1 rounded w-full max-w-sm"
                  placeholder="Full Name"
                />
              ) : (
                profileData.full_name || 'Unknown User'
              )}
            </h1>
            <p className="text-slate-500 font-medium flex items-center">
              <Shield className="w-4 h-4 mr-1.5 text-indigo-400" />
              {(profileData.role || 'STUDENT').toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details Form/View */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Email (Read-Only) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 flex items-center">
              <Mail className="w-4 h-4 mr-2" /> Email Address
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium cursor-not-allowed">
              {profileData.email || 'No email provided'}
            </div>
            {isEditing && <p className="text-[10px] text-slate-400">Email cannot be changed.</p>}
          </div>

          {/* Semester (Replaced Phone) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" /> Semester
            </label>
            {isEditing ? (
              <input 
                type="number" 
                name="semester"
                min="1"
                max="8"
                value={formData.semester || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="e.g., 5"
              />
            ) : (
              <div className="p-3 text-slate-800 text-sm font-medium border border-transparent">
                {profileData.semester ? `Semester ${profileData.semester}` : 'Not specified'}
              </div>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" /> Department / Major
            </label>
            {isEditing ? (
              <input 
                type="text" 
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="e.g., Computer Science"
              />
            ) : (
              <div className="p-3 text-slate-800 text-sm font-medium border border-transparent">
                {profileData.department || 'Not specified'}
              </div>
            )}
          </div>

          {/* Bio / About */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-500 flex items-center">
              <User className="w-4 h-4 mr-2" /> About Me
            </label>
            {isEditing ? (
              <textarea 
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[100px]"
                placeholder="Write a little bit about yourself..."
              ></textarea>
            ) : (
              <div className="p-3 text-slate-800 text-sm bg-slate-50/50 rounded-xl border border-slate-100 min-h-[80px]">
                {profileData.bio || <span className="text-slate-400 italic">No bio added yet.</span>}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SharedProfile;
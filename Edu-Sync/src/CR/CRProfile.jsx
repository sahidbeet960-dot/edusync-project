import React, { useState } from 'react';
import { Mail, Phone, Hash, School, Edit3, Save, X } from 'lucide-react';

const CRProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  // CR Profile Data State
  const [profileData, setProfileData] = useState({
    name: 'Sarah J.',
    title: 'Class Representative • 3rd Year CSE',
    email: 'sarah.j@ju-sync.edu',
    phone: '+91 98765 12345',
    rollNumber: 'CSE2024-042',
    department: 'Computer Science & Engineering',
    batch: 'Batch 2024-2028'
  });

  const handleSave = () => {
    setIsEditing(false);
    alert('CR Profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner and Profile Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-teal-500 to-emerald-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 mb-6">
            <img 
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white mb-4 sm:mb-0"
            />
            
            <div className="flex space-x-3 w-full sm:w-auto">
              {/* Edit Profile Toggle */}
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center text-sm border border-slate-200"
                >
                  <Edit3 className="w-4 h-4 mr-2" /> Edit Details
                </button>
              ) : (
                <div className="flex space-x-2 flex-1 sm:flex-none">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-2 bg-white text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center text-sm border border-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center text-sm shadow-sm">
                    <Save className="w-4 h-4 mr-2" /> Save
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              {profileData.name} 
              <span className="ml-3 px-2 py-0.5 bg-teal-100 text-teal-800 text-xs rounded-full uppercase tracking-wider font-bold">Class Rep</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">{profileData.title}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Contact Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center text-slate-600">
              <Mail className="w-5 h-5 mr-3 text-teal-500" /> 
              {!isEditing ? profileData.email : <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="flex-1 border-b border-teal-300 focus:outline-none focus:border-teal-600 px-1 py-0.5" />}
            </div>
            <div className="flex items-center text-slate-600">
              <Phone className="w-5 h-5 mr-3 text-teal-500" /> 
              {!isEditing ? profileData.phone : <input type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="flex-1 border-b border-teal-300 focus:outline-none focus:border-teal-600 px-1 py-0.5" />}
            </div>
          </div>
        </div>

        {/* Academic Details Box */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Academic Details</h3>
          <div className="space-y-4">
            <div className="flex items-center text-slate-600">
              <Hash className="w-5 h-5 mr-3 text-teal-500" /> 
              {!isEditing ? profileData.rollNumber : <span className="text-slate-400">{profileData.rollNumber} (Locked)</span>}
            </div>
            <div className="flex items-center text-slate-600">
              <School className="w-5 h-5 mr-3 text-teal-500" /> 
              <span className="truncate">{profileData.department}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <span className="font-medium mr-2 text-sm bg-teal-50 text-teal-700 px-2 py-1 rounded">Batch:</span> 
              <span>{profileData.batch}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRProfile;
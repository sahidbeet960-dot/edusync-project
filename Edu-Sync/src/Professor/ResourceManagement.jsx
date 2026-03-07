import React, { useState } from 'react';
import { ChevronRight, Upload, X, Loader2, Megaphone, BookOpen } from 'lucide-react';
import apiClient from '../services/api';

const ResourceManagement = ()=> {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [uploadType, setUploadType] = useState(''); // 'Notice' or 'Syllabus'.
      const [isUploading, setIsUploading] = useState(false); 

      const [uploadForm, setUploadForm] = useState({
          title: '',
          description: '',
          semester: '',
          file: null
      });

      const openModal = (type) => {
          setUploadType(type);
          setIsModalOpen(true);
      };

      const handleFileChange = (e) => {
           setUploadForm({ ...uploadForm, file: e.target.files[0] });
      };

      const handleUploadSubmit = async (e) => {
           e.preventDefault();
           if (!uploadForm.file) {
               alert("Please select a file to upload.");
               return;
           }

           setIsUploading(true);

           try {
                const formData = new FormData();
                formData.append('title', uploadForm.title);
                formData.append('description', uploadForm.description || '');
                formData.append('semester', uploadForm.semester);
                formData.append('tags', uploadType); 
                formData.append('file', uploadForm.file); 

                const uploadResponse = await apiClient.post('/api/v1/materials/', formData, {
                      headers: {
                             'Content-Type': 'multipart/form-data'
                      }
                });

                 const materialId = uploadResponse.data?.material?.id; 
      
               if (materialId) {
                         await apiClient.patch(`/api/v1/materials/${materialId}/verify`);
                         alert(`${uploadType} published and verified successfully! It is now visible to students.`);
               } else {
                       console.warn("Could not find ID in response:", uploadResponse.data);
                       alert(`${uploadType} published, but we couldn't auto-verify it.`);
               }
      
                setIsModalOpen(false);
                setUploadForm({ title: '', description: '', semester: '', file: null });

            } catch (error) {
                  console.error(`Error uploading ${uploadType}:`, error);
                  alert(error.response?.data?.detail || `Failed to post ${uploadType}. Please try again.`);
            } finally {
               setIsUploading(false);
            }
    };
      
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        
        {/* Post Notice Button */}
        <button 
          onClick={() => openModal('Notice')}
          className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 group"
        >
          <div className="flex items-center font-bold text-sm">
            <Megaphone className="w-4 h-4 mr-2" /> Post Official Notice
          </div>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Update Syllabus Button */}
        <button 
          onClick={() => openModal('Syllabus')}
          className="w-full flex items-center justify-between p-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 group"
        >
          <div className="flex items-center font-bold text-sm">
            <BookOpen className="w-4 h-4 mr-2" /> Update Syllabus
          </div>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                {uploadType === 'Notice' ? <Megaphone className="w-5 h-5 mr-2 text-blue-600" /> : <BookOpen className="w-5 h-5 mr-2 text-slate-600" />}
                Publish New {uploadType}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={uploadForm.title} 
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} 
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm" 
                  placeholder={uploadType === 'Notice' ? "E.g., Mid-Term Exam Schedule" : "E.g., CS-301 Revised Syllabus"} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Target Semester <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  min="1" max="8" 
                  required 
                  value={uploadForm.semester} 
                  onChange={(e) => setUploadForm({...uploadForm, semester: e.target.value})} 
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm" 
                  placeholder="1-8" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={uploadForm.description} 
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} 
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm min-h-[80px]" 
                  placeholder="Add a short message..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Upload PDF/Document <span className="text-red-500">*</span></label>
                <input 
                  type="file" 
                  required 
                  onChange={handleFileChange} 
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 border border-slate-300 rounded-xl p-2 bg-slate-50 cursor-pointer transition-colors" 
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center shadow-md disabled:opacity-70 text-sm">
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isUploading ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ResourceManagement;
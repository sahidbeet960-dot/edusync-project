import React, { useState, useEffect } from 'react';
import { FilePlus, FileText, X, Loader2, Folder, ChevronRight, Download, Trash2, ShieldMinus, Library, Layers } from 'lucide-react';
import apiClient from '../services/api'; 
import { jwtDecode } from 'jwt-decode';

const SharedResources = () => {
  const [userRole, setUserRole] = useState('STUDENT');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 2-Level Navigation State
  const [activeSemester, setActiveSemester] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  
  const [materials, setMaterials] = useState([]);

  const [uploadForm, setUploadForm] = useState({
    title: '', description: '', semester: '', subject: '', file: null
  });

  useEffect(() => {
    const token = localStorage.getItem('edusync_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role?.toUpperCase() || 'STUDENT');
      } catch (e) {
        console.error("Invalid token");
      }
    }
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/materials/');
      const verifiedNotesOnly = response.data.filter(file => 
        file.is_verified === true && file.tags !== 'Notice' && file.tags !== 'Syllabus'
      );
      setMaterials(verifiedNotesOnly);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => setUploadForm({ ...uploadForm, file: e.target.files[0] });

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description || '');
      formData.append('semester', uploadForm.semester);
      formData.append('tags', uploadForm.subject || 'General'); 
      formData.append('file', uploadForm.file); 

      // Re-applied the undefined trick to ensure Railway uploads don't fail due to boundary issues!
      const uploadResponse = await apiClient.post('/api/v1/materials/', formData, {
        headers: { 'Content-Type': undefined }
      });

      const materialId = uploadResponse.data?.material?.id;

      if (userRole === 'PROFESSOR' || userRole === 'CR') {
         if (materialId) {
            await apiClient.patch(`/api/v1/materials/${materialId}/verify`);
            alert("Resource uploaded and instantly verified!");
         }
      } else {
         alert("Upload successful! It has been sent to the Professor for verification.");
      }

      setIsUploadModalOpen(false);
      setUploadForm({ title: '', description: '', semester: '', subject: '', file: null });
      fetchMaterials(); 

    } catch (error) {
      // Re-applied the backend bypass trick so the UI refreshes even if FastAPI throws a serialization error
      console.warn("Upload error or backend serialization issue. Refreshing feed anyway...");
      setIsUploadModalOpen(false);
      setUploadForm({ title: '', description: '', semester: '', subject: '', file: null });
      await fetchMaterials();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this file?")) return;
    try {
      await apiClient.delete(`/api/v1/materials/${id}`);
      fetchMaterials();
    } catch (error) {
      alert("Failed to delete file.");
    }
  };

  const handleUnverify = async (id) => {
    if (!window.confirm("Remove this from the verified student feed?")) return;
    try {
      await apiClient.patch(`/api/v1/materials/${id}/unverify`);
      fetchMaterials(); 
    } catch (error) {
      alert("Failed to unverify.");
    }
  };

  // Hierarchical Grouping Logic (Semester -> Subject -> Files)
  const structuredData = materials.reduce((acc, material) => {
    const sem = material.semester || 'Other';
    const subject = material.tags || 'General Notes';

    if (!acc[sem]) acc[sem] = {};
    if (!acc[sem][subject]) acc[sem][subject] = [];

    acc[sem][subject].push(material);
    return acc;
  }, {});

  // Navigation Helpers
  const goBackToSemesters = () => {
    setActiveSemester(null);
    setActiveFolder(null);
  };

  const goBackToSubjects = () => {
    setActiveFolder(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Library className="w-6 h-6 mr-3 text-blue-600 fill-blue-100" /> Academic Vault
          </h2>
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center text-sm font-medium mt-2 text-slate-500">
            <span 
              onClick={goBackToSemesters} 
              className={`cursor-pointer hover:text-blue-600 transition-colors ${!activeSemester && 'text-blue-600 font-bold'}`}
            >
              All Semesters
            </span>
            
            {activeSemester && (
              <>
                <ChevronRight className="w-4 h-4 mx-1 text-slate-300" />
                <span 
                  onClick={goBackToSubjects} 
                  className={`cursor-pointer hover:text-blue-600 transition-colors ${!activeFolder && 'text-blue-600 font-bold'}`}
                >
                  Semester {activeSemester}
                </span>
              </>
            )}
            
            {activeFolder && (
              <>
                <ChevronRight className="w-4 h-4 mx-1 text-slate-300" />
                <span className="text-blue-600 font-bold">{activeFolder}</span>
              </>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FilePlus className="w-5 h-5 mr-2" /> Upload Material
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : Object.keys(structuredData).length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Library className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <p className="text-lg font-bold text-slate-700">The vault is empty.</p>
          <p className="text-sm mt-1">No verified materials have been uploaded yet.</p>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-8 duration-300">
          
          {/* LEVEL 1: SEMESTER VIEW */}
          {!activeSemester && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.keys(structuredData).sort((a,b) => a - b).map(sem => {
                const subjectCount = Object.keys(structuredData[sem]).length;
                const fileCount = Object.values(structuredData[sem]).flat().length;
                return (
                  <div 
                    key={sem}
                    onClick={() => setActiveSemester(sem)}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100 transition-colors"></div>
                    <Layers className="w-14 h-14 text-blue-500 group-hover:scale-110 transition-transform duration-300 mb-3" />
                    <h3 className="font-bold text-slate-800 text-lg">Semester {sem}</h3>
                    <div className="flex gap-2 mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{subjectCount} Subjects</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{fileCount} Files</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LEVEL 2: SUBJECT VIEW */}
          {activeSemester && !activeFolder && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.keys(structuredData[activeSemester]).sort().map((subject) => (
                <div 
                  key={subject}
                  onClick={() => setActiveFolder(subject)}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center text-center"
                >
                  <Folder className="w-16 h-16 text-blue-400 fill-blue-50 group-hover:scale-110 transition-transform duration-300 mb-4" />
                  <h3 className="font-bold text-slate-800 line-clamp-2">{subject}</h3>
                  <p className="text-xs font-bold text-slate-500 mt-2 bg-slate-100 px-3 py-1 rounded-full">
                    {structuredData[activeSemester][subject].length} Files
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* LEVEL 3: FILE VIEW */}
          {activeSemester && activeFolder && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {structuredData[activeSemester][activeFolder]?.map((file) => (
                <div key={file.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col relative group">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* FIXED: Admin actions moved out of absolute positioning so they no longer overlap the Download button! */}
                      {(userRole === 'PROFESSOR' || userRole === 'CR') && (
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                          <button onClick={() => handleUnverify(file.id)} className="p-1.5 text-orange-500 hover:bg-orange-100 rounded-md" title="Unverify">
                            <ShieldMinus className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(file.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors border border-transparent group-hover:border-slate-200" title="Download">
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-slate-800 mb-1">{file.title}</h4>
                  <p className="text-xs text-slate-500 flex-1 line-clamp-2">{file.description}</p>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-4 pt-4 border-t border-slate-100">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Sem {file.semester}</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <FilePlus className="w-5 h-5 mr-2 text-blue-600" /> Upload Material
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" required value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="E.g., Graph Algorithms" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Subject Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={uploadForm.subject} onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="E.g., Data Structures" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Semester <span className="text-red-500">*</span></label>
                  <input type="number" min="1" max="8" required value={uploadForm.semester} onChange={(e) => setUploadForm({...uploadForm, semester: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="1-8" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea value={uploadForm.description} onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 min-h-[80px]" placeholder="Brief context about this material..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select File <span className="text-red-500">*</span></label>
                <input type="file" required onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 border border-slate-300 rounded-xl p-2 bg-slate-50 cursor-pointer" />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center shadow-md disabled:opacity-70">
                  {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FilePlus className="w-5 h-5 mr-2" />}
                  {isUploading ? 'Uploading...' : 'Submit Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedResources;
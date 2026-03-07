import React, { useState, useRef } from 'react';
import { UploadCloud, BookOpen, FileText, X } from 'lucide-react';

const SyllabusPage = () => {
  const [semester, setSemester] = useState('Semester 1');
  const [subject, setSubject] = useState('Data Structures');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const fileInputRef = useRef(null); // Reference to the hidden input

  // Open file explorer
  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  // Handle the file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload first!");
      return;
    }
    
    // In the future, this is where you send the file to your backend via fetch()
    alert(`Success! "${selectedFile.name}" has been uploaded for ${subject} (${semester}). It is now visible on the Student Dashboard.`);
    
    // Clear the form after upload
    setSelectedFile(null);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <BookOpen className="w-6 h-6 mr-3 text-blue-600" /> Update Course Syllabus
      </h2>
      
      <form onSubmit={handleUpload} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Semester</label>
            <select value={semester} onChange={(e)=>setSemester(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option>Semester 1</option>
              <option>Semester 3</option>
              <option>Semester 5</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Subject</label>
            <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option>Data Structures</option>
              <option>Operating Systems</option>
              <option>Computer Networks</option>
            </select>
          </div>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          accept=".pdf" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />

        {/* Dynamic Drag & Drop Area */}
        {!selectedFile ? (
          <div 
            onClick={handleDivClick}
            className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-12 h-12 text-blue-500 mb-3" />
            <p className="font-medium text-slate-700">Click to browse your computer files</p>
            <p className="text-sm mt-1">PDF files only (Max 10MB)</p>
          </div>
        ) : (
          <div className="border border-green-200 bg-green-50 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 text-green-700 rounded-lg mr-4">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">{selectedFile.size} • Ready to upload</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setSelectedFile(null)} 
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <button 
          type="submit" 
          className={`px-6 py-3 font-bold rounded-lg transition-colors w-full sm:w-auto shadow-md ${
            selectedFile ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          disabled={!selectedFile}
        >
          Confirm & Upload to Dashboard
        </button>
      </form>
    </div>
  );
};

export default SyllabusPage;
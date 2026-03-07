import React, { useState } from 'react';
import { Clock, MapPin, User, Edit2, Plus, X, Save, Trash2, CalendarDays, CheckCircle } from 'lucide-react';

const ScheduleEditor = () => {
  // 1. Initial Schedule Data Structure
  const [schedule, setSchedule] = useState({
    Monday: [
      { id: 'm1', subject: 'Data Structures', time: '10:00 AM - 11:30 AM', room: 'Room 402', professor: 'Dr. Smith', type: 'Lecture' },
      { id: 'm2', subject: 'OS Lab', time: '02:00 PM - 05:00 PM', room: 'Lab 3', professor: 'Prof. Davis', type: 'Lab' }
    ],
    Tuesday: [
      { id: 't1', subject: 'Computer Networks', time: '10:00 AM - 11:30 AM', room: 'Room 405', professor: 'Dr. Wilson', type: 'Lecture' },
      { id: 't2', subject: 'Mathematics III', time: '12:00 PM - 01:00 PM', room: 'Room 301', professor: 'Dr. Roy', type: 'Lecture' }
    ],
    Wednesday: [],
    Thursday: [
      { id: 'th1', subject: 'Operating Systems', time: '11:00 AM - 12:30 PM', room: 'Room 402', professor: 'Prof. Davis', type: 'Lecture' }
    ],
    Friday: [
      { id: 'f1', subject: 'Data Structures Lab', time: '10:00 AM - 01:00 PM', room: 'Lab 2', professor: 'Dr. Smith', type: 'Lab' }
    ]
  });

  // 2. Modal and Toast States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState('');
  const [showToast, setShowToast] = useState(false); // NEW: State for the success popup
  
  // 3. Form State for the Modal
  const [formData, setFormData] = useState({
    id: '', subject: '', time: '', room: '', professor: '', type: 'Lecture'
  });

  const handleAddClass = (day) => {
    setActiveDay(day);
    setFormData({ id: Date.now().toString(), subject: '', time: '', room: '', professor: '', type: 'Lecture' });
    setIsModalOpen(true);
  };

  const handleEditClass = (day, classData) => {
    setActiveDay(day);
    setFormData(classData);
    setIsModalOpen(true);
  };

  const handleDeleteClass = (day, classId) => {
    if(window.confirm("Are you sure you want to remove this class from the schedule?")) {
      setSchedule({
        ...schedule,
        [day]: schedule[day].filter(c => c.id !== classId)
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const currentDaySchedule = schedule[activeDay];
    const existingClassIndex = currentDaySchedule.findIndex(c => c.id === formData.id);

    let updatedDaySchedule;
    if (existingClassIndex >= 0) {
      updatedDaySchedule = [...currentDaySchedule];
      updatedDaySchedule[existingClassIndex] = formData;
    } else {
      updatedDaySchedule = [...currentDaySchedule, formData];
    }

    setSchedule({ ...schedule, [activeDay]: updatedDaySchedule });
    setIsModalOpen(false);
  };

  // NEW: Function to handle publishing the data
  const handlePublish = () => {
    // In a real app, you would send the 'schedule' object to your backend here
    // Example: await fetch('/api/schedule/update', { method: 'POST', body: JSON.stringify(schedule) });
    
    // Show the success toast
    setShowToast(true);

    // Hide the toast automatically after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <CalendarDays className="w-6 h-6 mr-3 text-teal-600" /> Weekly Schedule Editor
          </h2>
          <p className="text-slate-500 mt-1">Modifications here will instantly update the student dashboard.</p>
        </div>
        
        {/* NEW: Attached the onClick handler to the button */}
        <button 
          onClick={handlePublish}
          className="mt-4 sm:mt-0 px-6 py-2.5 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-all shadow-sm flex items-center active:scale-95"
        >
          <Save className="w-5 h-5 mr-2" /> Publish Changes
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{day}</h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                {schedule[day].length} Classes
              </span>
            </div>

            <div className="p-4 flex-1 space-y-4">
              {schedule[day].length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  No classes scheduled.
                </div>
              ) : (
                schedule[day].map((cls) => (
                  <div key={cls.id} className="relative group border border-slate-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-md transition-all bg-white">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${cls.type === 'Lab' ? 'bg-purple-400' : 'bg-teal-400'}`}></div>
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white shadow-sm rounded-md border border-slate-100 p-1">
                      <button onClick={() => handleEditClass(day, cls)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteClass(day, cls.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm pr-12">{cls.subject}</h4>
                    <span className={`inline-block mt-1 mb-3 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider ${
                      cls.type === 'Lab' ? 'bg-purple-50 text-purple-700' : 'bg-teal-50 text-teal-700'
                    }`}>
                      {cls.type}
                    </span>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center"><Clock className="w-3.5 h-3.5 mr-2 text-slate-400" /> {cls.time}</div>
                      <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" /> {cls.room}</div>
                      <div className="flex items-center"><User className="w-3.5 h-3.5 mr-2 text-slate-400" /> {cls.professor}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
              <button 
                onClick={() => handleAddClass(day)}
                className="w-full py-2 flex items-center justify-center text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-dashed border-teal-200"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Slot
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* NEW: Success Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          <CheckCircle className="w-6 h-6 text-teal-400 mr-3" />
          <div>
            <h4 className="font-bold text-sm">Schedule Published!</h4>
            <p className="text-xs text-slate-300 mt-0.5">Students can now see the updated timetable.</p>
          </div>
        </div>
      )}

      {/* Modal for Editing/Adding Classes */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">
                {formData.subject ? 'Edit Class' : 'Add New Class'} <span className="text-teal-600">({activeDay})</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
                <input type="text" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g., Data Structures" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot</label>
                  <input type="text" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" placeholder="10:00 AM - 11:30 AM" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room/Lab</label>
                  <input type="text" required value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" placeholder="Room 402" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Professor</label>
                  <input type="text" required value={formData.professor} onChange={(e) => setFormData({...formData, professor: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" placeholder="Dr. Smith" />
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleEditor;
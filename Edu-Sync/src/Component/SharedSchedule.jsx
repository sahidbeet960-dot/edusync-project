import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, Edit2, Plus, X, Save, Trash2, CalendarDays, CheckCircle, Calendar, AlignLeft, Loader2, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import apiClient from '../services/api'; // Ensure this matches your folder structure
import { jwtDecode } from 'jwt-decode';

const SharedTimetable = () => {
  const [userRole, setUserRole] = useState('STUDENT');
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. WEEKLY TIMETABLE STATE ---
  const [schedule, setSchedule] = useState({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
  });
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [slotFormData, setSlotFormData] = useState({
    id: '', subject: '', time: '', room: '', professor: '', type: 'Lecture'
  });

  // --- 2. IMPORTANT DATES (CALENDAR) STATE ---
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: '', description: '', event_date: '', location: ''
  });

  // NEW: Interactive Visual Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState(null); // Holds events for the clicked day

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
    
    fetchWeeklySchedule();
    fetchCalendarEvents();
  }, []);

  const canEdit = userRole === 'CR' || userRole === 'PROFESSOR';

  // ==========================================
  // API FETCH FUNCTIONS
  // ==========================================
  
 const fetchWeeklySchedule = async () => {
    try {
      const response = await apiClient.get('/api/v1/schedule/weekly');
      if (response.data && Object.keys(response.data).length > 0) {
        setSchedule(response.data);
      }
    } catch (error) {
      console.warn("Could not fetch timetable. Using empty default.");
    }
  };

  const fetchCalendarEvents = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/events/');
      const sortedEvents = response.data.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      setCalendarEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // WEEKLY TIMETABLE LOGIC
  // ==========================================

  const handleAddClass = (day) => {
    setActiveDay(day);
    setSlotFormData({ id: Date.now().toString(), subject: '', time: '', room: '', professor: '', type: 'Lecture' });
    setIsSlotModalOpen(true);
  };

  const handleEditClass = (day, classData) => {
    setActiveDay(day);
    setSlotFormData(classData);
    setIsSlotModalOpen(true);
  };

  const handleDeleteClass = (day, classId) => {
    if(window.confirm("Are you sure you want to remove this class from the schedule?")) {
      setSchedule({ ...schedule, [day]: schedule[day].filter(c => c.id !== classId) });
    }
  };

  const handleSaveSlot = (e) => {
    e.preventDefault();
    const currentDaySchedule = schedule[activeDay] || [];
    const existingClassIndex = currentDaySchedule.findIndex(c => c.id === slotFormData.id);

    let updatedDaySchedule;
    if (existingClassIndex >= 0) {
      updatedDaySchedule = [...currentDaySchedule];
      updatedDaySchedule[existingClassIndex] = slotFormData;
    } else {
      updatedDaySchedule = [...currentDaySchedule, slotFormData];
    }

    setSchedule({ ...schedule, [activeDay]: updatedDaySchedule });
    setIsSlotModalOpen(false);
  };

  const handlePublishTimetable = async () => {
    try {
      await apiClient.post('/api/v1/schedule/weekly', schedule);   
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Publish error:", error);
      alert("Failed to publish schedule to the backend.");
    }
  };

  // ==========================================
  // VISUAL CALENDAR LOGIC
  // ==========================================

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmittingEvent(true);
    try {
      const formattedDate = new Date(eventFormData.event_date).toISOString();
      const payload = {
        title: eventFormData.title,
        description: eventFormData.description || '',
        event_date: formattedDate,
        location: eventFormData.location || ''
      };

      await apiClient.post('/api/v1/events/', payload);
      alert("Event added to calendar successfully!");
      setEventFormData({ title: '', description: '', event_date: '', location: '' });
      fetchCalendarEvents(); 
    } catch (error) {
      console.error("Error creating event:", error);
      alert(error.response?.data?.detail || "Failed to add event.");
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // Calendar Math Helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty slots before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-transparent"></div>);
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = new Date(year, month, day).toDateString();
      
      // Find all events that happen on this specific day
      const dayEvents = calendarEvents.filter(evt => new Date(evt.event_date).toDateString() === dateString);
      const hasEvents = dayEvents.length > 0;
      
      const isToday = new Date().toDateString() === dateString;

      days.push(
        <div 
          key={day} 
          onClick={() => hasEvents ? setSelectedDateEvents({ date: dateString, events: dayEvents }) : setSelectedDateEvents(null)}
          className={`h-20 sm:h-24 p-1 sm:p-2 border rounded-xl transition-all cursor-pointer flex flex-col items-start justify-start relative group
            ${isToday ? 'border-teal-400 bg-teal-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300'}
            ${hasEvents ? 'hover:shadow-md' : 'cursor-default'}
          `}
        >
          <span className={`text-sm font-bold ${isToday ? 'text-teal-700' : 'text-slate-600'}`}>{day}</span>
          
          {/* Visual indicators for events */}
          <div className="mt-1 w-full space-y-1 overflow-hidden">
            {dayEvents.slice(0, 2).map((evt, idx) => (
              <div key={idx} className="text-[9px] sm:text-[10px] truncate bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold w-full">
                {evt.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[9px] text-slate-500 font-bold pl-1">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const calendarHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 relative">
      
      {/* --- MAIN HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <CalendarDays className="w-6 h-6 mr-3 text-teal-600" /> Weekly Schedule
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            {canEdit ? "Modifications here will instantly update the student dashboard." : "Your current class timetable."}
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button 
            onClick={() => setIsCalendarModalOpen(true)}
            className="text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors px-4 py-2.5 rounded-xl border border-teal-200 flex items-center shadow-sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {canEdit ? 'Manage Calendar' : 'View Full Calendar'}
          </button>

          {canEdit && (
            <button 
              onClick={handlePublishTimetable}
              className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm flex items-center active:scale-95 text-sm"
            >
              <Save className="w-4 h-4 mr-2" /> Publish Week
            </button>
          )}
        </div>
      </div>

      {/* --- WEEKLY TIMETABLE GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{day}</h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                {(schedule[day] || []).length} Classes
              </span>
            </div>

            <div className="p-4 flex-1 space-y-4">
              {!(schedule[day] && schedule[day].length > 0) ? (
                <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  No classes scheduled.
                </div>
              ) : (
                schedule[day].map((cls) => (
                  <div key={cls.id} className="relative group border border-slate-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-md transition-all bg-white">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${cls.type === 'Lab' ? 'bg-purple-400' : 'bg-teal-400'}`}></div>
                    
                    {canEdit && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white shadow-sm rounded-md border border-slate-100 p-1">
                        <button onClick={() => handleEditClass(day, cls)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteClass(day, cls.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <h4 className="font-bold text-slate-800 text-sm pr-12 leading-tight">{cls.subject}</h4>
                    <span className={`inline-block mt-1.5 mb-3 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider ${
                      cls.type === 'Lab' ? 'bg-purple-50 text-purple-700' : 'bg-teal-50 text-teal-700'
                    }`}>
                      {cls.type}
                    </span>

                    <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                      <div className="flex items-center"><Clock className="w-3.5 h-3.5 mr-2 text-slate-400" /> {cls.time}</div>
                      <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" /> {cls.room}</div>
                      <div className="flex items-center"><User className="w-3.5 h-3.5 mr-2 text-slate-400" /> {cls.professor}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {canEdit && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
                <button 
                  onClick={() => handleAddClass(day)}
                  className="w-full py-2 flex items-center justify-center text-sm font-bold text-teal-600 hover:bg-teal-50 rounded-xl transition-colors border border-dashed border-teal-200"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Slot
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showToast && (
        <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          <CheckCircle className="w-6 h-6 text-teal-400 mr-3" />
          <div>
            <h4 className="font-bold text-sm">Schedule Published!</h4>
            <p className="text-xs text-slate-300 mt-0.5">Students can now see the updated timetable.</p>
          </div>
        </div>
      )}

      {/* --- WEEKLY TIMETABLE EDIT MODAL --- */}
      {isSlotModalOpen && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
           {/* ... (Kept exactly as it was, no changes to this modal) ... */}
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">
                {slotFormData.subject ? 'Edit Class' : 'Add New Class'} <span className="text-teal-600">({activeDay})</span>
              </h3>
              <button onClick={() => setIsSlotModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white p-1 rounded-full shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSaveSlot} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Subject Name</label>
                <input type="text" required value={slotFormData.subject} onChange={(e) => setSlotFormData({...slotFormData, subject: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" placeholder="e.g., Data Structures" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Time Slot</label>
                  <input type="text" required value={slotFormData.time} onChange={(e) => setSlotFormData({...slotFormData, time: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" placeholder="10:00 AM - 11:30 AM" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Class Type</label>
                  <select value={slotFormData.type} onChange={(e) => setSlotFormData({...slotFormData, type: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50">
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Room/Lab</label>
                  <input type="text" required value={slotFormData.room} onChange={(e) => setSlotFormData({...slotFormData, room: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" placeholder="Room 402" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Professor</label>
                  <input type="text" required value={slotFormData.professor} onChange={(e) => setSlotFormData({...slotFormData, professor: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" placeholder="Dr. Smith" />
                </div>
              </div>

              <div className="pt-4 flex space-x-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsSlotModalOpen(false)} className="flex-1 py-2.5 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm">Save Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NEW VISUAL CALENDAR MODAL --- */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50 shrink-0">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-indigo-600" /> Academic Calendar
              </h3>
              <button onClick={() => { setIsCalendarModalOpen(false); setSelectedDateEvents(null); }} className="text-slate-400 hover:text-slate-700 bg-white p-1 rounded-full shadow-sm"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              
              {/* THE GRID CALENDAR (Left Side) */}
              <div className={`p-6 overflow-y-auto ${canEdit || selectedDateEvents ? 'lg:w-2/3 border-b lg:border-b-0 lg:border-r border-slate-200' : 'w-full'}`}>
                
                {/* Calendar Controls */}
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-bold text-slate-800">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="flex space-x-2">
                    <button onClick={handlePrevMonth} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={handleNextMonth} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>

                {/* Calendar Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {calendarHeaders.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* The Interactive Days Grid */}
                <div className="grid grid-cols-7 gap-2 sm:gap-3">
                  {renderCalendarDays()}
                </div>
              </div>

              {/* SIDE PANEL (Right Side) - Event Details OR Add Event Form */}
              {(canEdit || selectedDateEvents) && (
                <div className="p-6 lg:w-1/3 bg-slate-50 overflow-y-auto flex flex-col space-y-6">
                  
                  {/* Event Details Viewer (If they clicked a date) */}
                  {selectedDateEvents && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-right-4">
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                        <h4 className="font-bold text-slate-700 flex items-center">
                          <Tag className="w-4 h-4 mr-2 text-indigo-500" /> Events for {new Date(selectedDateEvents.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </h4>
                        <button onClick={() => setSelectedDateEvents(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                      </div>
                      
                      <div className="space-y-4">
                        {selectedDateEvents.events.map((evt) => (
                          <div key={evt.id} className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                            <h5 className="font-bold text-slate-800 text-sm">{evt.title}</h5>
                            {evt.description && <p className="text-xs text-slate-600 mt-2 mb-3 bg-white p-2 rounded border border-slate-100">{evt.description}</p>}
                            <div className="space-y-1.5 mt-2">
                              <div className="flex items-center text-[11px] font-bold text-indigo-700">
                                <Clock className="w-3 h-3 mr-1.5" /> {new Date(evt.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                              {evt.location && (
                                <div className="flex items-center text-[11px] font-bold text-slate-500">
                                  <MapPin className="w-3 h-3 mr-1.5" /> {evt.location}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Event Form (Always visible for CRs/Professors underneath) */}
                  {canEdit && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-auto">
                      <h4 className="font-bold text-slate-700 mb-4 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">Add New Event</h4>
                      <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div>
                          <input type="text" required value={eventFormData.title} onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50" placeholder="Event Title (e.g., Final Exam)" />
                        </div>
                        <div>
                          <input type="datetime-local" required value={eventFormData.event_date} onChange={(e) => setEventFormData({...eventFormData, event_date: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600 bg-slate-50" />
                        </div>
                        <div>
                          <input type="text" value={eventFormData.location} onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50" placeholder="Location (Optional)" />
                        </div>
                        <div>
                          <textarea value={eventFormData.description} onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[60px] bg-slate-50" placeholder="Description..."></textarea>
                        </div>
                        <button type="submit" disabled={isSubmittingEvent} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center text-sm">
                          {isSubmittingEvent ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Create Event
                        </button>
                      </form>
                    </div>
                  )}
                  
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SharedTimetable;
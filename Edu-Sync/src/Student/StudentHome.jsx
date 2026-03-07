import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, ChevronRight, MessageSquare, Flag, Loader2, Timer, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardNotices from '../Component/DashboardNotices';
import apiClient from '../services/api';
import { jwtDecode } from 'jwt-decode';

const StudentHome = () => {
  const navigate = useNavigate();

  // --- Dynamic State ---
  const [userName, setUserName] = useState('Student');
  const [isLoading, setIsLoading] = useState(true);
  
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // Stats
  const [forumActivityCount, setForumActivityCount] = useState(0);
  const [newResourcesCount, setNewResourcesCount] = useState(0);
  // NEW: Study Stats State
  const [studyStats, setStudyStats] = useState({ total_study_minutes: 0 });
  const [roomCode, setRoomCode] = useState('');

  // ==========================================
  // INITIAL DATA FETCH
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem('edusync_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.name) setUserName(decoded.name);
      } catch (e) { console.error("Invalid token"); }
    }

    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Weekly Schedule
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayStr = days[new Date().getDay()]; 
      
      try {
        const scheduleRes = await apiClient.get('/api/v1/schedule/weekly');
        setTodaysClasses(scheduleRes.data[todayStr] || []);
      } catch (e) {
        // Fallback if schedule endpoint isn't fully wired yet
        setTodaysClasses([]);
      }

      // 2. Fetch Events
      const eventsRes = await apiClient.get('/api/v1/events/');
      const futureEvents = eventsRes.data.filter(evt => new Date(evt.event_date) >= new Date().setHours(0,0,0,0));
      setUpcomingEvents(futureEvents.sort((a,b) => new Date(a.event_date) - new Date(b.event_date)).slice(0, 3));

      // 3. Fetch Forum Activity
      const forumRes = await apiClient.get('/api/v1/forum/questions');
      setForumActivityCount(forumRes.data.length);

      // 4. Fetch Resources
      const materialsRes = await apiClient.get('/api/v1/materials/');
      const verifiedStudyMaterials = materialsRes.data.filter(file => 
        file.is_verified === true && file.tags !== 'Notice' && file.tags !== 'Syllabus'
      );
      setNewResourcesCount(verifiedStudyMaterials.length);

      // 5. NEW: Fetch My Study Stats using the backend endpoint
      const statsRes = await apiClient.get('/api/v1/study/my-stats');
      setStudyStats(statsRes.data);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventStyle = (description) => {
    if (description?.includes('Test')) return { bg: 'bg-red-100', text: 'text-red-600', icon: <BookOpen className="w-3.5 h-3.5" /> };
    if (description?.includes('Holiday')) return { bg: 'bg-green-100', text: 'text-green-600', icon: <Calendar className="w-3.5 h-3.5" /> };
    return { bg: 'bg-blue-100', text: 'text-blue-600', icon: <Flag className="w-3.5 h-3.5" /> };
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/dashboard/student/rooms/${roomCode.trim()}`);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  }

  // Format total study time nicely
  const hours = Math.floor(studyStats.total_study_minutes / 60);
  const minutes = studyStats.total_study_minutes % 60;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out relative max-w-7xl mx-auto">
      
      {/* Welcome Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome back, {userName}</h1>
          <p className="text-slate-500 mt-2 text-lg">Here is your academic overview for today.</p>
        </div>
        <div className="mt-4 sm:mt-0 text-sm font-bold text-indigo-700 bg-indigo-50 px-5 py-2.5 rounded-xl border border-indigo-100 flex items-center shadow-sm">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* NEW: Top Stats Grid with 4 Cards (Includes Gamified Study Time) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* NEW Study Time Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-md flex items-center text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><Timer className="w-32 h-32" /></div>
          <div className="p-4 bg-white/20 backdrop-blur-sm text-white rounded-xl mr-4"><Timer className="w-6 h-6" /></div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-indigo-100">Total Study Time</p>
            <p className="text-2xl font-bold">
              {hours > 0 ? `${hours}h ` : ''}{minutes}m
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center cursor-pointer hover:border-indigo-300 transition-all hover:shadow-md" onClick={() => navigate('/dashboard/student/schedule')}>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl mr-4"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Classes Today</p>
            <p className="text-2xl font-bold text-slate-800">{todaysClasses.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center cursor-pointer hover:border-teal-300 transition-all hover:shadow-md" onClick={() => navigate('/dashboard/student/discussions')}>
          <div className="p-4 bg-teal-50 text-teal-600 rounded-xl mr-4"><MessageSquare className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Doubts</p>
            <p className="text-2xl font-bold text-slate-800">{forumActivityCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center cursor-pointer hover:border-amber-300 transition-all hover:shadow-md" onClick={() => navigate('/dashboard/student/resources')}>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl mr-4"><BookOpen className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Verified Notes</p>
            <p className="text-2xl font-bold text-slate-800">{newResourcesCount}</p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timeline & Live Study Quick Join */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* NEW: Live Study Room Quick-Join Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-50 to-transparent"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Join a Study Room</h3>
                <p className="text-slate-500 text-sm">Collaborate in real-time and track your hours.</p>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} className="flex w-full sm:w-auto relative z-10">
              <input 
                type="text" 
                placeholder="Enter Room ID (e.g. sem4)" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full sm:w-48 p-3 rounded-l-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
              />
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-5 py-3 rounded-r-xl font-bold hover:bg-indigo-700 transition-colors flex items-center"
              >
                Join <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Today's Timetable</h3>
              <button onClick={() => navigate('/dashboard/student/schedule')} className="text-sm text-indigo-600 font-bold hover:underline flex items-center">
                View Full Week <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="space-y-4">
              {todaysClasses.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <div className="inline-block p-4 bg-green-100 text-green-600 rounded-full mb-3"><Flag className="w-6 h-6" /></div>
                  <p className="text-slate-600 font-bold">No classes scheduled for today.</p>
                  <p className="text-slate-400 text-sm">Perfect time to hit a study room!</p>
                </div>
              ) : (
                todaysClasses.map((cls, index) => (
                  <div key={cls.id || index} className="flex relative group">
                    {index !== todaysClasses.length - 1 && <div className="absolute left-6 top-10 bottom-[-16px] w-0.5 bg-slate-200 group-hover:bg-indigo-300 transition-colors"></div>}
                    
                    <div className="w-14 text-xs font-bold text-slate-400 pt-3 text-right pr-4 shrink-0">
                      {cls.time.split('-')[0].trim()}
                    </div>
                    
                    <div className="relative flex-1 bg-slate-50 hover:bg-indigo-50 transition-all border border-slate-100 hover:border-indigo-200 p-5 rounded-xl ml-2 shadow-sm">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${cls.type === 'Lab' ? 'bg-purple-500' : 'bg-indigo-500'}`}></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-base">{cls.subject}</h4>
                          <p className="text-sm text-slate-500 mt-1 font-medium">{cls.professor} • {cls.room}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                           <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider shadow-sm ${
                             cls.type === 'Lab' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                           }`}>
                             {cls.type}
                           </span>
                           <span className="text-xs font-bold text-slate-400 flex items-center bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                             <Clock className="w-3 h-3 mr-1 text-slate-500"/> {cls.time.split('-')[1]?.trim()}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Events & Notices */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" /> Upcoming Events
              </h3>
              <button onClick={() => navigate('/dashboard/student/schedule')} className="text-xs font-bold text-indigo-600 hover:underline bg-indigo-50 px-3 py-1.5 rounded-full">View All</button>
            </div>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center bg-slate-50 p-4 rounded-xl border border-slate-100">No upcoming events right now.</p>
              ) : (
                upcomingEvents.map(ev => {
                  const style = getEventStyle(ev.description);
                  return (
                    <div key={ev.id} className="flex items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-sm">
                      <div className={`p-2.5 rounded-xl mr-4 shrink-0 shadow-sm ${style.bg} ${style.text}`}>
                        {style.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{ev.title}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-1">{new Date(ev.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <DashboardNotices /> 
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
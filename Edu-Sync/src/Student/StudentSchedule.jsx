import React, { useState } from 'react';
import { Clock, MapPin, CalendarDays, BookOpen, Flag, Calendar as CalendarIcon } from 'lucide-react';

const StudentSchedule = () => {
  // Read-only schedule data (Managed by CR)
  const schedule = {
    Monday: [
      { id: 'm1', subject: 'Data Structures', time: '10:00 AM - 11:30 AM', room: 'Room 402', professor: 'Dr. Smith', type: 'Lecture' },
      { id: 'm2', subject: 'OS Lab', time: '02:00 PM - 05:00 PM', room: 'Lab 3', professor: 'Prof. Davis', type: 'Lab' }
    ],
    Tuesday: [
      { id: 't1', subject: 'Computer Networks', time: '10:00 AM - 11:30 AM', room: 'Room 405', professor: 'Dr. Wilson', type: 'Lecture' },
    ],
    Wednesday: [],
    Thursday: [
      { id: 'th1', subject: 'Operating Systems', time: '11:00 AM - 12:30 PM', room: 'Room 402', professor: 'Prof. Davis', type: 'Lecture' }
    ],
    Friday: [
      { id: 'f1', subject: 'Data Structures Lab', time: '10:00 AM - 01:00 PM', room: 'Lab 2', professor: 'Dr. Smith', type: 'Lab' }
    ]
  };

  const importantDates = [
    { id: 1, date: '2026-03-10', title: 'Data Structures Class Test', type: 'test' },
    { id: 2, date: '2026-03-25', title: 'Holi Holiday', type: 'holiday' },
    { id: 3, date: '2026-04-05', title: 'JU-Sync App Presentation', type: 'function' }
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <CalendarDays className="w-6 h-6 mr-3 text-indigo-600" /> My Timetable & Calendar
        </h2>
        <p className="text-slate-500 mt-1">View your weekly classes and upcoming important dates set by your CR.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Weekly Schedule */}
        <div className="xl:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                <div className="bg-indigo-50 border-b border-indigo-100 p-3 text-center">
                  <h3 className="font-bold text-sm text-indigo-900">{day}</h3>
                </div>
                <div className="p-3 flex-1 space-y-3">
                  {schedule[day].length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">No classes</div>
                  ) : (
                    schedule[day].map((cls) => (
                      <div key={cls.id} className="relative border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${cls.type === 'Lab' ? 'bg-purple-400' : 'bg-indigo-400'}`}></div>
                        <h4 className="font-bold text-slate-800 text-xs truncate" title={cls.subject}>{cls.subject}</h4>
                        <div className="space-y-1 mt-2 text-[10px] text-slate-500">
                          <div className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {cls.time.split('-')[0].trim()}</div>
                          <div className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {cls.room}</div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                           <span className="text-[9px] text-slate-400 font-medium">{cls.professor}</span>
                           <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${cls.type === 'Lab' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>{cls.type}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Dates */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Agenda</h3>
            <div className="space-y-4">
              {importantDates.map(ev => (
                <div key={ev.id} className="flex items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className={`p-2 rounded-full mr-3 shrink-0 ${
                    ev.type === 'test' ? 'bg-red-100 text-red-600' :
                    ev.type === 'holiday' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {ev.type === 'test' ? <BookOpen className="w-4 h-4" /> : ev.type === 'holiday' ? <CalendarIcon className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{ev.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedule;
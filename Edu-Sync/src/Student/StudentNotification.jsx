import React, { useState } from "react";
import {
  Search,
  Bell,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Clock,
  ShieldCheck,
} from "lucide-react";

const StudentNotifications = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Array of mock notifications with different types to test search
  const [notifications] = useState([
    {
      id: 1,
      title: "Urgent: Class Cancelled",
      message: "Tomorrow's Data Structures lab is cancelled.",
      sender: "Sarah J. (CR)",
      time: "2 hours ago",
      type: "urgent",
    },
    {
      id: 2,
      title: "Assignment Uploaded",
      message: "Dr. Smith uploaded the new assignment for OS.",
      sender: "System",
      time: "5 hours ago",
      type: "update",
    },
    {
      id: 3,
      title: "Upcoming Deadline",
      message: "Project Submission for CN lab is due tomorrow at 5 PM.",
      sender: "System",
      time: "1 day ago",
      type: "deadline",
    },
    {
      id: 4,
      title: "Doubt Forum Update",
      message: "Prof. Davis verified an answer on your C++ programming doubt.",
      sender: "Forum",
      time: "1 day ago",
      type: "forum",
    },
  ]);

  // --- ACTIVE SEARCH LOGIC ---
  const filteredNotifs = notifications.filter(
    (notif) =>
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.sender.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Helper function to pick icons based on notification type
  const getIcon = (type) => {
    switch (type) {
      case "urgent":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "update":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "deadline":
        return <Clock className="w-5 h-5 text-amber-600" />;
      case "forum":
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getIconBackground = (type) => {
    switch (type) {
      case "urgent":
        return "bg-red-100";
      case "update":
        return "bg-green-100";
      case "deadline":
        return "bg-amber-100";
      case "forum":
        return "bg-blue-100";
      default:
        return "bg-indigo-100";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center mb-4 sm:mb-0">
          <Bell className="w-6 h-6 mr-3 text-indigo-600" /> Notifications
        </h2>

        {/* Active Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-10">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              No notifications found.
            </p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className="p-4 border-b border-slate-100 last:border-0 flex items-start hover:bg-slate-50 transition-colors"
            >
              <div
                className={`${getIconBackground(notif.type)} p-3 rounded-full mr-4 shrink-0`}
              >
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 text-sm md:text-base">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2 shrink-0">
                    {notif.time}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                <span className="text-xs font-medium text-slate-500 mt-2 block">
                  From: {notif.sender}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;

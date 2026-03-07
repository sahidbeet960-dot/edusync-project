import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Bell,
  BookOpen,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Megaphone,
  X,
  Send,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardNotices from "../Component/DashboardNotices";
import apiClient from "../Services/Api";
import { jwtDecode } from "jwt-decode";

const CRHome = () => {
  const navigate = useNavigate();


  const [userName, setUserName] = useState("CR");
  const [isLoading, setIsLoading] = useState(true);

  const [todaysClasses, setTodaysClasses] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [unansweredDoubts, setUnansweredDoubts] = useState(0);


  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState(""); // NEW
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: "",
    title: "",
    type: "Test",
  });

  useEffect(() => {
    const token = localStorage.getItem("edusync_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.name) setUserName(decoded.name);
      } catch (e) {
        console.error("Invalid token");
      }
    }

    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    setIsLoading(true);
    try {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const todayStr = days[new Date().getDay()];

      const scheduleRes = await apiClient.get("/api/v1/schedule/weekly");
      if (scheduleRes.data && scheduleRes.data[todayStr]) {
        setTodaysClasses(scheduleRes.data[todayStr]);
      } else {
        setTodaysClasses([]);
      }

    
      const eventsRes = await apiClient.get("/api/v1/events/");

      const futureEvents = eventsRes.data.filter(
        (evt) => new Date(evt.event_date) >= new Date().setHours(0, 0, 0, 0),
      );
      setUpcomingEvents(
        futureEvents.sort(
          (a, b) => new Date(a.event_date) - new Date(b.event_date),
        ),
      );

      const forumRes = await apiClient.get("/api/v1/forum/questions");
      const doubtsWithoutAnswers = forumRes.data.filter(
        (q) => !q.answers || q.answers.length === 0,
      ).length;
      setUnansweredDoubts(doubtsWithoutAnswers);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim() || !broadcastTitle.trim()) return;

    try {
   
      const fileBlob = new Blob([broadcastMessage], { type: "text/plain" });
      const generatedFile = new File([fileBlob], "cr_broadcast.txt", {
        type: "text/plain",
      });

     
      const formData = new FormData();
      formData.append("title", `[CR Broadcast] ${broadcastTitle}`);
      formData.append("description", broadcastMessage);
      formData.append("semester", "1");
      formData.append("tags", "Notice");
      formData.append("file", generatedFile);

      const uploadResponse = await apiClient.post(
        "/api/v1/materials/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

  
      const materialId =
        uploadResponse.data?.material?.id || uploadResponse.data?.id;
      if (materialId) {
        try {
          await apiClient.patch(`/api/v1/materials/${materialId}/verify`);
          alert(
            "Broadcast Sent! It is now visible in the Official Notices section.",
          );
        } catch (verifyError) {
          alert(
            "Broadcast submitted! It is awaiting Professor approval to appear in Notices.",
          );
        }
      }

 
      setBroadcastTitle("");
      setBroadcastMessage("");
      setIsBroadcastModalOpen(false);
    } catch (error) {
      console.error("Broadcast error:", error);
      alert(error.response?.data?.detail || "Failed to send broadcast.");
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.date || !newEvent.title) return;
    setIsSubmittingEvent(true);

    try {
      const formattedDate = new Date(newEvent.date).toISOString();
      await apiClient.post("/api/v1/events/", {
        title: newEvent.title,
        event_date: formattedDate,
        description: `Type: ${newEvent.type}`,
        location: "",
      });

      setNewEvent({ date: "", title: "", type: "Test" });
      fetchAllDashboardData(); 
    } catch (error) {
      console.error("Event error:", error);
      alert("Failed to create event.");
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("Delete this event?")) {
      try {
        await apiClient.delete(`/api/v1/events/${id}`);
        setUpcomingEvents(upcomingEvents.filter((ev) => ev.id !== id));
      } catch (error) {
        alert("Failed to delete event.");
      }
    }
  };

  const getEventColor = (description) => {
    if (description?.includes("Test"))
      return "bg-red-100 text-red-700 border-red-200";
    if (description?.includes("Holiday"))
      return "bg-green-100 text-green-700 border-green-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out relative">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {userName}
          </h1>
          <p className="text-slate-500 mt-1">
            Here is the overview for your batch today.
          </p>
        </div>

        <button
          onClick={() => setIsCalendarModalOpen(true)}
          className="mt-4 sm:mt-0 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors px-4 py-2 rounded-lg border border-teal-200 flex items-center shadow-sm"
        >
          <Calendar className="w-4 h-4 mr-2" /> Manage Important Dates
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-teal-50 text-teal-600 rounded-xl mr-4">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Classes Today</p>
            <p className="text-2xl font-bold text-slate-800">
              {todaysClasses.length}
            </p>
          </div>
        </div>
        <div
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => navigate("/dashboard/cr/discussions")}
        >
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl mr-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Unanswered Doubts
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {unansweredDoubts}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl mr-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Upcoming Events
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {upcomingEvents.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                Today's Schedule
              </h3>
              <button
                onClick={() => navigate("/dashboard/cr/schedule")}
                className="text-sm text-teal-600 font-medium hover:underline flex items-center"
              >
                Edit Weekly Schedule <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="space-y-4">
              {todaysClasses.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No classes scheduled for today! 🎉
                </p>
              ) : (
                todaysClasses.map((cls, index) => (
                  <div key={cls.id || index} className="flex relative">
                    {index !== todaysClasses.length - 1 && (
                      <div className="absolute left-6 top-10 bottom-[-16px] w-0.5 bg-slate-100"></div>
                    )}
                    <div className="w-12 text-xs font-bold text-slate-400 pt-3 text-right pr-4 shrink-0">
                      {cls.time.split("-")[0].trim()}
                    </div>
                    <div className="relative flex-1 bg-slate-50 hover:bg-teal-50/50 transition-colors border border-slate-100 p-4 rounded-xl ml-2">
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${cls.type === "Lab" ? "bg-purple-400" : "bg-teal-400"}`}
                      ></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800">
                            {cls.subject}
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">
                            {cls.professor} • {cls.room}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                            cls.type === "Lab"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {cls.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Notices & Quick Actions */}
        <div className="space-y-6">
          {/* CR Quick Links */}
          <div className="bg-[#00605B] rounded-2xl shadow-sm p-6 text-white">
            <h3 className="text-teal-100 text-sm font-medium mb-4 uppercase tracking-wider">
              CR Controls
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/dashboard/cr/schedule")}
                className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              >
                <span className="font-medium text-sm">Reschedule Class</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              >
                <span className="font-medium text-sm">
                  Broadcast Message to Batch
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Official Notices */}
          <div className="space-y-6">
            <DashboardNotices />
          </div>
        </div>
      </div>

      {/* --- BROADCAST MODAL UI --- */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-teal-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <Megaphone className="w-5 h-5 mr-2 text-teal-600" />
                Broadcast to Batch
              </h3>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="p-6 space-y-4">
              <p className="text-sm text-slate-500 mb-2">
                This message will be sent as a Notice to all students in your
                batch.
              </p>

              <div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 text-slate-800 font-bold mb-3"
                  placeholder="Broadcast Title (e.g., Lab Cancellation)"
                />
                <textarea
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 min-h-[120px] resize-y bg-slate-50 text-slate-800 text-sm"
                  placeholder="Type your detailed message here..."
                ></textarea>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!broadcastMessage.trim() || !broadcastTitle.trim()}
                  className={`flex-1 py-2.5 font-medium rounded-lg transition-colors flex justify-center items-center shadow-sm ${broadcastMessage.trim() && broadcastTitle.trim() ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                >
                  <Send className="w-4 h-4 mr-2" /> Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CALENDAR EVENTS MODAL UI --- */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-teal-600" /> Important
                  Dates
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Manage tests, holidays, and events.
                </p>
              </div>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-800 mb-3">
                Upcoming Agenda
              </h4>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-teal-300 transition-colors"
                  >
                    <div>
                      <h5 className="font-bold text-slate-800">
                        {event.title}
                      </h5>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {new Date(event.event_date).toLocaleDateString(
                          "en-US",
                          { weekday: "short", month: "long", day: "numeric" },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${getEventColor(event.description)}`}
                      >
                        {event.description?.includes("Type:")
                          ? event.description.split("Type: ")[1]
                          : "Event"}
                      </span>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4 italic">
                    No upcoming events scheduled.
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-white shrink-0">
              <h4 className="text-sm font-bold text-slate-800 mb-3">
                Add New Date
              </h4>
              <form
                onSubmit={handleAddEvent}
                className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3"
              >
                <input
                  type="date"
                  required
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
                />
                <input
                  type="text"
                  required
                  placeholder="Event Name..."
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
                <select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, type: e.target.value })
                  }
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white w-24"
                >
                  <option value="Test">Test</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Event">Event</option>
                </select>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center shadow-sm disabled:opacity-70"
                >
                  {isSubmittingEvent ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRHome;

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Clock,
  MessageSquare,
  Plus,
  Send,
  X,
  Target,
  Loader2,
  Award,
  Zap,
  LogIn,
} from "lucide-react";
import apiClient from "../Services/Api";

const WS_BASE_URL =
  "wss://edusync-backend-production-204a.up.railway.app/api/v1/rooms/ws";

const formatTime = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (num) => num.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const formatHours = (totalSeconds) => {
  if (!totalSeconds) return "0";
  return (totalSeconds / 3600).toFixed(1);
};

const formatRoomId = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

const StudyRoom = () => {
  // STATE MANAGEMENT

  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState("lobby");

  const [myStats, setMyStats] = useState(null);
  const [activeRooms, setActiveRooms] = useState([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  const [createRoomName, setCreateRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const [currentRoomId, setCurrentRoomId] = useState("");
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [participants, setParticipants] = useState({});
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [nowTimestamp, setNowTimestamp] = useState(
    Math.floor(Date.now() / 1000),
  );
  const sessionStartTimeRef = useRef(0);

  const wsRef = useRef(null);
  const chatEndRef = useRef(null);

  // ==========================================
  // 1. FETCH DATA & AUTO-RECONNECT
  // ==========================================
  useEffect(() => {
    fetchDashboardData();

    const ticker = setInterval(() => {
      setNowTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => {
      clearInterval(ticker);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      // 1. Fetch Profile
      const profileRes = await apiClient.get("/api/v1/users/me/profile");
      const fetchedUser = {
        id: profileRes.data.id,
        name: profileRes.data.full_name || profileRes.data.email.split("@")[0],
      };
      setCurrentUser(fetchedUser);

      // 2. Fetch Stats & Rooms
      const statsRes = await apiClient.get("/api/v1/study/my-stats");
      setMyStats(statsRes.data);

      try {
        const roomsRes = await apiClient.get("/api/v1/study/rooms");
        setActiveRooms(roomsRes.data || []);
      } catch (e) {
        console.warn("Active rooms endpoint not available yet.");
      }

      const savedRoomId = sessionStorage.getItem("edusync_active_room_id");
      const savedRoomName = sessionStorage.getItem("edusync_active_room_name");

      if (savedRoomId) {
        connectToRoom(savedRoomId, savedRoomName, fetchedUser);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connectToRoom = (roomId, displayName, userOverride = null) => {
    const activeUser = userOverride || currentUser;
    if (!activeUser) return alert("Profile not loaded yet. Please wait.");

    const safeRoomId = formatRoomId(roomId);

    // Save to browser memory so we survive a refresh
    sessionStorage.setItem("edusync_active_room_id", safeRoomId);
    sessionStorage.setItem(
      "edusync_active_room_name",
      displayName || safeRoomId,
    );

    const wsUrl = `${WS_BASE_URL}/${safeRoomId}?username=${encodeURIComponent(activeUser.name)}&user_id=${activeUser.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setCurrentRoomId(safeRoomId);
      setCurrentRoomName(displayName || safeRoomId);
      setCurrentView("inside");
      setMessages([]);
      setParticipants({});
      sessionStartTimeRef.current = Math.floor(Date.now() / 1000);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📥 Received WS Data:", data);

      if (data.type === "room_state") {
        setParticipants(data.users);
      } else if (data.type === "system") {
        if (data.action === "join") {
          setParticipants((prev) => ({
            ...prev,
            [data.username]: {
              join_time: data.join_time,
              today_base: data.today_base,
            },
          }));
        } else if (data.action === "leave") {
          setParticipants((prev) => {
            const updated = { ...prev };
            delete updated[data.username];
            return updated;
          });
        }
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            isSystem: true,
            text: `${data.username} ${data.message}`,
          },
        ]);
      } else if (data.type === "chat") {
        setMessages((prev) => {
          const alreadyExists = prev.some((msg) => msg.id === data.msg_id);
          if (alreadyExists) return prev;
          const chatText = data.content || data.message || data.text || "";
          return [
            ...prev,
            {
              id: data.msg_id || Date.now(),
              username: data.username || "Unknown",
              text: chatText,
            },
          ];
        });
      }
    };

    ws.onerror = () => {
      alert("Failed to connect to the live room. Check your connection.");
      // If connection fails, clear the memory so they aren't stuck in a broken loop
      sessionStorage.removeItem("edusync_active_room_id");
      sessionStorage.removeItem("edusync_active_room_name");
    };

    ws.onclose = () => {
      // We only go back to lobby if the socket closes.
      // A refresh destroys the whole page, so it skips this!
      setCurrentView("lobby");
      setCurrentRoomId("");
      fetchDashboardData();
    };

    wsRef.current = ws;
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!createRoomName.trim()) return;
    connectToRoom(createRoomName, createRoomName);
  };

  const handleManualJoin = (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;
    connectToRoom(joinRoomId, joinRoomId);
  };

  // 3. LEAVING ROOM (Explicitly choosing to leave)

  const handleLeaveRoom = async () => {
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const sessionDurationSeconds =
      currentUnixTime - sessionStartTimeRef.current;

    // Remove the sticky note! The user actually wants to leave.
    sessionStorage.removeItem("edusync_active_room_id");
    sessionStorage.removeItem("edusync_active_room_name");

    if (wsRef.current) wsRef.current.close();
    setCurrentView("lobby");
    setCurrentRoomId("");

    if (sessionDurationSeconds > 10) {
      try {
        await apiClient.post("/api/v1/study/sessions", {
          duration_seconds: sessionDurationSeconds,
          room_id: currentRoomId,
        });
      } catch (error) {
        console.error("Failed to save study session", error);
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !wsRef.current) return;

    const uniqueMsgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const textToSend = chatInput.trim();

    const myMessage = {
      id: uniqueMsgId,
      username: currentUser.name,
      text: textToSend,
    };
    setMessages((prev) => [...prev, myMessage]);

    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        msg_id: uniqueMsgId,
        content: textToSend,
        message: textToSend,
        text: textToSend,
      }),
    );

    setChatInput("");
  };

  // ==========================================
  // RENDER SECTIONS
  // ==========================================
  const LobbyView = () => (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 relative">
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" /> Welcome back,{" "}
            {currentUser?.name || "Scholar"}!
          </h2>
          <p className="text-indigo-200 mt-1 text-sm">
            Your study profile is loaded. Keep up the great work.
          </p>
        </div>

        <div className="flex gap-4 sm:gap-8 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
          <div className="text-center">
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
              Total Hours
            </p>
            <p className="text-3xl font-bold text-white">
              {isLoadingDashboard ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                formatHours(myStats?.total_seconds || 0)
              )}
            </p>
          </div>
          <div className="w-px bg-white/20"></div>
          <div className="text-center">
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
              Today's Focus
            </p>
            <p className="text-3xl font-bold text-white flex items-center justify-center gap-1">
              {isLoadingDashboard ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-400" />{" "}
                  {formatHours(myStats?.today_seconds || 0)}{" "}
                  <span className="text-lg">h</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <form
            onSubmit={handleCreateRoom}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">
                Create New Room
              </h3>
            </div>
            <input
              type="text"
              required
              value={createRoomName}
              onChange={(e) => setCreateRoomName(e.target.value)}
              placeholder="e.g., Python Bootcamp"
              className="w-full h-12 border border-slate-200 rounded-xl px-4 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 mb-4"
            />
            <button
              type="submit"
              className="w-full h-11 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Start Room
            </button>
          </form>

          <form
            onSubmit={handleManualJoin}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <LogIn className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Join by ID</h3>
            </div>
            <input
              type="text"
              required
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="e.g., python-bootcamp"
              className="w-full h-12 border border-slate-200 rounded-xl px-4 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 mb-4 lowercase font-mono text-sm"
            />
            <button
              type="submit"
              className="w-full h-11 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Join Room
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
              Live Rooms
            </h3>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {activeRooms.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {isLoadingDashboard ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : activeRooms.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  No live rooms right now.
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Be the first to create one on the left!
                </p>
              </div>
            ) : (
              activeRooms.map((room) => (
                <div
                  key={room.id}
                  className="border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:border-indigo-300 hover:shadow-md transition-all group bg-slate-50"
                >
                  <div className="mb-4 sm:mb-0">
                    <h4 className="font-bold text-lg text-slate-900">
                      {room.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      ID: {room.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      <Users className="w-4 h-4 text-indigo-500" />{" "}
                      {room.participant_count || 1}
                    </span>
                    <button
                      onClick={() => connectToRoom(room.id, room.name)}
                      className="bg-indigo-100 text-indigo-700 font-bold px-5 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const InsideRoomView = () => (
    <div className="h-[90vh] grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col h-full xl:col-span-1 shadow-sm">
        <div className="flex justify-between items-center pb-5 mb-5 border-b border-slate-100">
          <button
            onClick={handleLeaveRoom}
            className="p-2.5 bg-rose-50 rounded-xl text-rose-700 hover:bg-rose-100 font-bold text-sm flex items-center transition-colors"
          >
            <X className="w-4 h-4 mr-1" /> Leave & Save
          </button>
          <div className="text-right">
            <h3 className="font-bold text-slate-900 text-lg truncate max-w-[150px]">
              {currentRoomName}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              #{currentRoomId}
            </span>
          </div>
        </div>

        <h4 className="flex items-center gap-2 font-bold text-slate-900 mb-5">
          <Users className="w-5 h-5 text-indigo-600" /> Active Students (
          {Object.keys(participants).length})
        </h4>

        <div className="flex-1 space-y-3 overflow-y-auto pr-2 pb-5 scrollbar-thin">
          {Object.entries(participants).map(([username, data]) => {
            const isSelf = username === currentUser?.name;
            const elapsedSinceJoin = Math.max(0, nowTimestamp - data.join_time);
            const totalSecondsToday = data.today_base + elapsedSinceJoin;

            return (
              <div
                key={username}
                className={`flex items-center gap-3 p-3 rounded-xl border ${isSelf ? "border-indigo-200 bg-indigo-50 shadow-sm" : "border-slate-100 bg-slate-50"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isSelf ? "bg-indigo-600" : "bg-slate-400"}`}
                >
                  {username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-bold text-sm ${isSelf ? "text-indigo-900" : "text-slate-800"} truncate max-w-[100px]`}
                  >
                    {username} {isSelf && "(You)"}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm shrink-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-500" /> Today
                  </p>
                  <p
                    className={`font-mono text-sm font-bold leading-none ${isSelf ? "text-indigo-700" : "text-slate-800"}`}
                  >
                    {formatTime(totalSecondsToday)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl flex flex-col h-full xl:col-span-2 shadow-xl shadow-slate-900/10">
        <div className="p-6 pb-4 flex items-center gap-3 border-b border-slate-800">
          <MessageSquare className="w-6 h-6 text-indigo-400" />
          <h3 className="text-xl font-bold text-white">Room Chat</h3>
        </div>

        <div className="flex-1 p-6 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {messages.length === 0 && (
            <div className="text-center py-10 text-slate-600 text-sm font-medium">
              Welcome to {currentRoomName}! Say hello to your peers.
            </div>
          )}

          {messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isSelf = msg.username === currentUser?.name;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isSelf ? "justify-end" : "justify-start"}`}
              >
                {!isSelf && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                    {msg.username[0].toUpperCase()}
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isSelf ? "rounded-br-sm bg-indigo-600 text-white" : "rounded-bl-sm bg-slate-800 text-slate-200"}`}
                >
                  {!isSelf && (
                    <p className="font-bold text-[10px] uppercase tracking-wide mb-1 text-indigo-300">
                      {msg.username}
                    </p>
                  )}
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef}></div>
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-slate-950 rounded-b-3xl"
        >
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full h-12 bg-slate-800 text-white rounded-xl pl-4 pr-14 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="absolute right-1.5 top-1.5 h-9 w-9 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      {currentView === "lobby" ? LobbyView() : InsideRoomView()}
    </div>
  );
};

export default StudyRoom;

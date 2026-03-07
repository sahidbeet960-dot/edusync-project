import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Loader2, LogOut } from "lucide-react";
import apiClient from "../services/api";

const SharedHeader = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/api/v1/users/me/profile");
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const getBasePath = () => {
    if (!userProfile) return "/dashboard/student";
    if (userProfile.role === "PROFESSOR") return "/dashboard/professor";
    if (userProfile.role === "CR") return "/dashboard/cr";
    return "/dashboard/student";
  };

  const basePath = getBasePath();

  const formatRole = (role) => {
    if (!role) return "Student";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // NEW: Secure Logout Function
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("edusync_token"); // Clear the JWT
      navigate("/login"); // Kick back to login page
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-10 z-20 relative shrink-0">
      <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
        {isLoading ? (
          <span className="flex items-center text-slate-400 text-base">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...
          </span>
        ) : (
          `${formatRole(userProfile?.role)} Portal`
        )}
      </h2>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Global Search */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 transition-all"
          />
        </div>

        {/* Dynamic Notification Routing */}
        <button
          onClick={() => navigate(`${basePath}/notifications`)}
          className="text-slate-500 hover:text-indigo-600 relative p-2 rounded-full hover:bg-indigo-50 transition-colors hidden sm:block"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Dynamic Profile Routing */}
        <div
          onClick={() => navigate(`${basePath}/profile`)}
          className="flex items-center sm:pl-4 sm:border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1.5 sm:p-2 rounded-lg transition-colors ml-1 sm:ml-2"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
              <div className="hidden sm:block space-y-1">
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-2 w-10 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm sm:mr-2 border border-indigo-200 shadow-sm uppercase shrink-0">
                {(userProfile?.full_name || "U").charAt(0)}
              </div>

              <div className="hidden sm:block">
                <span className="block font-bold text-sm text-slate-800 leading-tight">
                  {userProfile?.full_name || "User"}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium uppercase tracking-wider truncate max-w-[120px]">
                  {userProfile?.department || formatRole(userProfile?.role)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* NEW: Logout Button */}
        <button
          onClick={handleLogout}
          title="Log out"
          className="flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors sm:pl-4 sm:border-l border-slate-200 ml-1 sm:ml-2"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default SharedHeader;

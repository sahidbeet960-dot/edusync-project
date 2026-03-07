import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Loader2 } from "lucide-react";
import apiClient from "../services/api";

const SharedHeader = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getProfilePicUrl = () => {
    if (!userProfile) return "";

    switch (userProfile.role) {
      case "PROFESSOR":
        return "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
      case "CR":
        return "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
      case "STUDENT":
      default:
        return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/api/v1/users/me/profile");
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("edusync_token");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const getBasePath = () => {
    if (!userProfile) return "";
    if (userProfile.role === "PROFESSOR") return "/dashboard/professor";
    if (userProfile.role === "CR") return "/dashboard/cr";
    return "/dashboard/student";
  };

  const basePath = getBasePath();
  const profilePicUrl = getProfilePicUrl();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-20 relative">
      <h2 className="text-xl font-semibold text-slate-800">
        {isLoading
          ? "Loading..."
          : `${userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1).toLowerCase() : ""} Dashboard`}
      </h2>

      <div className="flex items-center space-x-4">
        <div className="relative hidden sm:block w-64">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-slate-50"
          />
        </div>

        <button
          onClick={() => navigate(`${basePath}/notifications`)}
          className="text-slate-500 hover:text-slate-700 relative p-2 rounded-full hover:bg-slate-100 transition-all"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div
          onClick={() => navigate(`${basePath}/profile`)}
          className="flex items-center pl-4 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          ) : (
            <>
              <img
                src={profilePicUrl}
                alt={`${userProfile?.role} Profile`}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm mr-2"
              />
              <div className="hidden sm:block">
                <span className="block font-medium text-sm text-slate-700 leading-tight">
                  {userProfile?.full_name}
                </span>
                <span className="block text-xs text-slate-500">
                  {userProfile?.role}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default SharedHeader;

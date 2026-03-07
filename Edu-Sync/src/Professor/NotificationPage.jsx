import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import apiClient from "../services/api";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get("/api/v1/notifications");
        // till now no backend endpoint for this so it is not working
        setNotifications(response.data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Unable to load notifications. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "DOUBT":
        return <MessageSquare className="w-5 h-5" />;
      case "SUBMISSION":
      case "MATERIAL_UPLOAD":
        return <FileText className="w-5 h-5" />;
      case "SYSTEM":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-500">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <Bell className="w-6 h-6 mr-3 text-blue-600" /> All Notifications
      </h2>

      {notifications.length === 0 ? (
        <div className="text-center p-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
          You're all caught up! No new notifications.
        </div>
      ) : (
        notifications.map((n) => (
          <Link
            key={n.id}
            to={n.link || "#"}
            className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 transition-colors group"
          >
            <div className="p-3 bg-slate-100 rounded-full text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 shrink-0">
              {getIcon(n.type)}
            </div>

            <div className="ml-4 flex-1 min-w-0">
              <p className="text-slate-800 font-medium truncate">{n.text}</p>
              <span className="text-xs text-slate-500">
                {n.createdAt ? formatDate(n.createdAt) : n.time}
              </span>
            </div>

            <div className="hidden sm:block text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-4 text-sm font-medium">
              View Details
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default NotificationsPage;

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  CheckCircle,
  Trash2,
  ExternalLink,
  Loader2,
  FileText,
} from "lucide-react";
import apiClient from "../services/api";

const pendingApprovals = () => {
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingMaterials();
  }, []);

  // fetching all the pending materials

  const fetchPendingMaterials = async () => {
    try {
      const response = await apiClient.get("/api/v1/materials/");
      const unverified = response.data.filter(
        (file) => file.is_verified === false,
      );
      setPendingMaterials(unverified);
    } catch (error) {
      console.error("Error fetching pending materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // approve the pending materials

  const handleApprove = async (id) => {
    try {
      await apiClient.patch(`/api/v1/materials/${id}/verify`);
      setPendingMaterials((prev) => prev.filter((file) => file.id !== id));
      alert("Material Approved! It is now visible in the Subject Folders.");
    } catch (error) {
      alert("Failed to approve material.");
    }
  };

  // delete the unverified material

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this unverified material?",
    );
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/api/v1/materials/${id}`);
      setPendingMaterials((prev) => prev.filter((file) => file.id !== id));
    } catch (error) {
      alert("Failed to delete material.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 text-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    );
  }

  if (pendingMaterials.length === 0) {
    return null;
  }

  // User interface for verification process

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden mb-8">
      <div className="bg-amber-50 px-6 py-4 border-b border-amber-200 flex items-center justify-between">
        <h3 className="font-bold text-amber-900 flex items-center">
          <ShieldAlert className="w-5 h-5 mr-2 text-amber-600" />
          Pending Resource Approvals
        </h3>
        <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
          {pendingMaterials.length} Action Required
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {pendingMaterials.map((file) => (
          <div
            key={file.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start flex-1 mb-4 sm:mb-0">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500 mr-4 shrink-0 mt-1">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {file.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 max-w-md line-clamp-1">
                  {file.description}
                </p>
                <div className="flex items-center text-[10px] text-slate-400 mt-2 space-x-3">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                    Folder: {file.tags || "General"}
                  </span>
                  <span>Sem {file.semester}</span>
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    Review File <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 sm:ml-4">
              <button
                onClick={() => handleDelete(file.id)}
                className="px-3 py-1.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Reject
              </button>
              <button
                onClick={() => handleApprove(file.id)}
                className="px-4 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-xs font-bold flex items-center transition-colors shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

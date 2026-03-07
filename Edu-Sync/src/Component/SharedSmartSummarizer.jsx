import React, { useState } from "react";
import {
  FileText,
  Loader2,
  Copy,
  CheckCircle,
  UploadCloud,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";


const AI_BASE_URL = "https://edusync-ai-service.onrender.com";

const SharedSmartSummarizer = () => {
  
  const [inputType, setInputType] = useState("file"); // 'file' or 'url'
  const [docUrl, setDocUrl] = useState("");
  const [file, setFile] = useState(null);

  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    setError("");
    setSummary("");

    if (inputType === "url" && !docUrl.trim()) {
      return setError("Please enter a valid document URL.");
    }
    if (inputType === "file" && !file) {
      return setError("Please select a file to upload.");
    }

    setLoading(true);
    try {
      let finalDocumentId = docUrl; 
      if (inputType === "file") {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch(
          `${AI_BASE_URL}/summary/summary/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!uploadResponse.ok) throw new Error("File upload failed.");

        const uploadData = await uploadResponse.json();
        console.log("Upload Step 1 Success:", uploadData);
        if (uploadData.document_id) {
          finalDocumentId = uploadData.document_id;
        } else {
          throw new Error("Backend did not return a document_id.");
        }
      }
      const summaryResponse = await fetch(`${AI_BASE_URL}/summary/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: finalDocumentId }),
      });

      if (!summaryResponse.ok) throw new Error("Failed to generate summary.");

      const data = await summaryResponse.json();
      console.log("AI Summary Step 2 Success:", data);

      // Safely extract the summary text
      if (typeof data === "string") {
        setSummary(data);
      } else if (data && typeof data === "object") {
        setSummary(
          data.summary ||
            data.text ||
            data.response ||
            "No summary text found in response.",
        );
      } else {
        setSummary("No summary was generated.");
      }
    } catch (error) {
      console.error("Summarization process failed:", error);
      setError(
        error.message ||
          "Failed to connect to the AI service. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white">
          <h2 className="text-3xl font-bold flex items-center mb-2">
            <FileText className="w-8 h-8 mr-3 text-indigo-200" /> Smart
            Summarizer
          </h2>
          <p className="text-indigo-100 font-medium">
            Upload a document or paste a link to extract the key concepts
            instantly.
          </p>
        </div>

        <div className="p-8">
          {/* Input Type Toggles */}
          <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-xl w-full max-w-md mb-8">
            <button
              onClick={() => setInputType("file")}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${
                inputType === "file"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <UploadCloud className="w-4 h-4 mr-2" /> Upload File
            </button>
            <button
              onClick={() => setInputType("url")}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${
                inputType === "url"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LinkIcon className="w-4 h-4 mr-2" /> Paste URL
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center text-sm font-bold">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {error}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSummarize} className="space-y-6">
            {inputType === "file" ? (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.docx,.doc"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <span className="text-slate-700 font-bold mb-1">
                    {file ? file.name : "Click to select a document"}
                  </span>
                  <span className="text-slate-500 text-sm">
                    {file ? "Ready to summarize" : "Supports PDF, TXT, DOCX"}
                  </span>
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Document URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/lecture-notes.pdf"
                  className="w-full h-14 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
              ) : (
                <SparklesIcon />
              )}
              {loading ? "Analyzing Document..." : "Generate Summary"}
            </button>
          </form>

          {/* Results Area */}
          {summary && !loading && (
            <div className="mt-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">
                  Key Takeaways
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg flex items-center text-sm font-bold transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? "Copied to Clipboard!" : "Copy Text"}
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200 shadow-inner">
                <p className="text-slate-700 leading-loose whitespace-pre-wrap font-medium">
                  {summary}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mr-2"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

export default SharedSmartSummarizer;

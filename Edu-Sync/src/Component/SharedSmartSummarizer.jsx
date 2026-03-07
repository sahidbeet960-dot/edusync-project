import React, { useState } from "react";
import { FileText, Loader2, Copy, CheckCircle } from "lucide-react";

const SharedSmartSummarizer = () => {
  const [docUrl, setDocUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!docUrl) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://edusync-ai-latest.onrender.com/generate-summary",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: docUrl }),
        },
      );

      const data = await response.json();
      // Assuming the API returns { summary: "..." }
      setSummary(data.summary || "No summary was generated.");
    } catch (error) {
      console.error("Summarization failed:", error);
      alert("Failed to connect to the AI service. Check the console.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center">
            <FileText className="w-6 h-6 mr-3" /> Smart Summarizer
          </h2>
          <p className="text-indigo-100 mt-1 text-sm">
            Paste a PDF/Doc link to get a concise summary of the key concepts.
          </p>
        </div>

        <div className="p-6">
          {/* Input Form */}
          <form onSubmit={handleSummarize} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Document URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  placeholder="https://example.com/lecture-notes.pdf"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-400 transition-colors flex items-center"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Processing..." : "Summarize"}
                </button>
              </div>
            </div>
          </form>

          {/* Results Area */}
          {summary && (
            <div className="mt-8 border-t border-slate-100 pt-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Generated Summary</h3>
                <button
                  onClick={copyToClipboard}
                  className="text-slate-500 hover:text-indigo-600 flex items-center text-sm font-medium transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copied ? "Copied!" : "Copy Summary"}
                </button>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedSmartSummarizer;

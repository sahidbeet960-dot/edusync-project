import React, { useState } from "react";
import { Image as ImageIcon, Loader2, Download } from "lucide-react";

const SharedInfographicMaker = () => {
  const [docUrl, setDocUrl] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!docUrl) return;

    setLoading(true);
    setImageBase64("");

    try {
      const response = await fetch(
        "https://edusync-ai-latest.onrender.com/generate-infographic",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: docUrl }),
        },
      );

      const data = await response.json();

      // Ensure the string has the data URI prefix so the browser knows it's an image
      let base64String = data.image || data.infographic || data;
      if (
        typeof base64String === "string" &&
        !base64String.startsWith("data:image")
      ) {
        base64String = `data:image/png;base64,${base64String}`;
      }

      setImageBase64(base64String);
    } catch (error) {
      console.error("Infographic generation failed:", error);
      alert("Failed to generate infographic.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-fuchsia-600 p-6 text-white shrink-0">
          <h2 className="text-2xl font-bold flex items-center">
            <ImageIcon className="w-6 h-6 mr-3" /> Infographic Maker
          </h2>
          <p className="text-fuchsia-100 mt-1 text-sm">
            Convert complex documents into visual, cartoon-style layouts.
          </p>
        </div>

        <div className="p-6 border-b border-slate-100">
          <form
            onSubmit={handleGenerate}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Document URL
              </label>
              <input
                type="url"
                required
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-fuchsia-500 bg-slate-50"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-[46px] bg-fuchsia-600 text-white px-8 rounded-xl font-bold hover:bg-fuchsia-700 disabled:opacity-70 flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ImageIcon className="w-5 h-5 mr-2" />
                )}
                Generate Image
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        <div className="p-6 bg-slate-50 flex-1 flex flex-col items-center justify-center min-h-[400px]">
          {loading && (
            <div className="text-center text-slate-400 animate-pulse">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-fuchsia-500" />
              <p className="font-medium text-sm">
                Analyzing text and drawing graphics...
              </p>
              <p className="text-xs">This might take up to a minute.</p>
            </div>
          )}

          {!loading && !imageBase64 && (
            <div className="text-center text-slate-300">
              <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">
                Your infographic will appear here
              </p>
            </div>
          )}

          {!loading && imageBase64 && (
            <div className="w-full animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">
                  Generated Infographic
                </h3>
                <a
                  href={imageBase64}
                  download="edusync-infographic.png"
                  className="flex items-center text-sm font-bold text-fuchsia-600 bg-fuchsia-50 px-3 py-1.5 rounded-lg hover:bg-fuchsia-100 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1.5" /> Download
                </a>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                <img
                  src={imageBase64}
                  alt="AI Generated Infographic"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedInfographicMaker;

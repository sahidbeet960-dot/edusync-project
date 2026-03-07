import React, { useState } from "react";
import {
  Loader2,
  UploadCloud,
  PieChart,
  Grid,
  AlertCircle,
  FileText,
} from "lucide-react";

const AI_BASE_URL = "https://edusync-ai-service.onrender.com";

const SharedInfographicMaker = () => {
  
  const [file, setFile] = useState(null);
  const [chartType, setChartType] = useState("heatmap"); 

 
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please upload a file first.");

    setLoading(true);
    setError("");
    setChartData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch(
        `${AI_BASE_URL}/infograph/infograph/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadResponse.ok) throw new Error("File upload failed.");
      const uploadData = await uploadResponse.json();

      const documentId = uploadData.Document_id || uploadData.document_id;
      if (!documentId) throw new Error("Backend did not return a Document_id.");

      const endpoint =
        chartType === "heatmap"
          ? "/infograph/infograph/heatmap"
          : "/infograph/infograph/piechart";

      const chartResponse = await fetch(`${AI_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: documentId }),
      });

      if (!chartResponse.ok)
        throw new Error(`Failed to generate ${chartType} data.`);

      const responseData = await chartResponse.json();
      console.log("Chart Data Received:", responseData);

      const finalData = Array.isArray(responseData)
        ? responseData
        : responseData.data || [responseData];
      setChartData(finalData);
    } catch (err) {
      console.error("Infographic workflow failed:", err);
      setError(
        err.message || "Failed to process the document. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 p-8 text-white shrink-0">
          <h2 className="text-3xl font-bold flex items-center mb-2">
            <PieChart className="w-8 h-8 mr-3 text-fuchsia-200" /> Data
            Visualizer
          </h2>
          <p className="text-fuchsia-100 font-medium">
            Upload your document to instantly extract structured topics, years,
            and marks.
          </p>
        </div>

        <div className="p-8 border-b border-slate-100">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center text-sm font-bold">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors">
              <input
                type="file"
                id="info-file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.txt,.docx,.csv"
              />
              <label
                htmlFor="info-file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-fuchsia-50 text-fuchsia-600 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <span className="text-slate-700 font-bold mb-1">
                  {file ? file.name : "Click to select a document"}
                </span>
                <span className="text-slate-500 text-sm">
                  {file
                    ? "File ready for analysis"
                    : "Upload your file to extract data"}
                </span>
              </label>
            </div>

            {/* Analysis Options */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Select Analysis Type
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setChartType("heatmap")}
                  className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    chartType === "heatmap"
                      ? "border-fuchsia-600 bg-fuchsia-50 text-fuchsia-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-fuchsia-300"
                  }`}
                >
                  <Grid className="w-6 h-6 mb-2" />
                  <span className="font-bold">Heat Map Data</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartType("piechart")}
                  className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    chartType === "piechart"
                      ? "border-fuchsia-600 bg-fuchsia-50 text-fuchsia-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-fuchsia-300"
                  }`}
                >
                  <PieChart className="w-6 h-6 mb-2" />
                  <span className="font-bold">Pie Chart Data</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full h-14 bg-fuchsia-600 text-white rounded-xl font-bold text-lg hover:bg-fuchsia-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
              ) : (
                <FileText className="w-6 h-6 mr-2" />
              )}
              {loading
                ? "Extracting Data..."
                : `Generate ${chartType === "heatmap" ? "Heat Map" : "Pie Chart"} Data`}
            </button>
          </form>
        </div>

        {/* Results Area (Data Table) */}
        <div className="p-8 bg-slate-50 flex-1 min-h-[300px]">
          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-pulse py-10">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-fuchsia-500" />
              <p className="font-bold text-slate-600">
                Structuring your data...
              </p>
            </div>
          )}

          {!loading && !chartData && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
              <Grid className="w-16 h-16 mx-auto mb-3 opacity-30 text-slate-500" />
              <p className="text-sm font-medium">
                Your extracted data table will appear here.
              </p>
            </div>
          )}

          {!loading && chartData && chartData.length > 0 && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                {chartType === "heatmap" ? (
                  <Grid className="w-5 h-5 mr-2 text-fuchsia-600" />
                ) : (
                  <PieChart className="w-5 h-5 mr-2 text-fuchsia-600" />
                )}
                Extracted Data Results
              </h3>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                      <th className="p-4 font-bold">Topic</th>
                      <th className="p-4 font-bold">Year</th>
                      <th className="p-4 font-bold">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 text-slate-800 font-medium">
                          {item.topic || "N/A"}
                        </td>
                        <td className="p-4 text-slate-600">
                          {item.year || "N/A"}
                        </td>
                        <td className="p-4 text-fuchsia-600 font-bold">
                          {item.marks || "0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedInfographicMaker;

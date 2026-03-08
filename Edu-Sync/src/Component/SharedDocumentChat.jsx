import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Loader2,
  Send,
  FileText,
  UploadCloud,
  AlertCircle,
} from "lucide-react";

// --- IMPORTS FOR MARKDOWN RENDERING ---
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AI_BASE_URL = "https://edusync-ai-service.onrender.com";

const SharedDocumentChat = () => {
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [namespace, setNamespace] = useState(null); 
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleInitialize = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file to upload.");

    setIsInitializing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${AI_BASE_URL}/chatbot/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload the document.");

      const data = await response.json();
      console.log("Upload Success:", data);

      if (data.session_id && data.namespace) {
        setSessionId(data.session_id);
        setNamespace(data.namespace);

        setMessages([
          {
            role: "ai",
            text: `I have successfully read **"${file.name}"**. What would you like to know about it?`,
          },
        ]);
      } else {
        throw new Error(
          "Initialization failed. Missing session_id or namespace from the server.",
        );
      }
    } catch (err) {
      console.error("Initialization Error:", err);
      setError(err.message || "Failed to connect to the AI service.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !sessionId || !namespace) return;

    const userMsg = currentMessage.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setCurrentMessage("");
    setIsSending(true);

    try {
      const payload = {
        namespace: namespace,
        user_message: userMsg,
        session_id: sessionId,
      };

      const response = await fetch(`${AI_BASE_URL}/chatbot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Chat request failed.");

      const data = await response.json();
      console.log("Chat Response:", data);

      const aiReply =
        data.response ||
        data.reply ||
        data.answer ||
        data.message ||
        (typeof data === "string"
          ? data
          : "I processed that, but my response format was unexpected.");

      setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          isError: true,
          text: "**Network error:** Failed to get a response from the AI.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto h-[85vh] flex flex-col animate-in fade-in duration-300">
      <div className="bg-indigo-600 p-6 rounded-t-2xl text-white shrink-0">
        <h2 className="text-2xl font-bold flex items-center">
          <Bot className="w-6 h-6 mr-3" /> Document Chat
        </h2>
        <p className="text-indigo-100 mt-1 text-sm">
          Upload your syllabus or study materials and ask questions directly to
          it.
        </p>
      </div>

      <div className="bg-white border-x border-b border-slate-200 rounded-b-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {!sessionId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <FileText className="w-16 h-16 text-indigo-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Initialize AI Context
            </h3>
            <p className="text-slate-500 text-sm mb-8 max-w-md">
              Upload a PDF or document so the AI can read it and prepare to
              answer your questions.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center text-sm font-bold w-full max-w-md">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {error}
              </div>
            )}

            <form
              onSubmit={handleInitialize}
              className="w-full max-w-md space-y-4"
            >
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:bg-white transition-colors bg-slate-50">
                <input
                  type="file"
                  id="chat-file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.docx"
                />
                <label
                  htmlFor="chat-file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-slate-700 font-bold mb-1">
                    {file ? file.name : "Click to select a document"}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {file ? "Ready to load context" : "Supports PDF, TXT, DOCX"}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isInitializing || !file}
                className="w-full bg-indigo-600 text-white px-4 py-3.5 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
              >
                {isInitializing ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Bot className="w-5 h-5 mr-2" />
                )}
                {isInitializing ? "AI is reading document..." : "Load Document"}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 mt-1 ${msg.isError ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"}`}
                    >
                      {msg.isError ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                  )}

                  {msg.role === "user" ? (
                    // USER MESSAGE
                    <div className="max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed bg-indigo-600 text-white rounded-tr-sm shadow-md">
                      {msg.text}
                    </div>
                  ) : (
                    // AI MESSAGE - UPDATED FOR MARKDOWN
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                        msg.isError
                          ? "bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-sm shadow-sm"
                          : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm prose prose-sm max-w-none prose-indigo prose-p:my-1 prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:rounded"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm flex items-center text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-indigo-600" />{" "}
                    AI is thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-slate-200 flex gap-3"
            >
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask a question about your document..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
              />
              <button
                type="submit"
                disabled={isSending || !currentMessage.trim()}
                className="bg-indigo-600 text-white w-12 h-[46px] rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors shrink-0"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SharedDocumentChat;
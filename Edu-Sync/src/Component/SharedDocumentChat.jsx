import React, { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send, Link as LinkIcon, FileText } from "lucide-react";

const SharedDocumentChat = () => {
  const [docUrl, setDocUrl] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Step 1: Initialize the RAG Context
  const handleInitialize = async (e) => {
    e.preventDefault();
    if (!docUrl) return;
    setIsInitializing(true);
    try {
      const response = await fetch(
        "https://edusync-ai-latest.onrender.com/chat/init",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: docUrl }),
        },
      );
      const data = await response.json();

      if (data.session_id) {
        setSessionId(data.session_id);
        setMessages([
          {
            role: "ai",
            text: "Document processed successfully! What would you like to know about it?",
          },
        ]);
      } else {
        alert("Initialization failed. Please check the URL.");
      }
    } catch (error) {
      alert("Failed to connect to the AI service.");
    } finally {
      setIsInitializing(false);
    }
  };

  // Step 2: Send Chat Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !sessionId) return;

    const userMsg = currentMessage.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setCurrentMessage("");
    setIsSending(true);

    try {
      const response = await fetch(
        "https://edusync-ai-latest.onrender.com/chat/message",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, message: userMsg }),
        },
      );
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            data.response ||
            data.reply ||
            data.answer ||
            "I processed that, but my response format was unexpected.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Network error: Failed to get a response." },
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
          Ask questions directly to your syllabus or study materials.
        </p>
      </div>

      <div className="bg-white border-x border-b border-slate-200 rounded-b-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* State 1: Need to Initialize URL */}
        {!sessionId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <FileText className="w-16 h-16 text-indigo-100 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Initialize AI Context
            </h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md">
              Paste a link to a PDF or document so the AI can read it and
              prepare for your questions.
            </p>

            <form
              onSubmit={handleInitialize}
              className="w-full max-w-md flex gap-2"
            >
              <input
                type="url"
                required
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="https://.../notes.pdf"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isInitializing}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-70 flex items-center"
              >
                {isInitializing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <LinkIcon className="w-4 h-4 mr-2" />
                )}
                Load
              </button>
            </form>
          </div>
        ) : (
          /* State 2: Active Chat */
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm whitespace-pre-wrap"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-400 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> AI is
                    thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-slate-200 flex gap-2"
            >
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask a question about the document..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
              <button
                type="submit"
                disabled={isSending || !currentMessage.trim()}
                className="bg-indigo-600 text-white w-12 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SharedDocumentChat;

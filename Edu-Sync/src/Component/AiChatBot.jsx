import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Send,
  FileText,
  TrendingUp,
  Target,
  Search,
  Link as LinkIcon,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";

const AIChatbot = () => {
  // --- AI RAG State ---
  const AI_BASE_URL = "https://edusync-ai-latest.onrender.com";
  const [sessionId, setSessionId] = useState(null);
  const [contextUrl, setContextUrl] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState("");

  // --- Chat State ---
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your AI Exam Predictor & Problem Solver. To get started, please paste the URL of a PYQ document in the top bar to initialize my memory context.",
    },
  ]);
  const chatEndRef = useRef(null);

  const quickPrompts = [
    "Analyze C++ Object-Oriented PYQ trends",
    "What is the weightage of 8085 Assembly?",
    "Predict questions for Data Structures Midterm",
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  // ==========================================
  // STEP 1: INITIALIZE RAG CONTEXT
  // ==========================================
  const handleInitSession = async (e) => {
    e.preventDefault();
    if (!contextUrl.trim()) return;

    setIsInitializing(true);
    setInitError("");

    try {
      const response = await axios.post(`${AI_BASE_URL}/chat/init`, {
        url: contextUrl.trim(),
      });

      if (response.data.success && response.data.session_id) {
        setSessionId(response.data.session_id);
        setChatHistory((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "ai",
            text: `✅ Document successfully processed! I am now ready to answer questions based on this specific question paper.`,
          },
        ]);
      } else {
        console.log(response.data);
        throw new Error("Failed to retrieve a session ID.");
      }
    } catch (error) {
      console.error(error);
      setInitError(
        error.response?.data?.detail ||
          "Failed to initialize document. Please check the URL.",
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const handleClearSession = () => {
    setSessionId(null);
    setContextUrl("");
    setChatHistory([
      {
        id: Date.now(),
        sender: "ai",
        text: "Session cleared. Please provide a new document URL to start over.",
      },
    ]);
  };

  // ==========================================
  // STEP 2: SEND MESSAGE TO AI
  // ==========================================
  const handleSend = async (textPrompt = null) => {
    const userMsg = textPrompt || message;
    if (!userMsg.trim()) return;

    // 1. Add user message to UI
    setChatHistory((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: userMsg,
      },
    ]);

    setMessage("");
    setIsTyping(true);

    try {
      // 2. Call the AI Chat endpoint
      const response = await axios.post(`${AI_BASE_URL}/chat/message`, {
        session_id: sessionId,
        message: userMsg,
      });

      if (response.data.success) {
        setChatHistory((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: response.data.response,
          },
        ]);
      } else {
        console.log(response.data);
        throw new Error("AI failed to respond properly.");
      }
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          isError: true,
          text: "Sorry, I encountered an error while processing that question. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ==========================================
  // RENDER SECTIONS
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto h-[82vh] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 p-5 text-white flex flex-col sm:flex-row sm:justify-between sm:items-center shrink-0 gap-4">
        <div className="flex items-center">
          <div className="p-2.5 bg-indigo-600 rounded-xl mr-4 border border-indigo-400">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center">
              PYQ Analyzer AI
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              RAG-powered contextual problem solver
            </p>
          </div>
        </div>

        {/* STEP 1: Document Context Initialization Bar */}
        <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-1 w-full sm:w-auto">
          {!sessionId ? (
            <form onSubmit={handleInitSession} className="flex w-full sm:w-80">
              <div className="px-3 flex items-center text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                required
                value={contextUrl}
                onChange={(e) => setContextUrl(e.target.value)}
                placeholder="Paste PYQ PDF URL here..."
                className="bg-transparent text-sm text-white w-full outline-none placeholder-slate-500 py-2"
                disabled={isInitializing}
              />
              <button
                type="submit"
                disabled={isInitializing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center shrink-0 disabled:opacity-50"
              >
                {isInitializing ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  "Load Context"
                )}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between w-full sm:w-80 px-3 py-2">
              <div className="flex items-center text-emerald-400 text-xs font-bold truncate pr-2">
                <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" /> Context
                Active
              </div>
              <button
                onClick={handleClearSession}
                className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                title="Clear Session"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Initialization Error Banner */}
      {initError && (
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-3 flex items-center text-sm font-medium text-rose-700 shrink-0">
          <AlertCircle className="w-4 h-4 mr-2" /> {initError}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 relative">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "ai" && (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 mt-1 ${msg.isError ? "bg-rose-100" : "bg-slate-800"}`}
              >
                {msg.isError ? (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <Bot className="w-4 h-4 text-indigo-400" />
                )}
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] ${msg.sender === "user" ? "flex flex-col items-end" : ""}`}
            >
              {msg.sender === "user" && (
                <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md space-y-2 text-sm">
                  {msg.text}
                </div>
              )}

              {msg.sender === "ai" && (
                <div
                  className={`border px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm text-sm leading-relaxed ${
                    msg.isError
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  {msg.text}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 shrink-0">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-1">
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        {/* Quick Prompts */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-3 pb-1">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              disabled={!sessionId || isTyping}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap flex items-center px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-xs font-medium rounded-lg transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-3 h-3 mr-1.5" /> {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center relative"
        >
          <input
            type="text"
            disabled={!sessionId || isTyping}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 py-3.5 pl-5 pr-14 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-100"
            placeholder={
              !sessionId
                ? "Initialize a document URL above to start asking questions..."
                : "Ask a question about the document..."
            }
          />
          <button
            type="submit"
            disabled={!message.trim() || !sessionId || isTyping}
            className={`absolute right-2 p-2 rounded-lg transition-colors ${
              message.trim() && sessionId && !isTyping
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                : "bg-transparent text-slate-300 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;

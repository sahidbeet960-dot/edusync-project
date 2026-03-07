import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Mail,
  Settings,
  MessageCircleQuestion,
  CalendarDays,
  BrainCircuit,
  Bot,
  FileText,
  Image as ImageIcon,
  ListChecks,
} from "lucide-react";

const Sidebar = () => {
  const navLinkClass = ({ isActive }) =>
    `w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const aiLinkClass = ({ isActive }) =>
    `w-full flex items-center px-4 py-2.5 rounded-lg font-medium transition-all ${
      isActive
        ? "bg-purple-50 text-purple-700 border border-purple-100"
        : "text-slate-600 hover:bg-slate-50 hover:text-purple-600"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">
          Edu-Sync
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {/* --- Core CR Admin Tools --- */}
        <NavLink to="/dashboard/cr" end className={navLinkClass}>
          <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
        </NavLink>

        <NavLink to="/dashboard/cr/schedule" className={navLinkClass}>
          <CalendarDays className="w-5 h-5 mr-3" /> Manage Timetable
        </NavLink>

        <NavLink to="/dashboard/cr/discussions" className={navLinkClass}>
          <MessageCircleQuestion className="w-5 h-5 mr-3" /> Doubt Forum
        </NavLink>

        <NavLink to="/dashboard/cr/resources" className={navLinkClass}>
          <FolderOpen className="w-5 h-5 mr-3" /> Manage Resources
        </NavLink>

        <NavLink to="/dashboard/cr/messages" className={navLinkClass}>
          <Mail className="w-5 h-5 mr-3" /> Messages
        </NavLink>

        {/* --- AI Study Tools Separator --- */}
        <div className="pt-4 pb-2">
          <div className="border-t border-slate-200 mb-4"></div>
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <SparklesIcon className="w-3.5 h-3.5 mr-1.5 text-purple-500" /> AI
            Study Tools
          </p>
        </div>

        {/* --- New AI Features --- */}
        <NavLink to="/dashboard/cr/doc-chat" className={aiLinkClass}>
          <Bot className="w-4 h-4 mr-3" /> Document Chat
        </NavLink>

        <NavLink to="/dashboard/cr/quiz" className={aiLinkClass}>
          <ListChecks className="w-4 h-4 mr-3" /> AI Quiz Generator
        </NavLink>

        <NavLink to="/dashboard/cr/summary" className={aiLinkClass}>
          <FileText className="w-4 h-4 mr-3" /> Smart Summarizer
        </NavLink>

        <NavLink to="/dashboard/cr/infographic" className={aiLinkClass}>
          <ImageIcon className="w-4 h-4 mr-3" /> Infographic Maker
        </NavLink>

        {/* CR Exclusive AI Admin Tool */}
        <NavLink to="/dashboard/cr/analyzer" className={aiLinkClass}>
          <BrainCircuit className="w-4 h-4 mr-3" /> Edit PYQ Weights
        </NavLink>
      </nav>

      {/* Footer Settings */}
      <div className="p-4 border-t border-slate-200 shrink-0">
        <NavLink to="/dashboard/cr/settings" className={navLinkClass}>
          <Settings className="w-5 h-5 mr-3" /> Settings
        </NavLink>
      </div>
    </aside>
  );
};

// Mini helper icon for the header
const SparklesIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

export default Sidebar;

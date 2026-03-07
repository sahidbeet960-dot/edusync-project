import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, FolderOpen, Mail, Settings, MessageCircleQuestion, CalendarDays } from 'lucide-react';

const Sidebar = () => {
  // This function applies the blue styling if the URL matches the link
  const navLinkClass = ({ isActive }) =>
    `w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tight">Edu-Sync</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {/* End keyword ensures this only highlights on the exact /dashboard/professor path */}
        <NavLink to="/dashboard/professor" end className={navLinkClass}>
          <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
        </NavLink>

        {/* NEW: Schedule & Events Tab to access the interactive calendar */}
        <NavLink to="/dashboard/professor/schedule" className={navLinkClass}>
          <CalendarDays className="w-5 h-5 mr-3" /> Schedule & Events
        </NavLink>

        <NavLink to="/dashboard/professor/discussions" className={navLinkClass}>
          <MessageCircleQuestion className="w-5 h-5 mr-3" /> Doubt Forum
        </NavLink>

        <NavLink to="/dashboard/professor/resources" className={navLinkClass}>
          <FolderOpen className="w-5 h-5 mr-3" /> Resources
        </NavLink>

        {/* These routes don't exist yet, but the links are ready */}
        <NavLink to="/dashboard/professor/messages" className={navLinkClass}>
          <Mail className="w-5 h-5 mr-3" /> Messages
        </NavLink>

        <NavLink to="/dashboard/professor/settings" className={navLinkClass}>
          <Settings className="w-5 h-5 mr-3" /> Settings
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
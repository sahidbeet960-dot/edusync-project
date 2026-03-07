import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import SharedHeader from '../Component/SharedHeader';

const StudentLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Navigation menu for Students */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top bar search and profile details */}
        <SharedHeader/>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="p-6 lg:p-10">
            <Outlet /> 
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default StudentLayout;
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import SharedHeader from '../Component/SharedHeader';

const CRLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* 1. The Left Navigation Menu (CR Specific) */}
      <Sidebar />

      {/* 2. The Right Side (Header + Dynamic Content) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* The Top Bar */}
        <SharedHeader />

        {/* 3. The Main Content Area */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="p-6 lg:p-10">
            <Outlet /> 
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default CRLayout;

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import SharedHeader from "../Component/SharedHeader";

const CRLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SharedHeader />
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

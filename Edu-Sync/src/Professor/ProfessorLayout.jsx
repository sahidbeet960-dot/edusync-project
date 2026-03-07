import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import SharedHeader from "../Component/SharedHeader";
const ProfessorLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SharedHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default ProfessorLayout;

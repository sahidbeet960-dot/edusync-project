import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// authentication and log in
import RoleSelection from "./LOGIN/RoleSelection";
import Login from "./AUTH/Login";
import Registration from "./AUTH/Registration";

// shared component for all three roles
import SharedProfile from "./Component/SharedProfile";
import SharedResources from "./Component/SharedResources";
// professor component
import ProfessorLayout from "./Professor/ProfessorLayout";
import ProfessorHome from "./Professor/ProfessorHome";
import NotificationsPage from "./Professor/NotificationPage";
import MessagesPage from "./Professor/MessagesPage";
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          {/* Default router */}
          <Route path="/" element={<Navigate to="/role-selection" />} />
          {/*  Authentication Routes */}
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />

          {/* Professor routes */}
          <Route path="/dashboard/professor" element={<ProfessorLayout />}>
            <Route index element={<ProfessorHome />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<SharedProfile/>}/>
            <Route path="resources" element={<SharedResources/>}/>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;

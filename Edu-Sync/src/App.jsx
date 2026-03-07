import {BrowserRouter as Router,Routes,Route,Navigate,} from "react-router-dom";
// authentication and log in
import RoleSelection from "./LOGIN/RoleSelection";
import Login from "./AUTH/Login";
import Registration from "./AUTH/Registration";

// shared component for all three roles
import SharedProfile from "./Component/SharedProfile";
import SharedResources from "./Component/SharedResources";
import SharedForum from "./Component/SharedForum";
import SharedSehedule from "./Component/SharedSchedule"
import AiQuizGenerator from "./Component/AiQuizGenerator"
import StudyRoom from "./Component/studyRoom";
import SharedDocumentChat from "./Component/SharedDocumentChat";
import SharedSmartSummarizer from "./Component/SharedSmartSummarizer";
import SharedInfographicMaker from "./Component/SharedInfographicMaker";
// professor component
import ProfessorLayout from "./Professor/ProfessorLayout";
import ProfessorHome from "./Professor/ProfessorHome";
import NotificationsPage from "./Professor/NotificationPage";
import MessagesPage from "./Professor/MessagesPage";
// cr component 

// student component
import StudentHome from "./Student/StudentHome";
import StudentLayout from "./Student/StudentLayout";

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
            <Route path="profile" element={<SharedProfile />} />
            <Route path="resources" element={<SharedResources />} />
            <Route path="discussions" element={<SharedForum />} />
          </Route>
          {/* CR Dashboard */}
          {/* <Route path="/dashboard/cr" element={<CRLayout />}>

          </Route> */}

          <Route path="/dashboard/student" element={<StudentLayout />}>
            <Route index element={<StudentHome />} />
            <Route path="doc-chat" element={<SharedDocumentChat />} />
            <Route path="quiz" element={<AiQuizGenerator />} />
            <Route path="summary" element={<SharedSmartSummarizer />} />
            <Route path="infographic" element={<SharedInfographicMaker />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;

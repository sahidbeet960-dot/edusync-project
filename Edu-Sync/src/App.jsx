import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// authentication
import RoleSelection from "./LOGIN/RoleSelection";
import Login from "./AUTH/Login";
import Registration from "./AUTH/Registration";

// shared component for all three roles
import SharedProfile from "./Component/SharedProfile";
import SharedResources from "./Component/SharedResources";
import SharedForum from "./Component/SharedForum";
import SharedSchedule from "./Component/SharedSchedule"; 
import AiQuizGenerator from "./Component/AiQuizGenerator";
import StudyRoom from "./Component/studyRoom";
import SharedDocumentChat from "./Component/SharedDocumentChat";
import SharedSmartSummarizer from "./Component/SharedSmartSummarizer";
import SharedInfographicMaker from "./Component/SharedInfographicMaker";

// The AI PYQ Analyzer component
import PYQAnalyzer from "./Component/PYQAnalyzer";

// professor component
import ProfessorLayout from "./Professor/ProfessorLayout";
import ProfessorHome from "./Professor/ProfessorHome";
import NotificationPage from "./Professor/NotificationPage";
import MessagesPage from "./Professor/MessagesPage";

// cr component 
import CRHome from "./CR/CRHome";
import CRLayout from "./CR/CRLayout";
import CRMessages from "./CR/CRMessages";
import CRNotifications from "./CR/CRNotifications";

// student component
import StudentHome from "./Student/StudentHome";
import StudentLayout from "./Student/StudentLayout";
import StudentMessages from "./Student/StudentMessages";
import StudentNotification from "./Student/StudentNotification";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route path="/" element={<Navigate to="/role-selection" />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          
          {/* PROFESSOR ROUTES */}
          <Route path="/dashboard/professor" element={<ProfessorLayout />}>
            <Route index element={<ProfessorHome />} />
            
            {/* ALIASES: Guarantees the Professor sidebar link never hits a blank screen */}
            <Route path="schedule" element={<SharedSchedule />} />
            <Route path="events" element={<SharedSchedule />} />
            <Route path="calendar" element={<SharedSchedule />} />
            <Route path="timetable" element={<SharedSchedule />} />
            
            <Route path="messages" element={<MessagesPage />} />
            <Route path="notifications" element={<NotificationPage />} />
            <Route path="profile" element={<SharedProfile />} />
            <Route path="resources" element={<SharedResources />} />
            <Route path="discussions" element={<SharedForum />} />
          </Route>
          
          {/* CR ROUTES */}
          <Route path="/dashboard/cr" element={<CRLayout />}>
            <Route index element={<CRHome />} />
            <Route path="schedule" element={<SharedSchedule />} />
            <Route path="discussions" element={<SharedForum />} />
            <Route path="resources" element={<SharedResources />} />
            
            {/* CR STUDY ROOM */}
            <Route path="study-room" element={<StudyRoom />} />
            <Route path="live-class" element={<StudyRoom />} />
            
            <Route path="messages" element={<CRMessages />} />
            <Route path="notifications" element={<CRNotifications />} />
            <Route path="profile" element={<SharedProfile />} />
            <Route path="doc-chat" element={<SharedDocumentChat />} />
            <Route path="quiz" element={<AiQuizGenerator />} />
            <Route path="summary" element={<SharedSmartSummarizer />} />
            <Route path="infographic" element={<SharedInfographicMaker />} />
            
            {/* AI PYQ ANALYZER ROUTE */}
            <Route path="analyzer" element={<PYQAnalyzer />} />
          </Route>
          
          {/* STUDENT ROUTES */}
          <Route path="/dashboard/student" element={<StudentLayout />}>
            <Route index element={<StudentHome />} />
            <Route path="doc-chat" element={<SharedDocumentChat />} />
            <Route path="quiz" element={<AiQuizGenerator />} />
            <Route path="summary" element={<SharedSmartSummarizer />} />
            <Route path="infographic" element={<SharedInfographicMaker />} />
            <Route path="schedule" element={<SharedSchedule />} />
            <Route path="discussions" element={<SharedForum />} />
            <Route path="resources" element={<SharedResources />} />
            <Route path="messages" element={<StudentMessages />} />
            <Route path="notifications" element={<StudentNotification />} />
            <Route path="profile" element={<SharedProfile />} />
            <Route path="live-class" element={<StudyRoom />} />
            <Route path="study-room" element={<StudyRoom />} />
            
            {/* AI PYQ ANALYZER ALIASES */}
            <Route path="ai-assistance" element={<PYQAnalyzer />} />
            <Route path="analyzer" element={<PYQAnalyzer />} />
            <Route path="topic-importance" element={<PYQAnalyzer />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
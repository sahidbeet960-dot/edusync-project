import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// authentication and log in 
import RoleSelection from './LOGIN/RoleSelection';
import Login from './AUTH/Login';
import Registration from './AUTH/Registration';
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
              </Routes>
         </div>
    </Router>
  )
}

export default App;

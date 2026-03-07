import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Loader2 } from 'lucide-react';
import apiClient from '../services/api'; 
import { jwtDecode } from 'jwt-decode'; // IMPORT THIS!

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // The role the user claims to be (based on the portal they clicked)
  const attemptedRole = location.state?.role || 'STUDENT';

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const registerPath = '/register';

  const roleConfig = {
    PROFESSOR: {
      title: 'Professor Access',
      subtitle: 'Enter your faculty credentials',
      color: 'bg-blue-600 hover:bg-blue-700',
      placeholder: 'dr.name@edu-sync.edu',
    },
    CR: {
      title: 'Class Representative Access',
      subtitle: 'Enter your CR credentials to manage schedules',
      color: 'bg-teal-600 hover:bg-teal-700',
      placeholder: 'cr.name@edu-sync.edu',
    },
    STUDENT: {
      title: 'Student Portal',
      subtitle: 'Access your syllabus and live rooms',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      placeholder: 'student.roll@edu-sync.edu',
    }
  };

  const currentConfig = roleConfig[attemptedRole];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('username', email); 
      params.append('password', password);

      const response = await apiClient.post('/api/v1/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const { access_token } = response.data;
      
      // --- NEW LOGIC: VERIFY ACTUAL ROLE ---
      // 1. Decode the token to see the backend's truth
      const decodedToken = jwtDecode(access_token);
      
      // 2. Extract the true role (Check your backend token payload! It might be 'role', 'user_role', etc.)
      const actualRole = decodedToken.role?.toUpperCase(); 

      // 3. Compare the truth with what they attempted
      if (actualRole !== attemptedRole) {
        setError(`Access Denied: This email is registered as a ${actualRole}. Please use the correct login portal.`);
        setIsLoading(false);
        return; // Stop the login process!
      }

      // If they pass the check, save the token and let them in
      localStorage.setItem('edusync_token', access_token);
      
      if (actualRole === 'PROFESSOR') navigate('/dashboard/professor');
      else if (actualRole === 'CR') navigate('/dashboard/cr'); 
      else navigate('/dashboard/student'); 

    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.detail) {
        setError(typeof err.response.data.detail === 'string' ? err.response.data.detail : 'Invalid credentials.');
      } else {
        setError('Failed to connect to the server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-100">
      
      <button 
        onClick={() => navigate('/role-selection')}
        className="absolute top-8 left-8 flex items-center text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Roles
      </button>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        <div className={`p-8 text-center text-white ${currentConfig.color.split(' ')[0]}`}>
          <h2 className="text-2xl font-bold tracking-wide">{currentConfig.title}</h2>
          <p className="text-sm opacity-90 mt-1">{currentConfig.subtitle}</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
                  placeholder={currentConfig.placeholder}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors shadow-md flex justify-center items-center disabled:opacity-70 ${currentConfig.color}`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </button>

            <div className="mt-8 text-center border-t border-slate-200 pt-6">
              <p className="text-sm text-slate-500">
                New to EduSync?{' '}
                <Link to={registerPath} state={{ role: attemptedRole }} className="text-blue-600 font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
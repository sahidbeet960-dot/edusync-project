import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import apiClient from '../services/api'; // Make sure you have this api configuration file!

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve the role from state, default to STUDENT
  const role = location.state?.role || 'STUDENT';

  // Dynamic styling and text based on the selected role
  const roleConfig = {
    PROFESSOR: {
      title: 'Faculty Registration',
      subtitle: 'Create your Professor account for EduSync',
      color: 'bg-blue-600',
      btnColor: 'bg-blue-600 hover:bg-blue-700',
      ring: 'focus:ring-blue-500',
    },
    CR: {
      title: 'Class Representative Registration',
      subtitle: 'Create your CR account for EduSync',
      color: 'bg-teal-600',
      btnColor: 'bg-teal-600 hover:bg-teal-700',
      ring: 'focus:ring-teal-500',
    },
    STUDENT: {
      title: 'Student Registration',
      subtitle: 'Create your student account for EduSync',
      color: 'bg-indigo-600',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700',
      ring: 'focus:ring-indigo-500',
    }
  };

  const currentConfig = roleConfig[role];

  // Backend state mapping exactly to your Swagger JSON schema
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    password: '', 
    role: role // automatically assigned based on routing state
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Connect to your backend
      const response = await apiClient.post('/api/v1/auth/register', formData);
      
      console.log("Registration Success:", response.data);
      alert(`${currentConfig.title} successful! Please login.`);
      
      // Navigate back to login with the correct role selected
      navigate('/login', { state: { role } });

    } catch (err) {
      console.error('Registration Error:', err);
      if (err.response?.data?.detail) {
        setError(typeof err.response.data.detail === 'string' ? err.response.data.detail : 'Validation Error: Check your inputs.');
      } else {
        setError('Failed to register. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-100">
      
      <button 
        onClick={() => navigate('/login', { state: { role } })} 
        className="absolute top-8 left-8 flex items-center text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Login
      </button>

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Dynamic Header */}
        <div className={`p-6 text-white text-center ${currentConfig.color}`}>
          <h2 className="text-2xl font-bold tracking-wide">{currentConfig.title}</h2>
          <p className="text-sm opacity-90 mt-1">{currentConfig.subtitle}</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-5">
          
          {/* Error Message Display */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                required 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 ${currentConfig.ring}`} 
                placeholder="John Doe" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email ID</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 ${currentConfig.ring}`}
                placeholder="name@edu-sync.edu" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 ${currentConfig.ring}`}
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3 mt-4 text-white font-bold rounded-lg transition-all shadow-md disabled:opacity-70 flex justify-center items-center ${currentConfig.btnColor}`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoading ? 'Registering...' : `Register as ${role}`}
          </button>

          <div className="text-center mt-4">
             <p className="text-sm text-slate-500">
                By creating an account, you agree to EduSync's Terms & Conditions.
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import apiClient from '../services/api';

const Registration = () =>{
       const location=useLocation();
       const navigate=useNavigate();

       const role = location.state?.role || 'STUDENT';

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
      color: 'bg-green-600',
      btnColor: 'bg-green-600 hover:bg-green-700',
      ring: 'focus:ring-green-500',
    },
    STUDENT: {
      title: 'Student Registration',
      subtitle: 'Create your student account for EduSync',
      color: 'bg-violet-600',
      btnColor: 'bg-violet-600 hover:bg-violet-700',
      ring: 'focus:ring-violet-500',
    }
  };

   const currentConfig = roleConfig[role];

   const [formData,setformData]=useState({
       full_name: '',
       email:'',
       password:'',
       role:role,
   });
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);

   // registration handle
   const  handleRegister =async(e)=>{
         e.preventDefault();
         setError('');
         setIsLoading(true);
         // trying to get data from the backend
         try{
            const response = await apiClient.post('/api/v1/auth/register', formData);
            console.log("Registration Success:", response.data);
            alert(`${currentConfig.title} Your registration successfully done! Please login.`);
            navigate('/login', { state: { role } });
         }catch(err){
            console.err('Registration error:',err);
            if (err.response?.data?.detail) {
                 setError(typeof err.response.data.detail === 'string' ?
                 err.response.data.detail : 'Validation Error: Check your inputs.');
            } else {
                    setError('Failed to register. Please try again.');
              }
         }finally{
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
        
        
        <div className={`p-6 text-white text-center ${currentConfig.color}`}>
          <h2 className="text-2xl font-bold tracking-wide">{currentConfig.title}</h2>
          <p className="text-sm opacity-90 mt-1">{currentConfig.subtitle}</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-5">
          
          
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
                required value={formData.full_name}
                onChange={(e) => setformData({...formData, full_name: e.target.value})}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 ${currentConfig.ring}`} 
                placeholder="Toufik Mamud" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email ID</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required value={formData.email}
                onChange={(e) => setformData({...formData, email: e.target.value})}
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
                required value={formData.password}
                onChange={(e) => setformData({...formData, password: e.target.value})}
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

export default Registration;
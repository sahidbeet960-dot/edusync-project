import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, GraduationCap } from 'lucide-react';
const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    navigate('/login', { state: { role: selectedRole } });
  };

  const roles = [
    {
      id: 'PROFESSOR',
      title: 'Professor Login',
      description: 'For Faculty to Verify Resources & Post Official Notices',
      icon: <BookOpen className="w-12 h-12 mb-4 text-blue-500" />,
      theme: 'hover:border-blue-500 hover:shadow-blue-300',
    },
    {
      id: 'CR',
      title: 'CR Login',
      description: 'For Class Representatives to Manage Schedules & Broadcast Deadlines',
      icon: <Users className="w-12 h-12 mb-4 text-green-500" />,
      theme: 'hover:border-green-500 hover:shadow-green-300',
    },
    {
      id: 'STUDENT',
      title: 'Student Login',
      description: 'For Students to Access Portal & Live Study Rooms',
      icon: <GraduationCap className="w-12 h-12 mb-4 text-violet-500" />,
      theme: 'hover:border-violet-500 hover:shadow-violet-300',
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-100">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          <span className="text-blue-600">Edu-Sync</span> | Choose Your Login Type
        </h1>
        <p className="text-slate-500 mt-2">Select your role to access the portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            className={`flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg border-2 border-transparent cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${role.theme}`}
          >
            {role.icon}
            <h2 className="text-xl font-bold text-slate-800 mb-3">{role.title}</h2>
            <p className="text-sm text-slate-500">{role.description}</p>
            
            <button className="mt-6 px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">
              Select Role
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
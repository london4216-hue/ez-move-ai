import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useEffect, useState } from 'react';
import {
  Building2, Users, UserCheck, Briefcase, Shield, Settings, Play, LogOut
} from 'lucide-react';

const MODULES = [
  {
    id: 'agent',
    label: 'Agent Portal',
    icon: UserCheck,
    path: '/AgentDashboard',
    color: 'bg-blue-500',
    description: 'Manage buyers & sellers, track moves',
  },
  {
    id: 'broker',
    label: 'Broker/Movers',
    icon: Briefcase,
    path: '/BrokerDashboard',
    color: 'bg-purple-500',
    description: 'Multi-agent firm management',
  },
  {
    id: 'buyer',
    label: 'Buyer/Mover',
    icon: Users,
    path: '/Dashboard',
    color: 'bg-emerald-500',
    description: 'Move planning & checklist',
  },
  {
    id: 'sales',
    label: 'Sales Site',
    icon: Settings,
    path: '/Home',
    color: 'bg-orange-500',
    description: 'Public landing & pricing',
  },
  {
    id: 'admin',
    label: 'Super Admin',
    icon: Shield,
    path: '/SuperAdmin',
    color: 'bg-red-600',
    description: 'System & billing management',
  },
];

export default function PreviewHub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleModuleClick = async (path) => {
    // If not authenticated, create demo session
    if (!user) {
      try {
        // For now, just navigate to the module
        // Modules should handle guest/demo mode
        navigate(path);
      } catch (err) {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm">EZ</span>
            </div>
            <div>
              <p className="font-black text-slate-800 text-base">EZ Move AI</p>
              <p className="text-slate-400 text-xs">Platform Preview</p>
            </div>
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 mb-4">
            Welcome to EZ Move AI
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose a module to explore the platform. Each portal is fully functional and demo-ready.
          </p>
          {user && (
            <p className="text-sm text-slate-500 mt-4">
              Logged in as: <span className="font-semibold">{user.email}</span>
            </p>
          )}
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.path)}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all overflow-hidden text-left"
              >
                <div className={`${module.color} h-20 flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="p-5">
                  <p className="font-black text-slate-800 text-base mb-1">
                    {module.label}
                  </p>
                  <p className="text-slate-600 text-sm mb-4">
                    {module.description}
                  </p>
                  <div className="flex items-center gap-2 text-orange-500 font-semibold text-sm group-hover:gap-3 transition-all">
                    <span>Open Portal</span>
                    <Play className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 border-t border-slate-200 mt-12 text-center text-slate-500 text-xs">
        <p>EZ Move AI Platform Preview • All modules in demo mode</p>
      </div>
    </div>
  );
}
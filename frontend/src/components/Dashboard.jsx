import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TaskList from './TaskList';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-sm font-black text-white tracking-tight shadow-md shadow-indigo-900/40">
              PT
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-white tracking-tight">PrimeTrade</span>
              <span className="hidden sm:block w-px h-4 bg-gray-700" />
              <span className="hidden sm:block text-sm font-medium text-gray-500">Task Manager</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Role badge */}
            <span className={`hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border tracking-wide
              ${isAdmin
                ? 'bg-violet-950/60 border-violet-700/70 text-violet-300'
                : 'bg-indigo-950/60 border-indigo-700/70 text-indigo-300'}`}>
              {isAdmin ? '👑' : '👤'} {user?.role?.toUpperCase()}
            </span>

            {/* Divider */}
            <span className="hidden md:block w-px h-8 bg-gray-800" />

            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md
                ${isAdmin ? 'bg-violet-600 shadow-violet-900/40' : 'bg-indigo-600 shadow-indigo-900/40'}`}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-100 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{user?.email}</p>
              </div>
            </div>

            {/* Divider */}
            <span className="hidden sm:block w-px h-8 bg-gray-800" />

            {/* Logout */}
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 border border-gray-700/80 rounded-xl px-4 py-2 transition duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {isAdmin ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin
              ? "You have admin access — viewing and managing tasks from all users"
              : "Create, track, and manage your personal tasks"}
          </p>
        </div>

        <TaskList />
      </main>
    </div>
  );
}

import React from 'react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sun,
  Moon,
  Sparkles,
  Layers,
  LogOut,
  User as UserIcon,
  Video,
  FileCode,
  Server
} from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'workspace';
  onNavigate: (view: 'landing' | 'dashboard' | 'workspace') => void;
  roomName?: string;
  isCallActive?: boolean;
  onOpenApiDocs?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  roomName,
  isCallActive = false,
  onOpenApiDocs
}) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { themeMode, setThemeMode, cycleRandomTheme, accentPalette } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Left Context */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
            className="focus:outline-none hover:opacity-90 transition"
          >
            <Logo size="md" />
          </button>

          {currentView === 'workspace' && roomName && (
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-800">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Session
              </span>
              <span className="text-sm font-medium text-slate-200 truncate max-w-[200px]">
                {roomName}
              </span>
              {isCallActive && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                  <Video className="w-3 h-3 text-indigo-400" />
                  Call Active
                </span>
              )}
            </div>
          )}
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              currentView === 'landing'
                ? 'text-white bg-slate-900 border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          {isAuthenticated && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                currentView === 'dashboard'
                  ? 'text-white bg-slate-900 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
          )}
          {onOpenApiDocs && (
            <button
              onClick={onOpenApiDocs}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-indigo-300 transition flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5" />
              Java Backend Docs
            </button>
          )}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Theme Selector Palette Mode */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {/* White / Light Theme */}
            <button
              title="Soft Light Studio Theme"
              onClick={() => setThemeMode('white')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                themeMode === 'white'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>

            {/* Dark IDE Theme */}
            <button
              title="Dark Pro IDE Theme"
              onClick={() => setThemeMode('dark')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                themeMode === 'dark'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>

            {/* Random Color Theme via The Color API */}
            <button
              title={`Random Color Theme (The Color API) — Currently: ${accentPalette.name}`}
              onClick={async () => {
                setThemeMode('random');
                await cycleRandomTheme();
              }}
              className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                themeMode === 'random'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-indigo-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span
                className="w-2 h-2 rounded-full border border-white/40"
                style={{ backgroundColor: accentPalette.hex }}
              />
            </button>
          </div>

          {/* Authentication State */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-indigo-300">
                        {user.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-none">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[120px] mt-0.5">{user.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

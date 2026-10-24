import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { Workspace } from './components/workspace/Workspace';
import { AuthModal } from './components/auth/AuthModal';
import { ApiDocsViewer } from './components/common/ApiDocsViewer';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { themeMode } = useTheme();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'workspace'>('landing');
  const [activeRoomId, setActiveRoomId] = useState<string>('room-alpha');
  const [apiDocsOpen, setApiDocsOpen] = useState(false);

  // Check URL parameters on mount for ?room=... or ?invite=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setActiveRoomId(roomParam);
      setCurrentView('workspace');
    } else if (isAuthenticated) {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated]);

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setCurrentView('workspace');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono">Initializing SyncCode Engine...</span>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col font-sans ${
        themeMode === 'white' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Top Navigation */}
      {currentView !== 'workspace' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenApiDocs={() => setApiDocsOpen(true)}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage
            onEnterWorkspace={() => {
              if (isAuthenticated) {
                setCurrentView('dashboard');
              } else {
                // If demo user wants to quickly test workspace
                setActiveRoomId('room-alpha');
                setCurrentView('workspace');
              }
            }}
            onOpenApiDocs={() => setApiDocsOpen(true)}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            onSelectRoom={handleSelectRoom}
            onOpenApiDocs={() => setApiDocsOpen(true)}
          />
        )}

        {currentView === 'workspace' && (
          <Workspace
            roomId={activeRoomId}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onOpenApiDocs={() => setApiDocsOpen(true)}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <ApiDocsViewer isOpen={apiDocsOpen} onClose={() => setApiDocsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

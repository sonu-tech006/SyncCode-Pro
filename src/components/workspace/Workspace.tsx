import React, { useState, useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { collaboration, RemoteAwarenessUser } from '../../services/collaboration';
import { executeCode, isCodeExecutionAvailable } from '../../services/execution';
import { Room, FileItem, RoomMembership, Snapshot, ExecutionResult, UserRole } from '../../types';

import { FileExplorer } from './FileExplorer';
import { VideoCallPanel } from './VideoCallPanel';
import { RoomChat } from './RoomChat';
import { ParticipantsPanel } from './ParticipantsPanel';
import { SnapshotModal } from './SnapshotModal';
import { InviteModal } from './InviteModal';
import { ExecutionPanel } from './ExecutionPanel';

import {
  Play,
  Share2,
  Camera,
  MessageSquare,
  Video,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  FileCode,
  AlertCircle,
  Eye,
  Sliders,
  Type,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

interface WorkspaceProps {
  roomId: string;
  onBackToDashboard: () => void;
  onOpenApiDocs: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ roomId, onBackToDashboard, onOpenApiDocs }) => {
  const { user } = useAuth();
  const {
    themeMode,
    setThemeMode,
    cycleRandomTheme,
    accentPalette,
    editorTheme,
    fontSize,
    wordWrap,
    setEditorTheme,
    setFontSize,
    setWordWrap
  } = useTheme();

  const [room, setRoom] = useState<Room | null>(null);
  const [membership, setMembership] = useState<RoomMembership | null>(null);
  const [participants, setParticipants] = useState<RoomMembership[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState<string>('');
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Right sidebar tab: 'call' | 'chat' | 'participants' | 'none'
  const [rightTab, setRightTab] = useState<'call' | 'chat' | 'participants' | 'none'>('call');
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);

  // Execution state (optional server-side feature)
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecutionConfigured, setIsExecutionConfigured] = useState(false);

  // Modals
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);

  // Remote cursor indicators
  const [remoteCursors, setRemoteCursors] = useState<RemoteAwarenessUser[]>([]);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Initial load
  useEffect(() => {
    loadWorkspace();

    return () => {
      collaboration.disconnect();
    };
  }, [roomId]);

  const loadWorkspace = async () => {
    try {
      const r = await api.getRoom(roomId);
      setRoom(r);

      const mem = await api.joinRoom(roomId);
      setMembership(mem);

      const fList = await api.getFiles(r.projectId);
      setFiles(fList);

      if (fList.length > 0) {
        const first = fList[0];
        setActiveFileId(first.id);
        setActiveFileContent(first.content);
        setOpenTabs([first.id]);

        // Initialize Yjs collaboration for this file
        collaboration.init(roomId, first.id, mem, first.content);
      }

      const pList = await api.getRoomParticipants(roomId);
      setParticipants(pList);

      const sList = await api.getSnapshots(r.projectId);
      setSnapshots(sList);

      // Check server-side code execution feature status
      const execAvailable = await isCodeExecutionAvailable();
      setIsExecutionConfigured(execAvailable);
    } catch (err: any) {
      alert('Error entering workspace: ' + err.message);
      onBackToDashboard();
    }
  };

  // Wire Yjs document and awareness updates
  useEffect(() => {
    const unsubDoc = collaboration.onDocUpdate((newText, origin) => {
      if (origin !== 'local_user') {
        setActiveFileContent(newText);
      }
    });

    const unsubAwareness = collaboration.onAwarenessChange((users) => {
      setRemoteCursors(users.filter(u => u.userId !== user?.id));
    });

    return () => {
      unsubDoc();
      unsubAwareness();
    };
  }, [user]);

  // Handle file selection
  const handleSelectFile = (fileId: string) => {
    if (fileId === activeFileId) return;

    // Save previous file content to memory
    if (activeFileId) {
      api.updateFileContent(activeFileId, activeFileContent);
    }

    const target = files.find(f => f.id === fileId);
    if (!target) return;

    setActiveFileId(fileId);
    setActiveFileContent(target.content);
    setHasUnsavedChanges(false);

    if (!openTabs.includes(fileId)) {
      setOpenTabs([...openTabs, fileId]);
    }

    if (membership && room) {
      collaboration.init(room.id, fileId, membership, target.content);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const remaining = openTabs.filter(id => id !== tabId);
    setOpenTabs(remaining);

    if (activeFileId === tabId && remaining.length > 0) {
      handleSelectFile(remaining[0]);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    const content = value || '';
    setActiveFileContent(content);
    setHasUnsavedChanges(true);

    // Apply to Yjs document
    collaboration.applyLocalChange(content);

    // Debounced persist to API store
    if (activeFileId) {
      api.updateFileContent(activeFileId, content);
    }
  };

  const handleEditorMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Listen to cursor position changes to broadcast awareness
    editor.onDidChangeCursorPosition((e: any) => {
      collaboration.updateCursor({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });
  };

  const handleCreateFile = async (name: string, language: string) => {
    if (!room) return;
    const newFile = await api.createFile(room.projectId, name, '', language);
    setFiles([...files, newFile]);
    handleSelectFile(newFile.id);
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    await api.renameFile(fileId, newName);
    setFiles(files.map(f => f.id === fileId ? { ...f, name: newName, path: `/${newName}` } : f));
  };

  const handleDeleteFile = async (fileId: string) => {
    await api.deleteFile(fileId);
    const remaining = files.filter(f => f.id !== fileId);
    setFiles(remaining);
    setOpenTabs(openTabs.filter(id => id !== fileId));
    if (activeFileId === fileId && remaining.length > 0) {
      handleSelectFile(remaining[0].id);
    }
  };

  const handleRunCode = async () => {
    const activeFile = files.find(f => f.id === activeFileId);
    if (!activeFile) return;

    setShowExecutionPanel(true);

    if (!isExecutionConfigured) {
      setExecResult({
        stdout: '',
        stderr: 'Code execution is not configured yet.',
        exitCode: 1,
        timeMs: 0,
        status: 'SANDBOX_OFFLINE'
      });
      return;
    }

    setIsExecuting(true);
    try {
      const result = await executeCode(activeFileContent, activeFile.language);
      setExecResult(result);
    } catch (err: any) {
      setExecResult({
        stdout: '',
        stderr: err.message || 'Code execution is not configured yet.',
        exitCode: 1,
        timeMs: 0,
        status: 'SANDBOX_OFFLINE'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCreateSnapshot = async (name: string, description?: string) => {
    if (!room) return;
    const newSnap = await api.createSnapshot(room.projectId, room.id, name, description);
    setSnapshots([newSnap, ...snapshots]);
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    const restored = await api.restoreSnapshot(snapshotId);
    // Reload files
    if (room) {
      const updated = await api.getFiles(room.projectId);
      setFiles(updated);
      if (activeFileId) {
        const current = updated.find(f => f.id === activeFileId);
        if (current) {
          setActiveFileContent(current.content);
          if (membership) {
            collaboration.init(room.id, current.id, membership, current.content);
          }
        }
      }
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: UserRole) => {
    if (!room) return;
    await api.updateMemberRole(room.id, targetUserId, newRole);
    const updated = await api.getRoomParticipants(room.id);
    setParticipants(updated);
  };

  const activeFile = files.find(f => f.id === activeFileId);
  const isReadOnly = membership?.role === 'VIEWER';
  const isOwner = membership?.role === 'OWNER';

  return (
    <div className={`h-screen flex flex-col overflow-hidden select-none Workspace-root transition-colors duration-200 ${
      themeMode === 'white' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Workspace Top Action Bar */}
      <div className={`h-12 px-4 border-b flex items-center justify-between shrink-0 workspace-top-bar transition-colors duration-200 ${
        themeMode === 'white' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
      }`}>
        {/* Left: Back & Room info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span className="truncate max-w-[160px] sm:max-w-[240px]">{room?.name}</span>
              {isReadOnly && (
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" />
                  View Only
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Center: Remote Cursor Presence Avatars */}
        <div className="hidden md:flex items-center gap-1.5">
          {remoteCursors.slice(0, 4).map((rc) => (
            <div
              key={rc.userId}
              title={`${rc.name} (${rc.role})`}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
              style={{
                backgroundColor: `${rc.color}15`,
                borderColor: `${rc.color}40`,
                color: rc.color
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rc.color }} />
              <span className="truncate max-w-[80px]">{rc.name}</span>
              {rc.cursor && (
                <span className="font-mono text-[9px] opacity-75">
                  :{rc.cursor.lineNumber}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={!isExecutionConfigured || isExecuting}
            title={!isExecutionConfigured ? 'Code execution is not configured yet.' : 'Run Code'}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              isExecutionConfigured
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-80'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">
              {!isExecutionConfigured ? 'Code Execution Not Configured' : (isExecuting ? 'Running...' : 'Run Code')}
            </span>
          </button>

          {/* Snapshot Button */}
          <button
            onClick={() => setSnapshotModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Snapshot</span>
          </button>

          {/* Invite Link Button */}
          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite (Max 6)</span>
          </button>

          {/* Theme Selector (White, Dark, Random Color) */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
            <button
              title="White Theme"
              onClick={() => setThemeMode('white')}
              className={`p-1.5 rounded-md transition ${
                themeMode === 'white'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            <button
              title="Dark Workspace Theme"
              onClick={() => setThemeMode('dark')}
              className={`p-1.5 rounded-md transition ${
                themeMode === 'dark'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            <button
              title={`Random Color Theme (The Color API) — ${accentPalette.name}`}
              onClick={async () => {
                setThemeMode('random');
                await cycleRandomTheme();
              }}
              className={`p-1.5 rounded-md transition flex items-center gap-1 ${
                themeMode === 'random'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-indigo-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span
                className="w-1.5 h-1.5 rounded-full border border-white/40"
                style={{ backgroundColor: accentPalette.hex }}
              />
            </button>
          </div>

          {/* Right Panel Toggle Tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 ml-1">
            <button
              onClick={() => setRightTab(rightTab === 'call' ? 'none' : 'call')}
              title="Toggle Video Call Panel"
              className={`p-1.5 rounded-md transition ${
                rightTab === 'call'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setRightTab(rightTab === 'chat' ? 'none' : 'chat')}
              title="Toggle Room Chat"
              className={`p-1.5 rounded-md transition ${
                rightTab === 'chat'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setRightTab(rightTab === 'participants' ? 'none' : 'participants')}
              title="Toggle Participants & Presence"
              className={`p-1.5 rounded-md transition ${
                rightTab === 'participants'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Project File Explorer */}
        {showFileExplorer && (
          <FileExplorer
            files={files}
            activeFileId={activeFileId}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onRenameFile={handleRenameFile}
            onDeleteFile={handleDeleteFile}
            isReadOnly={isReadOnly}
          />
        )}

        {/* Center: Monaco Editor & Tabs */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
          {/* Editor Tab Bar */}
          <div className="h-9 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between px-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              {openTabs.map((tabId) => {
                const f = files.find(item => item.id === tabId);
                if (!f) return null;
                const isActive = tabId === activeFileId;

                return (
                  <div
                    key={tabId}
                    onClick={() => handleSelectFile(tabId)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-t text-xs cursor-pointer border-t-2 transition ${
                      isActive
                        ? 'bg-slate-950 text-white border-indigo-500 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{f.name}</span>
                    {hasUnsavedChanges && isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                    {openTabs.length > 1 && (
                      <span
                        onClick={(e) => handleCloseTab(e, tabId)}
                        className="ml-1 text-slate-500 hover:text-white"
                      >
                        ✕
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Editor Settings Controls */}
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span className="text-[11px] font-mono text-slate-500 uppercase">
                {activeFile?.language || 'text'}
              </span>

              {/* Editor Theme Switcher */}
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none"
              >
                <option value="vs-dark">VS Dark</option>
                <option value="light">Light</option>
                <option value="monokai">Monokai</option>
              </select>

              {/* Font Size */}
              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none"
              >
                <option value="12">12px</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
              </select>
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={activeFile?.language || 'plaintext'}
              value={activeFileContent}
              theme={editorTheme}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                readOnly: isReadOnly,
                fontSize,
                wordWrap,
                minimap: { enabled: true },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                renderWhitespace: 'selection',
                bracketPairColorization: { enabled: true },
                tabSize: 4
              }}
            />
          </div>

          {/* Bottom Execution Panel */}
          {showExecutionPanel && (
            <ExecutionPanel
              result={execResult}
              isRunning={isExecuting}
              onRunCode={handleRunCode}
              onClearOutput={() => setExecResult(null)}
              language={activeFile?.language || 'code'}
              isExecutionConfigured={isExecutionConfigured}
            />
          )}
        </div>

        {/* Right Sidebar: Dynamic Panels */}
        {rightTab === 'call' && (
          <VideoCallPanel
            roomId={roomId}
            userId={user?.id || 'anon'}
            userName={user?.name || 'Collaborator'}
            onCallStatusChange={(active) => setIsCallActive(active)}
          />
        )}

        {rightTab === 'chat' && (
          <RoomChat
            roomId={roomId}
            currentUserId={user?.id || 'anon'}
          />
        )}

        {rightTab === 'participants' && (
          <ParticipantsPanel
            participants={participants}
            currentUserId={user?.id || 'anon'}
            isOwner={isOwner}
            onUpdateRole={handleUpdateRole}
          />
        )}
      </div>

      {/* Snapshot Modal */}
      <SnapshotModal
        isOpen={snapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
        snapshots={snapshots}
        currentFiles={files}
        onCreateSnapshot={handleCreateSnapshot}
        onRestoreSnapshot={handleRestoreSnapshot}
        isReadOnly={isReadOnly}
      />

      {/* Invite Modal */}
      {room && (
        <InviteModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          room={room}
          currentParticipantCount={participants.length}
          isOwner={isOwner}
          onRevokeSuccess={loadWorkspace}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Project, Room, Snapshot, ActivityEvent } from '../../types';
import {
  Plus,
  Users,
  Code2,
  FolderGit2,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Shield,
  Layers,
  Camera,
  Play,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  onSelectRoom: (roomId: string) => void;
  onOpenApiDocs: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectRoom, onOpenApiDocs }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');
  
  // Modals
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [joinRoomOpen, setJoinRoomOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // New room state
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomLang, setNewRoomLang] = useState('java');
  const [newRoomVisibility, setNewRoomVisibility] = useState<'PRIVATE' | 'INVITE_ONLY'>('INVITE_ONLY');
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [submittingRoom, setSubmittingRoom] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const p = await api.getProjects();
      setProjects(p);
      if (p.length > 0) {
        const snaps = await api.getSnapshots(p[0].id);
        setSnapshots(snaps);
      }
      // Get rooms from storage
      const rawRooms = localStorage.getItem('synccode_rooms');
      if (rawRooms) {
        setRooms(JSON.parse(rawRooms));
      }
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setSubmittingRoom(true);
    try {
      const result = await api.createRoom({
        name: newRoomName.trim(),
        description: newRoomDesc.trim(),
        language: newRoomLang,
        visibility: newRoomVisibility
      });

      setCreatedInviteUrl(result.inviteUrl);
      await loadData();
    } catch (err: any) {
      alert('Failed to create room: ' + err.message);
    } finally {
      setSubmittingRoom(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    if (!joinCodeInput.trim()) return;

    try {
      // Find room by code or invite token
      const rawRooms = localStorage.getItem('synccode_rooms');
      const allRooms: Room[] = rawRooms ? JSON.parse(rawRooms) : [];
      const trimmed = joinCodeInput.trim();
      const targetRoom = allRooms.find(r => r.id === trimmed || r.invitationToken === trimmed || trimmed.includes(r.id));

      if (!targetRoom) {
        throw new Error('Room not found. Please verify the room ID or invitation token.');
      }

      await api.joinRoom(targetRoom.id, targetRoom.invitationToken);
      setJoinRoomOpen(false);
      onSelectRoom(targetRoom.id);
    } catch (err: any) {
      setJoinError(err.message || 'Unable to join room.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = selectedLang === 'all' || p.defaultLanguage === selectedLang;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.name || 'Engineer'}
            </h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time collaborative workspace. Jump into an existing room or spin up a new session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setJoinRoomOpen(true)}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Join Room</span>
          </button>

          <button
            onClick={() => {
              setCreatedInviteUrl(null);
              setNewRoomName('');
              setNewRoomDesc('');
              setCreateRoomOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Room</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Projects & Active Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left Column: Projects List (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-indigo-400" />
                <span>Recent Projects</span>
              </h2>
              <p className="text-xs text-slate-400">Persistent code repositories stored in MongoDB</p>
            </div>

            {/* Filter and Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-36 sm:w-44 transition"
                />
              </div>

              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Languages</option>
                <option value="java">Java 21</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
              </select>
            </div>
          </div>

          {/* Project Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {proj.defaultLanguage}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Just now
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description || 'Collaborative project workspace.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{proj.collaboratorsCount} Collaborators</span>
                  </div>

                  <button
                    onClick={() => {
                      // Find or associate room for this project
                      const r = rooms.find(item => item.projectId === proj.id) || rooms[0];
                      if (r) onSelectRoom(r.id);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
                  >
                    <span>Open Workspace</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Coding Rooms & Snapshots */}
        <div className="space-y-6">
          {/* Active Rooms */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Rooms
              </h2>
              <span className="text-xs text-indigo-400 font-semibold">{rooms.length} Running</span>
            </div>

            <div className="space-y-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{room.name}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Lang: {room.language}</span>
                      <span>•</span>
                      <span className="text-emerald-400">Capacity: 2/6 active</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectRoom(room.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition"
                  >
                    Enter
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Snapshots */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-400" />
              Recent Snapshots
            </h2>
            <div className="space-y-2.5">
              {snapshots.length > 0 ? (
                snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-white">{snap.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">By {snap.createdBy.name}</p>
                    </div>
                    <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                      {snap.files.length} Files Saved
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No snapshots saved yet. Create one inside the workspace.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      {createRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Create Real-Time Coding Room</h3>
                <p className="text-xs text-slate-400">Capacity strictly limited to 6 concurrent participants</p>
              </div>
              <button
                onClick={() => setCreateRoomOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {!createdInviteUrl ? (
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Task Scheduler Review"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of the collaboration agenda"
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Primary Language
                    </label>
                    <select
                      value={newRoomLang}
                      onChange={(e) => setNewRoomLang(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="java">Java 21</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="javascript">JavaScript</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Visibility
                    </label>
                    <select
                      value={newRoomVisibility}
                      onChange={(e) => setNewRoomVisibility(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="INVITE_ONLY">Invite Only (Secure)</option>
                      <option value="PRIVATE">Private (Owner only)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                  <span>
                    Backend-enforced max limit: strictly 6 active members. LiveKit video calling tokens and Yjs CRDT channels will be generated automatically.
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateRoomOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRoom}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/30"
                  >
                    {submittingRoom ? 'Spinning Up...' : 'Create & Generate Link'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  <p className="font-bold text-sm">Room Successfully Created!</p>
                  <p className="mt-1">
                    Your room is live. Share this cryptographically secure invitation URL with up to 5 teammates (6 participants max).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Shareable Invitation Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdInviteUrl}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 font-mono select-all focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(createdInviteUrl)}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                    >
                      {copiedInvite ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedInvite ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => {
                      setCreateRoomOpen(false);
                      const raw = localStorage.getItem('synccode_rooms');
                      const list = raw ? JSON.parse(raw) : [];
                      if (list.length > 0) onSelectRoom(list[list.length - 1].id);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition"
                  >
                    Enter Workspace Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* JOIN ROOM MODAL */}
      {joinRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Join Collaboration Room</h3>
              <button onClick={() => setJoinRoomOpen(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            {joinError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{joinError}</span>
              </div>
            )}

            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Room ID or Invite URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. room-alpha or full invitation URL"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setJoinRoomOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/30"
                >
                  Validate & Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

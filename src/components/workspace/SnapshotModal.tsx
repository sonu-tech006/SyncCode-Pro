import React, { useState } from 'react';
import { Snapshot, FileItem } from '../../types';
import { Camera, Clock, User, RotateCcw, X, FileCode, Check } from 'lucide-react';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: Snapshot[];
  currentFiles: FileItem[];
  onCreateSnapshot: (name: string, description?: string) => Promise<void>;
  onRestoreSnapshot: (snapshotId: string) => Promise<void>;
  isReadOnly?: boolean;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  currentFiles,
  onCreateSnapshot,
  onRestoreSnapshot,
  isReadOnly = false
}) => {
  const [newSnapName, setNewSnapName] = useState('');
  const [newSnapDesc, setNewSnapDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(snapshots[0] || null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapName.trim()) return;

    setCreating(true);
    try {
      await onCreateSnapshot(newSnapName.trim(), newSnapDesc.trim());
      setNewSnapName('');
      setNewSnapDesc('');
    } catch (err: any) {
      alert('Failed to save snapshot: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('Are you sure you want to restore this snapshot? All current files will be reverted to this version and synchronized across all active collaborators.')) {
      return;
    }
    setRestoringId(id);
    try {
      await onRestoreSnapshot(id);
      onClose();
    } catch (err: any) {
      alert('Restore failed: ' + err.message);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Project Version Snapshots</h3>
              <p className="text-xs text-slate-400">Immutable checkpoints persisted in MongoDB with differential rollback</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left List, Right Diff / Viewer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 flex-1 overflow-hidden">
          {/* Left: Create + List */}
          <div className="md:col-span-1 flex flex-col space-y-4 border-r border-slate-800 pr-4 overflow-y-auto">
            {!isReadOnly && (
              <form onSubmit={handleCreate} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                  New Snapshot
                </span>
                <input
                  type="text"
                  required
                  placeholder="Snapshot name (e.g. v1.2-loom)"
                  value={newSnapName}
                  onChange={(e) => setNewSnapName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newSnapDesc}
                  onChange={(e) => setNewSnapDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={creating || !newSnapName.trim()}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition"
                >
                  {creating ? 'Saving...' : 'Create Snapshot'}
                </button>
              </form>
            )}

            {/* List */}
            <div className="space-y-2 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Saved Checkpoints ({snapshots.length})
              </span>
              {snapshots.map((snap) => {
                const isSelected = selectedSnapshot?.id === snap.id;
                return (
                  <div
                    key={snap.id}
                    onClick={() => setSelectedSnapshot(snap)}
                    className={`p-3 rounded-xl cursor-pointer transition border ${
                      isSelected
                        ? 'bg-purple-500/10 border-purple-500/40 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold truncate">{snap.name}</h4>
                      <span className="text-[10px] text-purple-400 font-mono">
                        {snap.files.length} files
                      </span>
                    </div>
                    {snap.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mb-1">{snap.description}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>By {snap.createdBy.name}</span>
                      <span>{new Date(snap.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Snapshot Detail & File Contents */}
          <div className="md:col-span-2 flex flex-col overflow-hidden">
            {selectedSnapshot ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedSnapshot.name}</h4>
                    <p className="text-xs text-slate-400">
                      Saved by {selectedSnapshot.createdBy.name} on{' '}
                      {new Date(selectedSnapshot.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {!isReadOnly && (
                    <button
                      onClick={() => handleRestore(selectedSnapshot.id)}
                      disabled={restoringId === selectedSnapshot.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition shadow"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{restoringId === selectedSnapshot.id ? 'Restoring...' : 'Restore This Version'}</span>
                    </button>
                  )}
                </div>

                {/* Files in this snapshot */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {selectedSnapshot.files.map((f) => (
                    <div key={f.fileId} className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
                      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <span className="font-mono text-indigo-300 font-semibold">{f.path}</span>
                        <span className="text-[10px] uppercase text-slate-500">{f.language}</span>
                      </div>
                      <pre className="p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
                        {f.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Select a snapshot to inspect file contents and restore.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

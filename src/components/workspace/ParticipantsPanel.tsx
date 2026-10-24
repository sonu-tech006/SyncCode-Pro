import React from 'react';
import { RoomMembership, UserRole } from '../../types';
import { Users, Shield, Edit3, Eye, Crown, Radio, FileCode2 } from 'lucide-react';

interface ParticipantsPanelProps {
  participants: RoomMembership[];
  currentUserId: string;
  isOwner: boolean;
  onUpdateRole: (userId: string, newRole: UserRole) => Promise<void>;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  currentUserId,
  isOwner,
  onUpdateRole
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Crown className="w-2.5 h-2.5" />
            Owner
          </span>
        );
      case 'EDITOR':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Edit3 className="w-2.5 h-2.5" />
            Editor
          </span>
        );
      case 'VIEWER':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            <Eye className="w-2.5 h-2.5" />
            Viewer
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800 w-80 shrink-0 text-slate-300 side-panel-container">
      {/* Panel Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Presence</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {participants.length} / 6 Online
        </span>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {participants.map((mem) => {
          const isSelf = mem.userId === currentUserId;

          return (
            <div
              key={mem.userId}
              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Distinct Cursor Color Indicator */}
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: mem.color }}
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{mem.userName}</span>
                      {isSelf && <span className="text-[10px] text-slate-500">(You)</span>}
                    </h5>
                    <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{mem.userEmail}</p>
                  </div>
                </div>

                {getRoleBadge(mem.role)}
              </div>

              {/* Status and Active file */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synced
                </span>

                {mem.cursorPos && (
                  <span className="font-mono text-[10px] text-slate-500">
                    Ln {mem.cursorPos.lineNumber}, Col {mem.cursorPos.column}
                  </span>
                )}
              </div>

              {/* Owner Role Management Dropdown */}
              {isOwner && !isSelf && (
                <div className="pt-2 flex items-center justify-end gap-1.5">
                  <span className="text-[10px] text-slate-500">Role:</span>
                  <select
                    value={mem.role}
                    onChange={(e) => onUpdateRole(mem.userId, e.target.value as UserRole)}
                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

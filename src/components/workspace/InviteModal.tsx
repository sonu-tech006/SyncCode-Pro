import React, { useState } from 'react';
import { Room } from '../../types';
import { api } from '../../services/api';
import { X, Copy, Check, Shield, AlertTriangle, Users, Key } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  currentParticipantCount: number;
  isOwner: boolean;
  onRevokeSuccess: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  room,
  currentParticipantCount,
  isOwner,
  onRevokeSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = `${window.location.origin}?invite=${room.invitationToken}&room=${room.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async () => {
    if (!confirm('Revoking this invitation link will immediately invalidate it. Outgoing links will no longer grant access. Continue?')) {
      return;
    }
    setRevoking(true);
    try {
      await api.revokeInvitation(room.id);
      onRevokeSuccess();
    } catch (err: any) {
      alert('Failed to revoke invitation: ' + err.message);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Invite Collaborators</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Capacity Warning Banner */}
        <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Room Capacity Limit:</span>
          </div>
          <span className="font-mono font-bold text-emerald-400">
            {currentParticipantCount} / {room.maxParticipants} Active Members
          </span>
        </div>

        {room.invitationRevoked ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs mb-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-bold">This invitation link has been revoked.</p>
              <p className="mt-1">No additional users can join via this link unless a new token is generated.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Shareable Room Invitation URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5" /> Cryptographic Token Validation
              </p>
              <p className="text-[11px] text-slate-400">
                New joiners enter as <strong className="text-white">Editors</strong>. Viewers and Owners can be managed in the participants panel. Max 6 participants strictly enforced on backend.
              </p>
            </div>

            {isOwner && (
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold"
                >
                  {revoking ? 'Revoking...' : 'Revoke Invitation Link'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { webrtc } from '../../services/webrtc';
import { CallParticipant } from '../../types';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  PhoneCall,
  Maximize2,
  Minimize2,
  Volume2,
  Settings,
  Sparkles,
  AlertTriangle,
  User
} from 'lucide-react';

interface VideoCallPanelProps {
  roomId: string;
  userId: string;
  userName: string;
  onCallStatusChange?: (isActive: boolean) => void;
}

export const VideoCallPanel: React.FC<VideoCallPanelProps> = ({
  roomId,
  userId,
  userName,
  onCallStatusChange
}) => {
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [focusedParticipantId, setFocusedParticipantId] = useState<string | null>(null);
  const [livekitConfigOpen, setLivekitConfigOpen] = useState(false);

  // LiveKit credentials
  const [livekitUrl, setLivekitUrl] = useState(() => localStorage.getItem('synccode_lk_url') || 'wss://synccode-demo.livekit.cloud');
  const [livekitKey, setLivekitKey] = useState(() => localStorage.getItem('synccode_lk_key') || 'devkey');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const durationTimerRef = useRef<any>(null);

  useEffect(() => {
    const unsubState = webrtc.onCallStateChange((list, connected) => {
      setParticipants(list);
      setIsInCall(connected);
      if (onCallStatusChange) onCallStatusChange(connected);

      // Bind local video element if stream available
      const local = list.find(p => p.isLocal);
      if (local && local.stream && localVideoRef.current) {
        if (localVideoRef.current.srcObject !== local.stream) {
          localVideoRef.current.srcObject = local.stream;
        }
      }
    });

    const unsubErr = webrtc.onError((err) => {
      setErrorMsg(err);
      setConnecting(false);
    });

    return () => {
      unsubState();
      unsubErr();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [onCallStatusChange]);

  useEffect(() => {
    if (isInCall) {
      durationTimerRef.current = setInterval(() => {
        const secs = webrtc.getCallDuration();
        const mins = Math.floor(secs / 60);
        const remSecs = secs % 60;
        setCallDuration(
          `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      setCallDuration('00:00');
    }
  }, [isInCall]);

  const handleJoinCall = async () => {
    setErrorMsg(null);
    setConnecting(true);
    const success = await webrtc.startCall(roomId, userId, userName);
    setConnecting(false);
    if (success) {
      setIsMuted(!webrtc.isAudioEnabled());
      setIsVideoDisabled(!webrtc.isVideoEnabled());
    }
  };

  const handleLeaveCall = () => {
    webrtc.endCall();
    setIsInCall(false);
    setIsScreenSharing(false);
  };

  const toggleMic = () => {
    const enabled = webrtc.toggleAudio();
    setIsMuted(!enabled);
  };

  const toggleCam = () => {
    const enabled = webrtc.toggleVideo();
    setIsVideoDisabled(!enabled);
  };

  const toggleScreen = async () => {
    const sharing = await webrtc.toggleScreenShare();
    setIsScreenSharing(sharing);
  };

  const saveLivekitConfig = () => {
    localStorage.setItem('synccode_lk_url', livekitUrl);
    localStorage.setItem('synccode_lk_key', livekitKey);
    setLivekitConfigOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800 w-80 shrink-0 select-none side-panel-container">
      {/* Call Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Video Call</span>
          {isInCall && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {callDuration}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLivekitConfigOpen(true)}
            title="LiveKit Server Credentials"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-2.5 bg-red-500/10 border-b border-red-500/20 text-red-300 text-xs flex items-start gap-1.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="ml-2 underline text-red-200 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Video Stage / Call Grid */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {!isInCall ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <PhoneCall className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">LiveKit Audio & Video</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-xs">
              Connect camera and microphone with up to 6 team members. Simultaneous code editing and screen sharing.
            </p>
            <button
              onClick={handleJoinCall}
              disabled={connecting}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {connecting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Join Room Call</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Grid of participant tiles (Max 6) */}
            {participants.map((p) => {
              const isFocused = focusedParticipantId === p.identity;
              return (
                <div
                  key={p.identity}
                  className={`relative rounded-xl overflow-hidden bg-slate-900 border transition ${
                    p.isSpeaking
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'border-slate-800'
                  } ${isFocused ? 'aspect-video w-full' : 'aspect-video w-full'}`}
                >
                  {/* Real video feed or fallback avatar */}
                  {p.isLocal && p.stream && !isVideoDisabled ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${p.isScreenSharing ? '' : 'scale-x-[-1]'}`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-base mb-1">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[11px] text-slate-500">Camera Off</span>
                    </div>
                  )}

                  {/* Tile Overlay Metadata */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-semibold bg-slate-950/80 backdrop-blur-sm text-slate-200 px-2 py-0.5 rounded flex items-center gap-1.5">
                      {p.isSpeaking && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <span className="truncate max-w-[110px]">{p.name}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      {!p.isAudioEnabled && (
                        <span className="p-1 rounded bg-red-500/80 text-white">
                          <MicOff className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {p.isScreenSharing && (
                        <span className="p-1 rounded bg-indigo-500/80 text-white" title="Sharing screen">
                          <MonitorUp className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Persistent Call Toolbar */}
      {isInCall && (
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMic}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              className={`p-2.5 rounded-xl transition ${
                isMuted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleCam}
              title={isVideoDisabled ? 'Turn On Camera' : 'Turn Off Camera'}
              className={`p-2.5 rounded-xl transition ${
                isVideoDisabled
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isVideoDisabled ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleScreen}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
              className={`p-2.5 rounded-xl transition ${
                isScreenSharing
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <MonitorUp className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleLeaveCall}
            title="Leave Call"
            className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LiveKit Cloud Credentials Config Modal */}
      {livekitConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full text-slate-100 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-1">LiveKit WebRTC Settings</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Real WebRTC audio/video runs locally or connects to your LiveKit Cloud project.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  LiveKit Server URL
                </label>
                <input
                  type="text"
                  value={livekitUrl}
                  onChange={(e) => setLivekitUrl(e.target.value)}
                  placeholder="wss://your-project.livekit.cloud"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={livekitKey}
                  onChange={(e) => setLivekitKey(e.target.value)}
                  placeholder="API Key"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setLivekitConfigOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={saveLivekitConfig}
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

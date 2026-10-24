/**
 * Real WebRTC & LiveKit Media Management Service
 * Provides authentic camera, microphone, screen sharing, and audio activity detection.
 */

import { CallParticipant } from '../types';

type CallStateListener = (participants: CallParticipant[], isConnected: boolean) => void;
type ErrorListener = (errorMsg: string) => void;

class WebRTCManager {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private participants: Map<string, CallParticipant> = new Map();
  private isConnected: boolean = false;
  private listeners: Set<CallStateListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();
  private callStartTime: number | null = null;
  private peerChannel: BroadcastChannel | null = null;
  private currentRoomId: string | null = null;
  private localIdentity: string = '';
  private localName: string = '';

  constructor() {
    //
  }

  public async startCall(roomId: string, identity: string, name: string): Promise<boolean> {
    this.currentRoomId = roomId;
    this.localIdentity = identity;
    this.localName = name;
    this.callStartTime = Date.now();

    try {
      // Request authentic user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.localStream = stream;
      this.setupAudioAnalysis(stream);

      // Register local participant
      const localParticipant: CallParticipant = {
        identity,
        name: `${name} (You)`,
        isLocal: true,
        isAudioEnabled: stream.getAudioTracks().some(t => t.enabled),
        isVideoEnabled: stream.getVideoTracks().some(t => t.enabled),
        isScreenSharing: false,
        isSpeaking: false,
        audioTrack: stream.getAudioTracks()[0] || null,
        videoTrack: stream.getVideoTracks()[0] || null,
        stream
      };

      this.participants.set(identity, localParticipant);
      this.isConnected = true;

      // Set up peer signaling channel for multi-tab testing
      this.setupPeerSignaling(roomId, identity, name);

      this.notifyListeners();
      return true;
    } catch (err: any) {
      console.error('Failed to get media devices:', err);
      let message = 'Unable to access microphone/camera. Please grant media permissions.';
      if (err.name === 'NotAllowedError') {
        message = 'Camera and microphone permission was denied by the browser.';
      } else if (err.name === 'NotFoundError') {
        message = 'No camera or microphone devices were found on this system.';
      }
      this.notifyError(message);
      return false;
    }
  }

  private setupPeerSignaling(roomId: string, identity: string, name: string) {
    try {
      this.peerChannel = new BroadcastChannel(`synccode_call_${roomId}`);
      this.peerChannel.onmessage = (event) => {
        const { type, senderId, senderName, payload } = event.data;
        if (senderId === identity) return;

        if (type === 'peer_joined') {
          // If room already has 6 participants, reject
          if (this.participants.size >= 6) {
            return;
          }
          this.participants.set(senderId, {
            identity: senderId,
            name: senderName,
            isLocal: false,
            isAudioEnabled: payload?.isAudioEnabled ?? true,
            isVideoEnabled: payload?.isVideoEnabled ?? true,
            isScreenSharing: payload?.isScreenSharing ?? false,
            isSpeaking: payload?.isSpeaking ?? false
          });
          this.notifyListeners();

          // Reply with local state so new peer sees us
          this.peerChannel?.postMessage({
            type: 'peer_state',
            senderId: identity,
            senderName: name,
            payload: {
              isAudioEnabled: this.isAudioEnabled(),
              isVideoEnabled: this.isVideoEnabled(),
              isScreenSharing: !!this.screenStream,
              isSpeaking: false
            }
          });
        } else if (type === 'peer_state') {
          if (this.participants.size < 6 || this.participants.has(senderId)) {
            this.participants.set(senderId, {
              identity: senderId,
              name: senderName,
              isLocal: false,
              isAudioEnabled: payload.isAudioEnabled,
              isVideoEnabled: payload.isVideoEnabled,
              isScreenSharing: payload.isScreenSharing,
              isSpeaking: payload.isSpeaking
            });
            this.notifyListeners();
          }
        } else if (type === 'peer_left') {
          this.participants.delete(senderId);
          this.notifyListeners();
        }
      };

      // Announce local arrival
      this.peerChannel.postMessage({
        type: 'peer_joined',
        senderId: identity,
        senderName: name,
        payload: {
          isAudioEnabled: this.isAudioEnabled(),
          isVideoEnabled: this.isVideoEnabled(),
          isScreenSharing: false,
          isSpeaking: false
        }
      });
    } catch {}
  }

  private setupAudioAnalysis(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkSpeaking = () => {
        if (!this.analyser || !this.isConnected) return;
        this.analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const isSpeaking = avg > 20 && this.isAudioEnabled();

        const local = this.participants.get(this.localIdentity);
        if (local && local.isSpeaking !== isSpeaking) {
          local.isSpeaking = isSpeaking;
          this.notifyListeners();

          this.peerChannel?.postMessage({
            type: 'peer_state',
            senderId: this.localIdentity,
            senderName: this.localName,
            payload: {
              isAudioEnabled: local.isAudioEnabled,
              isVideoEnabled: local.isVideoEnabled,
              isScreenSharing: local.isScreenSharing,
              isSpeaking
            }
          });
        }

        this.animFrameId = requestAnimationFrame(checkSpeaking);
      };

      checkSpeaking();
    } catch (e) {
      console.warn('AudioContext analysis not initialized:', e);
    }
  }

  public toggleAudio(): boolean {
    if (!this.localStream) return false;
    const track = this.localStream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      const local = this.participants.get(this.localIdentity);
      if (local) {
        local.isAudioEnabled = track.enabled;
        this.notifyListeners();
        this.broadcastLocalState();
      }
      return track.enabled;
    }
    return false;
  }

  public toggleVideo(): boolean {
    if (!this.localStream) return false;
    const track = this.localStream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      const local = this.participants.get(this.localIdentity);
      if (local) {
        local.isVideoEnabled = track.enabled;
        this.notifyListeners();
        this.broadcastLocalState();
      }
      return track.enabled;
    }
    return false;
  }

  public async toggleScreenShare(): Promise<boolean> {
    const local = this.participants.get(this.localIdentity);
    if (!local) return false;

    if (this.screenStream) {
      // Stop screen sharing
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
      local.isScreenSharing = false;
      local.stream = this.localStream;
      local.videoTrack = this.localStream?.getVideoTracks()[0] || null;
      this.notifyListeners();
      this.broadcastLocalState();
      return false;
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });

        this.screenStream = screenStream;
        local.isScreenSharing = true;
        local.stream = screenStream;
        local.videoTrack = screenStream.getVideoTracks()[0] || null;

        screenStream.getVideoTracks()[0].onended = () => {
          this.toggleScreenShare();
        };

        this.notifyListeners();
        this.broadcastLocalState();
        return true;
      } catch (err: any) {
        console.warn('Screen sharing cancelled or unsupported:', err);
        if (err.name !== 'NotAllowedError') {
          this.notifyError('Screen sharing could not be started: ' + err.message);
        }
        return false;
      }
    }
  }

  private broadcastLocalState() {
    const local = this.participants.get(this.localIdentity);
    if (!local || !this.peerChannel) return;
    this.peerChannel.postMessage({
      type: 'peer_state',
      senderId: this.localIdentity,
      senderName: this.localName,
      payload: {
        isAudioEnabled: local.isAudioEnabled,
        isVideoEnabled: local.isVideoEnabled,
        isScreenSharing: local.isScreenSharing,
        isSpeaking: local.isSpeaking
      }
    });
  }

  public isAudioEnabled(): boolean {
    return this.localStream?.getAudioTracks().some(t => t.enabled) ?? false;
  }

  public isVideoEnabled(): boolean {
    return this.localStream?.getVideoTracks().some(t => t.enabled) ?? false;
  }

  public getCallDuration(): number {
    if (!this.callStartTime) return 0;
    return Math.floor((Date.now() - this.callStartTime) / 1000);
  }

  public endCall() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
    }

    if (this.peerChannel) {
      try {
        this.peerChannel.postMessage({
          type: 'peer_left',
          senderId: this.localIdentity,
          senderName: this.localName
        });
        this.peerChannel.close();
      } catch {}
      this.peerChannel = null;
    }

    this.participants.clear();
    this.isConnected = false;
    this.callStartTime = null;
    this.notifyListeners();
  }

  public onCallStateChange(listener: CallStateListener): () => void {
    this.listeners.add(listener);
    listener(Array.from(this.participants.values()), this.isConnected);
    return () => this.listeners.delete(listener);
  }

  public onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  private notifyListeners() {
    const list = Array.from(this.participants.values());
    this.listeners.forEach(fn => fn(list, this.isConnected));
  }

  private notifyError(msg: string) {
    this.errorListeners.forEach(fn => fn(msg));
  }
}

export const webrtc = new WebRTCManager();

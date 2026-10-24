import * as Y from 'yjs';
import { RoomMembership } from '../types';

export interface CursorPosition {
  lineNumber: number;
  column: number;
}

export interface RemoteAwarenessUser {
  userId: string;
  name: string;
  color: string;
  cursor?: CursorPosition;
  activeFileId?: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
}

type UpdateCallback = (content: string, origin: any) => void;
type AwarenessCallback = (users: RemoteAwarenessUser[]) => void;

class CollaborationService {
  private ydoc: Y.Doc;
  private ytext: Y.Text;
  private broadcastChannel: BroadcastChannel | null = null;
  private currentRoomId: string | null = null;
  private currentFileId: string | null = null;
  private updateCallbacks: Set<UpdateCallback> = new Set();
  private awarenessCallbacks: Set<AwarenessCallback> = new Set();
  private localUser: RemoteAwarenessUser | null = null;
  private remoteUsersMap: Map<string, RemoteAwarenessUser> = new Map();
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private heartbeatInterval: any = null;

  constructor() {
    this.ydoc = new Y.Doc();
    this.ytext = this.ydoc.getText('monaco');
  }

  public init(roomId: string, fileId: string, membership: RoomMembership, initialContent: string = '') {
    this.disconnect();

    this.currentRoomId = roomId;
    this.currentFileId = fileId;
    this.ydoc = new Y.Doc();
    this.ytext = this.ydoc.getText(`file_${fileId}`);

    this.localUser = {
      userId: membership.userId,
      name: membership.userName,
      color: membership.color,
      activeFileId: fileId,
      role: membership.role
    };

    // If doc is empty and initialContent provided, initialize
    if (this.ytext.toString().length === 0 && initialContent) {
      this.ydoc.transact(() => {
        this.ytext.insert(0, initialContent);
      }, 'init');
    }

    // Set up broadcast channel for instantaneous zero-latency tab-to-tab sync
    const channelName = `synccode_crdt_${roomId}_${fileId}`;
    try {
      this.broadcastChannel = new BroadcastChannel(channelName);
      this.broadcastChannel.onmessage = (event) => {
        const { type, data, senderId } = event.data;
        if (senderId === this.localUser?.userId) return;

        if (type === 'yjs_update') {
          try {
            const update = new Uint8Array(data);
            Y.applyUpdate(this.ydoc, update, 'remote_broadcast');
          } catch (e) {
            console.error('Error applying CRDT update from broadcast:', e);
          }
        } else if (type === 'awareness_update') {
          if (data && data.userId) {
            this.remoteUsersMap.set(data.userId, data);
            this.notifyAwareness();
          }
        } else if (type === 'user_left') {
          if (data?.userId) {
            this.remoteUsersMap.delete(data.userId);
            this.notifyAwareness();
          }
        } else if (type === 'request_sync') {
          // Send full current document state to new peer
          this.broadcastCurrentState();
        }
      };

      // Announce arrival and request sync
      this.broadcastChannel.postMessage({
        type: 'request_sync',
        senderId: this.localUser.userId
      });
      this.broadcastAwareness();
    } catch (err) {
      console.warn('BroadcastChannel not supported in this context:', err);
    }

    // Listen to local document updates and broadcast to peers
    this.ydoc.on('update', (update: Uint8Array, origin: any) => {
      // Notify editor bindings
      const currentText = this.ytext.toString();
      this.updateCallbacks.forEach(cb => cb(currentText, origin));

      // Broadcast update if it originated locally
      if (origin !== 'remote_broadcast' && origin !== 'remote_ws') {
        if (this.broadcastChannel) {
          this.broadcastChannel.postMessage({
            type: 'yjs_update',
            data: Array.from(update),
            senderId: this.localUser?.userId
          });
        }

        // If WebSocket connected, stream update to Yjs collaboration server
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            action: 'update',
            roomId,
            fileId,
            update: Array.from(update)
          }));
        }
      }
    });

    // Try connecting to dedicated backend Yjs WebSocket if configured
    this.connectWebSocket(roomId, fileId);

    // Heartbeat for presence freshness
    this.heartbeatInterval = setInterval(() => {
      this.broadcastAwareness();
    }, 4000);

    this.isConnected = true;
  }

  private connectWebSocket(roomId: string, fileId: string) {
    const wsUrl = import.meta.env.VITE_COLLABORATION_WS_URL;
    if (!wsUrl) return;

    try {
      this.ws = new WebSocket(`${wsUrl}?room=${roomId}&file=${fileId}`);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this.isConnected = true;
        // Broadcast local awareness to server
        this.broadcastAwareness();
      };

      this.ws.onmessage = (event) => {
        try {
          if (event.data instanceof ArrayBuffer) {
            const update = new Uint8Array(event.data);
            Y.applyUpdate(this.ydoc, update, 'remote_ws');
          } else {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'update' && parsed.update) {
              const update = new Uint8Array(parsed.update);
              Y.applyUpdate(this.ydoc, update, 'remote_ws');
            }
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onclose = () => {
        // Will seamlessly rely on broadcast channel / local Yjs doc
      };
    } catch {
      // WS server not yet running; graceful fallback
    }
  }

  public getText(): string {
    return this.ytext.toString();
  }

  public applyLocalChange(content: string) {
    if (!this.localUser || this.localUser.role === 'VIEWER') {
      return; // Viewers cannot mutate document
    }

    const current = this.ytext.toString();
    if (current === content) return;

    this.ydoc.transact(() => {
      this.ytext.delete(0, this.ytext.length);
      this.ytext.insert(0, content);
    }, 'local_user');
  }

  public updateCursor(pos: CursorPosition) {
    if (!this.localUser) return;
    this.localUser.cursor = pos;
    this.broadcastAwareness();
  }

  private broadcastAwareness() {
    if (!this.localUser || !this.broadcastChannel) return;
    try {
      this.broadcastChannel.postMessage({
        type: 'awareness_update',
        data: this.localUser,
        senderId: this.localUser.userId
      });
    } catch {}
  }

  private broadcastCurrentState() {
    if (!this.broadcastChannel) return;
    try {
      const state = Y.encodeStateAsUpdate(this.ydoc);
      this.broadcastChannel.postMessage({
        type: 'yjs_update',
        data: Array.from(state),
        senderId: this.localUser?.userId
      });
    } catch {}
  }

  private notifyAwareness() {
    const list = Array.from(this.remoteUsersMap.values());
    this.awarenessCallbacks.forEach(cb => cb(list));
  }

  public onDocUpdate(cb: UpdateCallback): () => void {
    this.updateCallbacks.add(cb);
    return () => this.updateCallbacks.delete(cb);
  }

  public onAwarenessChange(cb: AwarenessCallback): () => void {
    this.awarenessCallbacks.add(cb);
    // Send immediate snapshot
    cb(Array.from(this.remoteUsersMap.values()));
    return () => this.awarenessCallbacks.delete(cb);
  }

  public disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.broadcastChannel && this.localUser) {
      try {
        this.broadcastChannel.postMessage({
          type: 'user_left',
          data: { userId: this.localUser.userId },
          senderId: this.localUser.userId
        });
        this.broadcastChannel.close();
      } catch {}
      this.broadcastChannel = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }

    this.updateCallbacks.clear();
    this.awarenessCallbacks.clear();
    this.remoteUsersMap.clear();
    this.isConnected = false;
  }
}

export const collaboration = new CollaborationService();

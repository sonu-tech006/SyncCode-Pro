export type UserRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  themePreference?: 'dark' | 'white' | 'random';
  customAccentColor?: string;
  editorTheme?: 'vs-dark' | 'light' | 'monokai';
  fontSize?: number;
  wordWrap?: 'on' | 'off';
  createdAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  defaultLanguage: string;
  visibility: 'PRIVATE' | 'INVITE_ONLY';
  createdAt: string;
  updatedAt: string;
  collaboratorsCount: number;
}

export interface Room {
  id: string;
  projectId: string;
  ownerId: string;
  name: string;
  description?: string;
  language: string;
  visibility: 'PRIVATE' | 'INVITE_ONLY';
  invitationToken: string;
  invitationExpiresAt: string;
  invitationRevoked: boolean;
  maxParticipants: number; // strictly 6
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface RoomMembership {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: UserRole;
  joinedAt: string;
  status: 'ONLINE' | 'OFFLINE';
  activeFileId?: string;
  cursorPos?: { lineNumber: number; column: number };
  color: string;
}

export interface FileItem {
  id: string;
  projectId: string;
  parentFolderId: string | null;
  name: string;
  path: string;
  language: string;
  isFolder: boolean;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Snapshot {
  id: string;
  projectId: string;
  roomId: string;
  createdBy: {
    id: string;
    name: string;
  };
  name: string;
  description?: string;
  files: Array<{
    fileId: string;
    path: string;
    name: string;
    language: string;
    content: string;
  }>;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  createdAt: string;
  systemMessage?: boolean;
}

export interface ActivityEvent {
  id: string;
  projectId: string;
  roomId: string;
  actorId: string;
  actorName: string;
  eventType: 'JOIN_ROOM' | 'LEAVE_ROOM' | 'CREATE_FILE' | 'DELETE_FILE' | 'RESTORE_SNAPSHOT' | 'ROLE_CHANGE';
  metadata: string;
  createdAt: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  compileOutput?: string;
  exitCode: number;
  timeMs: number;
  memoryKb?: number;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'SANDBOX_OFFLINE';
}

export interface LiveKitCallConfig {
  livekitUrl: string;
  token?: string;
  apiKey?: string;
  apiSecret?: string;
  isConfigured: boolean;
}

export interface CallParticipant {
  identity: string;
  name: string;
  isLocal: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  audioTrack?: MediaStreamTrack | null;
  videoTrack?: MediaStreamTrack | null;
  stream?: MediaStream | null;
}

export interface SystemConfig {
  codeExecutionEnabled: boolean;
  codeExecutionStatusMessage: string;
  liveKitConfigured: boolean;
  collaborationPort: number;
  maxRoomParticipants: number;
}

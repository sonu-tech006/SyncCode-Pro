import {
  User,
  Project,
  Room,
  RoomMembership,
  FileItem,
  Snapshot,
  ChatMessage,
  ActivityEvent,
  UserRole,
  SystemConfig
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Seed initial demo data for immediate rich experience
const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Devin Vance',
    email: 'devin@synccode.dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    themePreference: 'dark',
    editorTheme: 'vs-dark',
    fontSize: 14,
    wordWrap: 'on',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'user-2',
    name: 'Sarah Chen',
    email: 'sarah.chen@synccode.dev',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    themePreference: 'dark',
    editorTheme: 'vs-dark',
    fontSize: 14,
    wordWrap: 'on',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: 'user-3',
    name: 'Alex Rivera',
    email: 'alex.rivera@synccode.dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    themePreference: 'dark',
    editorTheme: 'vs-dark',
    fontSize: 14,
    wordWrap: 'on',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    ownerId: 'user-1',
    name: 'Concurrent-Order-Processor',
    description: 'High-throughput microservice in Java 21 utilizing Virtual Threads and MongoDB change streams.',
    defaultLanguage: 'java',
    visibility: 'PRIVATE',
    collaboratorsCount: 3,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    ownerId: 'user-1',
    name: 'Realtime-CRDT-Engine',
    description: 'Conflict-free replicated data types and operational transformation algorithms in TypeScript.',
    defaultLanguage: 'typescript',
    visibility: 'INVITE_ONLY',
    collaboratorsCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'proj-3',
    ownerId: 'user-1',
    name: 'Distributed-Cache-Cluster',
    description: 'Consistent hashing ring implementation and raft consensus node in Python.',
    defaultLanguage: 'python',
    visibility: 'INVITE_ONLY',
    collaboratorsCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

const INITIAL_FILES: FileItem[] = [
  {
    id: 'file-java-main',
    projectId: 'proj-1',
    parentFolderId: null,
    name: 'OrderProcessorService.java',
    path: '/src/main/java/OrderProcessorService.java',
    language: 'java',
    isFolder: false,
    content: `package com.synccode.engine;

import java.time.Instant;
import java.util.concurrent.*;
import java.util.UUID;

/**
 * Concurrent Order Processor using Java 21 Virtual Threads
 * Real-time collaborative workspace synchronization enabled.
 */
public class OrderProcessorService {

    private final ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();
    private final ConcurrentHashMap<String, OrderRecord> activeOrders = new ConcurrentHashMap<>();

    public record OrderRecord(String orderId, String userId, double amount, Instant timestamp) {}

    public CompletableFuture<String> submitOrder(String userId, double amount) {
        return CompletableFuture.supplyAsync(() -> {
            String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8);
            OrderRecord order = new OrderRecord(orderId, userId, amount, Instant.now());
            activeOrders.put(orderId, order);
            
            // Simulate distributed ledger validation
            System.out.printf("[V-Thread %s] Processing order %s for $%.2f%n", 
                Thread.currentThread(), orderId, amount);
                
            return orderId;
        }, virtualExecutor);
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== SyncCode Java 21 Virtual Thread Engine Initialized ===");
        OrderProcessorService service = new OrderProcessorService();
        
        var future = service.submitOrder("usr_alpha_9", 429.50);
        System.out.println("Order dispatched successfully: " + future.get());
    }
}
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'file-java-test',
    projectId: 'proj-1',
    parentFolderId: null,
    name: 'OrderProcessorTest.java',
    path: '/src/test/java/OrderProcessorTest.java',
    language: 'java',
    isFolder: false,
    content: `package com.synccode.engine;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class OrderProcessorTest {

    @Test
    void testVirtualThreadOrderExecution() throws Exception {
        OrderProcessorService service = new OrderProcessorService();
        var future = service.submitOrder("usr_test_100", 199.99);
        assertNotNull(future.get());
        assertTrue(future.get().startsWith("ORD-"));
    }
}
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'file-readme',
    projectId: 'proj-1',
    parentFolderId: null,
    name: 'README.md',
    path: '/README.md',
    language: 'markdown',
    isFolder: false,
    content: `# Concurrent-Order-Processor

Collaborative Java 21 workspace created on **SyncCode**.

### Features:
- Spring Boot 3.3.x Architecture
- Java 21 Virtual Threads (Project Loom)
- MongoDB persistent event log
- Yjs real-time document CRDT convergence
- Integrated LiveKit video conferencing for up to 6 team members
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-alpha',
    projectId: 'proj-1',
    ownerId: 'user-1',
    name: 'Sprint 42 Architecture Review',
    description: 'Pair programming on virtual threads and concurrent database sync.',
    language: 'java',
    visibility: 'INVITE_ONLY',
    invitationToken: 'sync-tok-99882244',
    invitationExpiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    invitationRevoked: false,
    maxParticipants: 6,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to access LocalStorage persistence
function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(`synccode_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`synccode_${key}`, JSON.stringify(val));
  } catch (err) {
    console.error(`Failed to persist ${key}:`, err);
  }
}

// Ensure mock store is initialized
function initStorage() {
  if (!localStorage.getItem('synccode_users')) {
    setStored('users', INITIAL_USERS);
  }
  if (!localStorage.getItem('synccode_projects')) {
    setStored('projects', INITIAL_PROJECTS);
  }
  if (!localStorage.getItem('synccode_files')) {
    setStored('files', INITIAL_FILES);
  }
  if (!localStorage.getItem('synccode_rooms')) {
    setStored('rooms', INITIAL_ROOMS);
  }
  if (!localStorage.getItem('synccode_memberships')) {
    const initialMemberships: RoomMembership[] = [
      {
        id: 'mem-1',
        roomId: 'room-alpha',
        userId: 'user-1',
        userName: 'Devin Vance',
        userEmail: 'devin@synccode.dev',
        role: 'OWNER',
        joinedAt: new Date().toISOString(),
        status: 'ONLINE',
        activeFileId: 'file-java-main',
        color: '#6366F1'
      },
      {
        id: 'mem-2',
        roomId: 'room-alpha',
        userId: 'user-2',
        userName: 'Sarah Chen',
        userEmail: 'sarah.chen@synccode.dev',
        role: 'EDITOR',
        joinedAt: new Date().toISOString(),
        status: 'ONLINE',
        activeFileId: 'file-java-main',
        color: '#10B981'
      }
    ];
    setStored('memberships', initialMemberships);
  }
  if (!localStorage.getItem('synccode_messages')) {
    const initialMessages: ChatMessage[] = [
      {
        id: 'msg-1',
        roomId: 'room-alpha',
        senderId: 'user-1',
        senderName: 'Devin Vance',
        message: 'Welcome everyone! Let us review the Java 21 OrderProcessorService implementation.',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'msg-2',
        roomId: 'room-alpha',
        senderId: 'user-2',
        senderName: 'Sarah Chen',
        message: 'I added the unit tests in OrderProcessorTest.java. Virtual threads look rock solid.',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    setStored('messages', initialMessages);
  }
}

initStorage();

export const api = {
  // --- AUTHENTICATION ---
  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('synccode_auth_token');
    if (!token) return null;
    const users = getStored<User[]>('users', INITIAL_USERS);
    const userId = localStorage.getItem('synccode_current_user_id');
    const found = users.find(u => u.id === userId);
    return found || users[0] || null;
  },

  async register(name: string, email: string, password: string):Promise<{ user: User; token: string }> {
    const users = getStored<User[]>('users', INITIAL_USERS);
    const normalized = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === normalized)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: normalized,
      themePreference: 'dark',
      editorTheme: 'vs-dark',
      fontSize: 14,
      wordWrap: 'on',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setStored('users', users);
    const token = `jwt_mock_${newUser.id}_${Date.now()}`;
    localStorage.setItem('synccode_auth_token', token);
    localStorage.setItem('synccode_current_user_id', newUser.id);
    return { user: newUser, token };
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const users = getStored<User[]>('users', INITIAL_USERS);
    const normalized = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === normalized);
    if (!user) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }
    const token = `jwt_mock_${user.id}_${Date.now()}`;
    localStorage.setItem('synccode_auth_token', token);
    localStorage.setItem('synccode_current_user_id', user.id);
    return { user, token };
  },

  async logout(): Promise<void> {
    localStorage.removeItem('synccode_auth_token');
    localStorage.removeItem('synccode_current_user_id');
  },

  // --- PROJECTS ---
  async getProjects(): Promise<Project[]> {
    return getStored<Project[]>('projects', INITIAL_PROJECTS);
  },

  async getProject(projectId: string): Promise<Project> {
    const projects = getStored<Project[]>('projects', INITIAL_PROJECTS);
    const p = projects.find(item => item.id === projectId);
    if (!p) throw new Error(`Project ${projectId} not found`);
    return p;
  },

  async createProject(name: string, description: string, defaultLanguage: string): Promise<Project> {
    const projects = getStored<Project[]>('projects', INITIAL_PROJECTS);
    const userId = localStorage.getItem('synccode_current_user_id') || 'user-1';
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      ownerId: userId,
      name,
      description,
      defaultLanguage,
      visibility: 'PRIVATE',
      collaboratorsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.unshift(newProj);
    setStored('projects', projects);

    // Create starter file for this language
    const starterExt = defaultLanguage === 'java' ? 'java' : defaultLanguage === 'python' ? 'py' : 'ts';
    const starterContent = defaultLanguage === 'java'
      ? `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from SyncCode!");\n    }\n}\n`
      : defaultLanguage === 'python'
      ? `def main():\n    print("Hello from SyncCode!")\n\nif __name__ == "__main__":\n    main()\n`
      : `console.log("Hello from SyncCode!");\n`;

    await this.createFile(newProj.id, `Main.${starterExt}`, starterContent, defaultLanguage);
    return newProj;
  },

  // --- FILES ---
  async getFiles(projectId: string): Promise<FileItem[]> {
    const files = getStored<FileItem[]>('files', INITIAL_FILES);
    return files.filter(f => f.projectId === projectId);
  },

  async createFile(projectId: string, name: string, content: string = '', language: string = 'java', parentFolderId: string | null = null): Promise<FileItem> {
    const files = getStored<FileItem[]>('files', INITIAL_FILES);
    const newFile: FileItem = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      projectId,
      parentFolderId,
      name,
      path: `/${name}`,
      language,
      isFolder: false,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    files.push(newFile);
    setStored('files', files);
    return newFile;
  },

  async updateFileContent(fileId: string, content: string): Promise<void> {
    const files = getStored<FileItem[]>('files', INITIAL_FILES);
    const idx = files.findIndex(f => f.id === fileId);
    if (idx !== -1) {
      files[idx].content = content;
      files[idx].updatedAt = new Date().toISOString();
      setStored('files', files);
    }
  },

  async renameFile(fileId: string, newName: string): Promise<void> {
    const files = getStored<FileItem[]>('files', INITIAL_FILES);
    const idx = files.findIndex(f => f.id === fileId);
    if (idx !== -1) {
      files[idx].name = newName;
      files[idx].path = `/${newName}`;
      setStored('files', files);
    }
  },

  async deleteFile(fileId: string): Promise<void> {
    const files = getStored<FileItem[]>('files', INITIAL_FILES);
    const filtered = files.filter(f => f.id !== fileId);
    setStored('files', filtered);
  },

  // --- ROOMS & CONCURRENCY LIMITS ---
  async getRoom(roomId: string): Promise<Room> {
    const rooms = getStored<Room[]>('rooms', INITIAL_ROOMS);
    const room = rooms.find(r => r.id === roomId);
    if (!room) throw new Error(`Room with ID ${roomId} was not found.`);
    return room;
  },

  async createRoom(params: {
    name: string;
    description?: string;
    language: string;
    projectId?: string;
    visibility?: 'PRIVATE' | 'INVITE_ONLY';
  }): Promise<{ room: Room; inviteUrl: string }> {
    const rooms = getStored<Room[]>('rooms', INITIAL_ROOMS);
    const userId = localStorage.getItem('synccode_current_user_id') || 'user-1';
    
    // Create new project if none passed
    let pId = params.projectId;
    if (!pId) {
      const proj = await this.createProject(params.name, params.description || '', params.language);
      pId = proj.id;
    }

    const roomId = `room-${Math.random().toString(36).substring(2, 9)}`;
    const inviteToken = `sync-tok-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    
    const newRoom: Room = {
      id: roomId,
      projectId: pId,
      ownerId: userId,
      name: params.name,
      description: params.description,
      language: params.language,
      visibility: params.visibility || 'INVITE_ONLY',
      invitationToken: inviteToken,
      invitationExpiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      invitationRevoked: false,
      maxParticipants: 6, // Strictly 6 max
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    rooms.push(newRoom);
    setStored('rooms', rooms);

    // Register owner membership
    const memberships = getStored<RoomMembership[]>('memberships', []);
    const users = getStored<User[]>('users', INITIAL_USERS);
    const user = users.find(u => u.id === userId) || users[0];

    memberships.push({
      id: `mem-${Date.now()}`,
      roomId,
      userId,
      userName: user?.name || 'Owner',
      userEmail: user?.email || 'owner@synccode.dev',
      role: 'OWNER',
      joinedAt: new Date().toISOString(),
      status: 'ONLINE',
      color: '#6366F1'
    });
    setStored('memberships', memberships);

    const inviteUrl = `${window.location.origin}?invite=${inviteToken}&room=${roomId}`;
    return { room: newRoom, inviteUrl };
  },

  async joinRoom(roomId: string, inviteToken?: string): Promise<RoomMembership> {
    const room = await this.getRoom(roomId);
    if (room.status !== 'ACTIVE') {
      throw new Error('This collaboration room has been closed or archived.');
    }

    if (room.invitationRevoked) {
      throw new Error('This invitation link has been revoked by the room owner.');
    }

    if (new Date(room.invitationExpiresAt) < new Date()) {
      throw new Error('This invitation link has expired.');
    }

    const memberships = getStored<RoomMembership[]>('memberships', []);
    const roomMembers = memberships.filter(m => m.roomId === roomId && m.status === 'ONLINE');

    const userId = localStorage.getItem('synccode_current_user_id') || 'user-1';
    const existing = memberships.find(m => m.roomId === roomId && m.userId === userId);

    // Check strict max 6 participant constraint
    if (!existing && roomMembers.length >= room.maxParticipants) {
      throw new Error(
        `Room capacity reached: This workspace has reached its limit of ${room.maxParticipants} concurrent members. Additional connections are rejected.`
      );
    }

    const users = getStored<User[]>('users', INITIAL_USERS);
    const user = users.find(u => u.id === userId) || users[0];

    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'];
    const assignedColor = colors[roomMembers.length % colors.length];

    if (existing) {
      existing.status = 'ONLINE';
      setStored('memberships', memberships);
      return existing;
    }

    const newMembership: RoomMembership = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      roomId,
      userId,
      userName: user.name,
      userEmail: user.email,
      role: 'EDITOR', // Default new joins as Editor
      joinedAt: new Date().toISOString(),
      status: 'ONLINE',
      color: assignedColor
    };

    memberships.push(newMembership);
    setStored('memberships', memberships);

    // Broadcast join event
    this.addChatMessage(roomId, `${user.name} joined the collaboration session.`, true);

    return newMembership;
  },

  async leaveRoom(roomId: string): Promise<void> {
    const userId = localStorage.getItem('synccode_current_user_id');
    const memberships = getStored<RoomMembership[]>('memberships', []);
    const mem = memberships.find(m => m.roomId === roomId && m.userId === userId);
    if (mem) {
      mem.status = 'OFFLINE';
      setStored('memberships', memberships);
      this.addChatMessage(roomId, `${mem.userName} left the workspace.`, true);
    }
  },

  async getRoomParticipants(roomId: string): Promise<RoomMembership[]> {
    const memberships = getStored<RoomMembership[]>('memberships', []);
    return memberships.filter(m => m.roomId === roomId && m.status === 'ONLINE');
  },

  async updateMemberRole(roomId: string, targetUserId: string, newRole: UserRole): Promise<void> {
    const currentUserId = localStorage.getItem('synccode_current_user_id');
    const memberships = getStored<RoomMembership[]>('memberships', []);
    const requester = memberships.find(m => m.roomId === roomId && m.userId === currentUserId);
    
    if (requester?.role !== 'OWNER') {
      throw new Error('Permission Denied: Only the room owner can modify member roles.');
    }

    const target = memberships.find(m => m.roomId === roomId && m.userId === targetUserId);
    if (target) {
      target.role = newRole;
      setStored('memberships', memberships);
      this.addChatMessage(roomId, `${target.userName}'s permissions were updated to ${newRole}.`, true);
    }
  },

  async revokeInvitation(roomId: string): Promise<void> {
    const rooms = getStored<Room[]>('rooms', INITIAL_ROOMS);
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.invitationRevoked = true;
      setStored('rooms', rooms);
    }
  },

  // --- LIVEKIT CALL TOKEN GENERATION ---
  async getLiveKitCallToken(roomId: string): Promise<{ token: string; serverUrl: string }> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

    const participants = await this.getRoomParticipants(roomId);
    if (participants.length > 6) {
      throw new Error('LiveKit calling capacity exceeded (Max 6 participants per room)');
    }

    // Return token configuration (in connected mode calls Spring Boot endpoint)
    const serverUrl = import.meta.env.VITE_LIVEKIT_URL || 'wss://synccode-demo.livekit.cloud';
    const mockToken = `livekit_tok_${btoa(JSON.stringify({ room: roomId, identity: user.id, name: user.name, exp: Date.now() + 3600000 }))}`;

    return {
      token: mockToken,
      serverUrl
    };
  },

  // --- CHAT MESSAGES ---
  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    const messages = getStored<ChatMessage[]>('messages', []);
    return messages.filter(m => m.roomId === roomId);
  },

  async addChatMessage(roomId: string, text: string, isSystem: boolean = false): Promise<ChatMessage> {
    const messages = getStored<ChatMessage[]>('messages', []);
    const user = await this.getCurrentUser();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      roomId,
      senderId: isSystem ? 'system' : (user?.id || 'anonymous'),
      senderName: isSystem ? 'SyncCode System' : (user?.name || 'Anonymous'),
      senderAvatar: isSystem ? undefined : user?.avatar,
      message: text,
      createdAt: new Date().toISOString(),
      systemMessage: isSystem
    };
    messages.push(newMsg);
    setStored('messages', messages);
    return newMsg;
  },

  // --- SNAPSHOTS ---
  async createSnapshot(projectId: string, roomId: string, name: string, description?: string): Promise<Snapshot> {
    const snapshots = getStored<Snapshot[]>('snapshots', []);
    const files = await this.getFiles(projectId);
    const user = await this.getCurrentUser();

    const newSnapshot: Snapshot = {
      id: `snap-${Date.now()}`,
      projectId,
      roomId,
      name,
      description,
      createdBy: {
        id: user?.id || 'user-1',
        name: user?.name || 'Devin Vance'
      },
      files: files.map(f => ({
        fileId: f.id,
        path: f.path,
        name: f.name,
        language: f.language,
        content: f.content
      })),
      createdAt: new Date().toISOString()
    };

    snapshots.unshift(newSnapshot);
    setStored('snapshots', snapshots);
    this.addChatMessage(roomId, `Snapshot "${name}" was created by ${newSnapshot.createdBy.name}.`, true);
    return newSnapshot;
  },

  async getSnapshots(projectId: string): Promise<Snapshot[]> {
    const snapshots = getStored<Snapshot[]>('snapshots', []);
    return snapshots.filter(s => s.projectId === projectId);
  },

  async restoreSnapshot(snapshotId: string): Promise<Snapshot> {
    const snapshots = getStored<Snapshot[]>('snapshots', []);
    const snapshot = snapshots.find(s => s.id === snapshotId);
    if (!snapshot) throw new Error('Snapshot not found');

    const files = getStored<FileItem[]>('files', INITIAL_FILES);
    // Restore file contents
    snapshot.files.forEach(sf => {
      const target = files.find(f => f.id === sf.fileId || f.path === sf.path);
      if (target) {
        target.content = sf.content;
        target.updatedAt = new Date().toISOString();
      }
    });
    setStored('files', files);

    this.addChatMessage(snapshot.roomId, `Snapshot "${snapshot.name}" was restored. Workspace synchronized.`, true);
    return snapshot;
  },

  // --- SYSTEM CONFIG & FEATURE FLAGS ---
  async getSystemConfig(): Promise<SystemConfig> {
    try {
      const resp = await fetch(`${API_BASE_URL}/system/config`);
      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // In standalone client preview without live Spring Boot backend
    }

    // Default configuration: Code execution is an optional server-side feature.
    // Without an isolated backend runner configured, it is gracefully disabled.
    const hasServiceConfigured = !!import.meta.env.VITE_EXECUTION_SERVICE_URL;
    return {
      codeExecutionEnabled: hasServiceConfigured,
      codeExecutionStatusMessage: hasServiceConfigured
        ? 'Configured'
        : 'Code execution is not configured yet.',
      liveKitConfigured: !!import.meta.env.VITE_LIVEKIT_URL,
      collaborationPort: 1234,
      maxRoomParticipants: 6
    };
  }
};

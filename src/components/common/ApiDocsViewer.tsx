import React, { useState } from 'react';
import { X, Server, Shield, Database, Code, CheckCircle, Copy, Layers, Cpu } from 'lucide-react';

interface ApiDocsViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsViewer: React.FC<ApiDocsViewerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'models' | 'security' | 'architecture'>('endpoints');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyEndpoint = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(null), 1500);
  };

  const endpoints = [
    { method: 'POST', path: '/api/v1/auth/register', desc: 'Register new user account with BCrypt password hashing', auth: 'Public' },
    { method: 'POST', path: '/api/v1/auth/login', desc: 'Authenticate credentials and issue JWT bearer token', auth: 'Public' },
    { method: 'GET', path: '/api/v1/auth/me', desc: 'Fetch authenticated user profile and roles', auth: 'Bearer JWT' },
    { method: 'POST', path: '/api/v1/projects', desc: 'Create persistent project workspace in MongoDB', auth: 'Bearer JWT' },
    { method: 'GET', path: '/api/v1/projects/{id}', desc: 'Retrieve project metadata and member associations', auth: 'Member' },
    { method: 'POST', path: '/api/v1/projects/{id}/files', desc: 'Create virtual filesystem node without host traversal', auth: 'Editor' },
    { method: 'POST', path: '/api/v1/rooms', desc: 'Provision coding room with strict max 6 participants bound', auth: 'Bearer JWT' },
    { method: 'POST', path: '/api/v1/rooms/{id}/join', desc: 'Atomic join validation; rejects 7th member with 409 Conflict', auth: 'Public / Token' },
    { method: 'GET', path: '/api/v1/system/config', desc: 'Exposes server-side feature flags (optional code execution status, ports, limits)', auth: 'Public' },
    { method: 'POST', path: '/api/v1/rooms/{id}/call-token', desc: 'Issue short-lived signed LiveKit WebRTC access token', auth: 'Room Member' },
    { method: 'POST', path: '/api/v1/projects/{id}/snapshots', desc: 'Store immutable version snapshot of entire file tree', auth: 'Editor' },
    { method: 'POST', path: '/api/v1/snapshots/{id}/restore', desc: 'Rollback workspace to earlier snapshot checkpoint', auth: 'Owner' },
    { method: 'GET', path: '/api/v1/rooms/{id}/messages', desc: 'Retrieve paginated room chat log', auth: 'Room Member' },
    { method: 'GET', path: '/api/v1/health', desc: 'Liveness and readiness probe for Spring Boot & MongoDB', auth: 'Public' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Java 21 Spring Boot 3 — Architecture & OpenAPI Explorer</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  v1.0.0
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Full-stack backend specification with Spring Data MongoDB, JWT Security & LiveKit WebRTC Token Signer
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-4 border-b border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'endpoints'
                ? 'border-indigo-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            REST Endpoints ({endpoints.length})
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'models'
                ? 'border-indigo-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            MongoDB Entities
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'security'
                ? 'border-indigo-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Spring Security & Concurrency
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'architecture'
                ? 'border-indigo-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            System Topology
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === 'endpoints' && (
            <div className="space-y-2.5">
              {endpoints.map((ep) => (
                <div
                  key={ep.path}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        ep.method === 'POST'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : ep.method === 'GET'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-semibold text-white">{ep.path}</span>
                    <span className="font-sans text-slate-400 hidden sm:inline">— {ep.desc}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {ep.auth}
                    </span>
                    <button
                      onClick={() => copyEndpoint(ep.path)}
                      className="p-1 rounded text-slate-500 hover:text-white"
                      title="Copy path"
                    >
                      {copiedPath === ep.path ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-purple-400 font-bold block mb-2 font-sans">User.java (MongoDB Collection: "users")</span>
                <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`@Document(collection = "users")
@CompoundIndex(def = "{'normalizedEmail': 1}", unique = true)
public class User {
    @Id
    private String id;
    private String name;
    private String normalizedEmail;
    @JsonIgnore
    private String passwordHash; // BCrypt hashed with 12 rounds
    private Set<String> roles = Set.of("ROLE_USER");
    private String themePreference = "dark";
    private Instant createdAt = Instant.now();
}`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-2 font-sans">Room.java (MongoDB Collection: "rooms")</span>
                <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`@Document(collection = "rooms")
public class Room {
    @Id
    private String id;
    private String projectId;
    private String ownerId;
    private String name;
    private String invitationTokenHash;
    private Instant invitationExpiresAt;
    private boolean invitationRevoked;
    private int maxParticipants = 6; // Strictly enforced max bound
    private RoomStatus status = RoomStatus.ACTIVE;
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Max 6 Participants Concurrency Control
                </h4>
                <p>
                  To prevent race conditions during simultaneous join attempts, the Spring Boot room controller performs an atomic MongoDB <code className="text-indigo-300">$inc</code> check-and-increment on active memberships. If the member count reaches 6, concurrent threads receive an immediate <code className="text-red-400">409 Conflict (RoomCapacityExceededException)</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  LiveKit Token Generation
                </h4>
                <p>
                  The Spring Boot backend uses the LiveKit Server SDK to create room-scoped JSON Web Tokens signed with the application server's private secret. Video calling tokens specify room identity and participant grant, strictly preventing spoofing. Secrets are never exposed to frontend JavaScript.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-3">
              <div className="text-indigo-400 font-bold font-sans">Topological Service Boundaries</div>
              <pre className="overflow-x-auto leading-relaxed">
{`+-------------------------------------------------------+
|                    REACT FRONTEND                     |
|  - Monaco Editor + y-monaco                           |
|  - WebRTC / LiveKit Calling (Camera, Mic, Screen)     |
|  - REST Client / Session Auth                         |
+--------------------------+----------------------------+
                           |
            +--------------+---------------+
            |                              |
      (HTTP REST /api/v1)           (WebSocket CRDT)
            |                              |
            v                              v
+------------------------+   +--------------------------+
|  SPRING BOOT 3 (JAVA)  |   |  YJS COLLABORATION SVC   |
|  - Spring Security JWT |   |  - y-websocket server    |
|  - Room permissions    |   |  - Token verification    |
|  - Snapshot management |   |  - Debounced checkpoints |
|  - LiveKit Token Minter|   +-------------+------------+
+-----------+------------+                 |
            |                              |
            +--------------+---------------+
                           |
                           v
             +---------------------------+
             |       MONGODB ATLAS       |
             |  Users, Projects, Rooms,  |
             |  Files, Snapshots, Chat   |
             +---------------------------+`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

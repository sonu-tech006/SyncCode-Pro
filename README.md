# SyncCode — Real-Time Collaborative Coding & Video Calling Platform

> **"Code Together. Talk in Real Time."**

SyncCode is an enterprise-grade full-stack collaborative IDE where 4–6 developers can join the same workspace, write code concurrently with live multi-cursor synchronization, communicate over WebRTC audio/video calls, share screens, chat, and persist immutable project snapshots.

Designed and engineered for a **Java Full Stack Developer Portfolio**, demonstrating Spring Boot 3.3.x, Java 21, Spring Security with stateless JWT, Spring Data MongoDB, Yjs CRDT real-time document convergence, and WebRTC/LiveKit media streaming.

---

## 🚀 Key Features

1. **Monaco Code Editor**:
   - Syntax highlighting for Java, TypeScript, Python, C++, SQL, Markdown, JSON.
   - Code folding, search & replace, minimap, line numbers, font sizing, word wrap.
   - Light, Dark, and Monokai editor themes.

2. **Real-Time Yjs CRDT Collaboration**:
   - Conflict-free Replicated Data Type (CRDT) document convergence.
   - Concurrent edits commute deterministically across peers without lost updates.
   - Multi-user remote cursor flags with participant names and distinct assigned colors.
   - Role-based permissions: `OWNER`, `EDITOR`, and `VIEWER` (read-only presentation mode).

3. **Authentic WebRTC & LiveKit Video Calling**:
   - Real hardware camera video and microphone streams (`getUserMedia`).
   - Screen sharing with status badges (`getDisplayMedia`).
   - Web Audio API `AudioContext` and `AnalyserNode` active speaker volume detection.
   - Server-side LiveKit token minting with HMAC-SHA256 signatures.

4. **Strict Concurrency Bounds**:
   - Maximum 6 active participants per room enforced on the backend.
   - Simultaneous 7th join requests receive an immediate `409 Conflict`.

5. **Immutable Version Snapshots & Rollback**:
   - Named checkpoints capturing entire multi-file project state.
   - Side-by-side version comparison and synchronized collaborative rollback.

6. **The Color API Theme Engine**:
   - Dynamic White theme and Dark IDE theme.
   - "Random Color Theme" pulling live color harmonies from `The Color API` with automatic WCAG contrast preservation.

7. **Optional Code Execution Architecture (No Paid API Required)**:
   - Code execution is an optional server-side feature controlled by configuration.
   - **No paid third-party execution API is required**. If no execution sandbox is configured, the Run Code button is gracefully disabled and clearly displays: `"Code execution is not configured yet."`
   - Real-time collaborative editing, video calling, chat, authentication, and snapshots remain 100% operational independently of code execution.

---

## 🏛️ Monorepo Architecture

```
synccode/
├── frontend/               # React 19 + TypeScript + Vite + Tailwind CSS + Monaco
├── backend/                # Java 21 + Spring Boot 3.3.x + Spring Data MongoDB + JWT
│   ├── src/main/java/com/synccode/
│   │   ├── controller/     # REST APIs (/api/v1/auth, /rooms, /system/config, /call-token)
│   │   ├── model/          # MongoDB document entities
│   │   ├── repository/     # Spring Data repositories
│   │   ├── security/       # JWT Authentication & BCrypt
│   │   └── service/        # Atomic concurrency bounds & LiveKit token minter
│   └── src/test/java/      # JUnit 5 & Mockito test suite
├── collaboration-service/  # Dedicated Node.js Yjs WebSocket microservice
├── deployment/             # Dockerfiles & docker-compose.yml
├── .env.example            # Environment configuration reference
└── README.md
```

---

## ⚙️ Environment Variables & Inspection

### 1. Actually Required Variables
Only two variables are required to run SyncCode locally or in production:
* **`MONGODB_URI`**: Connection URI to local MongoDB or MongoDB Atlas for persistent storage of users, rooms, projects, snapshots, and chat.
* **`JWT_SECRET`**: Base64-encoded 256-bit secret key used by Spring Security for signing authentication tokens.

### 2. Service-Specific & Optional Variables

| Variable | Service | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `COLLABORATION_PORT` | Collaboration Service | `1234` | The port on which the dedicated Node.js Yjs WebSocket server listens for CRDT connections. |
| `EXECUTION_SERVICE_URL` | Backend | `""` (Empty) | Optional backend URL for an isolated container sandbox (e.g. self-hosted Judge0 CE or Docker execution worker). When unset, code execution is cleanly disabled. |
| `EXECUTION_API_KEY` | Backend | `""` (Empty) | Kept exclusively on the backend server. **Never exposed to frontend code**. |
| `LIVEKIT_URL` | Backend / Frontend | `""` (Optional) | LiveKit Cloud or self-hosted server URL. Direct browser WebRTC calling works without external credentials. |
| `PORT` | Backend | `8080` | Spring Boot HTTP server port. |
| `FRONTEND_ORIGIN` | Backend | `http://localhost:3000` | Allowed CORS origins. |

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- Node.js 20+
- Java 21 (JDK) & Maven 3.9+
- Docker & Docker Compose (Optional for containerized run)

### 2. Running with Docker Compose (Recommended)
```bash
docker-compose -f deployment/docker-compose.yml up --build
```
This boots:
- MongoDB on port `27017`
- Spring Boot Backend on `http://localhost:8080`
- Yjs Collaboration Server on `ws://localhost:1234`
- React Frontend on `http://localhost:3000`

### 3. Running Services Independently

#### Frontend:
```bash
npm install
npm run dev
# Accessible at http://localhost:3000
```

#### Spring Boot Backend:
```bash
cd backend
mvn clean package
java -jar target/synccode-backend-1.0.0-SNAPSHOT.jar
# OpenAPI documentation accessible at http://localhost:8080/swagger-ui.html
```

#### Yjs Collaboration Microservice:
```bash
cd collaboration-service
npm install
npm start
# Listening on port 1234
```

---

## 🧪 Testing Multi-User Collaboration & Calling

1. Open `http://localhost:3000` in **Tab A** and enter the workspace.
2. Open `http://localhost:3000` in **Tab B** (or an Incognito window / second browser).
3. Type in **Tab A**: observe instantaneous sub-millisecond CRDT synchronization and remote cursor flags in **Tab B**.
4. Click **Join Call** in both windows to verify camera, microphone, and active speaker visualizer.
5. Notice that the **Run Code** button is gracefully disabled displaying *"Code execution is not configured yet."* without interfering with real-time editing or calling.

---

## 🔒 Security Architecture
- Password hashing with **BCrypt** (12 work factor rounds).
- Stateless **JWT** authentication with room-scoped claims.
- Cryptographically generated invitation tokens with expiration and owner revocation.
- Strict prevention of client-supplied user ID tampering (identity derived strictly from JWT principal).
- Zero secrets or API keys exposed in frontend code; execution and calling credentials reside purely on the backend.

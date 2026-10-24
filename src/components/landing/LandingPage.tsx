import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Code2,
  Video,
  Users2,
  History,
  ShieldCheck,
  Terminal,
  Zap,
  Globe,
  Lock,
  ChevronRight,
  Sparkles,
  Layers,
  Database,
  Cpu,
  Server
} from 'lucide-react';

interface LandingPageProps {
  onEnterWorkspace: () => void;
  onOpenApiDocs: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterWorkspace, onOpenApiDocs }) => {
  const { openAuthModal, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-20">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-500 rounded-full blur-[130px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Built on Java 21 Spring Boot & Yjs CRDT Architecture</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.08]">
            Your Team. One Editor.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-400">
              Zero Delays.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            SyncCode is a real-time collaborative coding workspace where engineering teams, hackathons, and developers write code simultaneously, talk over integrated WebRTC video, share screens, and persist immutable project snapshots.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  onEnterWorkspace();
                } else {
                  openAuthModal('signup');
                }
              }}
              className="px-7 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2.5 text-base"
            >
              <span>Get Started Free</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onEnterWorkspace}
              className="px-7 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition flex items-center gap-2.5 text-base"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Explore Workspace</span>
            </button>

            <button
              onClick={onOpenApiDocs}
              className="px-5 py-3.5 rounded-xl font-medium text-slate-400 hover:text-white border border-transparent hover:border-slate-800 transition flex items-center gap-2 text-sm"
            >
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Backend Architecture & APIs</span>
            </button>
          </div>

          {/* Interactive Workspace Mock Preview */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden text-left font-mono mock-window-preview">
            {/* Window bar */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs text-slate-400 font-sans font-medium flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  OrderProcessorService.java — SyncCode Room: Sprint 42
                </span>
              </div>
              <div className="flex items-center gap-2 font-sans">
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  3 Online (Max 6)
                </span>
              </div>
            </div>

            {/* Editor & Video Preview Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[340px]">
              {/* Code window */}
              <div className="lg:col-span-3 p-5 text-xs text-slate-300 leading-relaxed overflow-x-auto bg-slate-950/40 relative">
                {/* Live remote cursor flags */}
                <div className="absolute top-[82px] left-[210px] pointer-events-none flex items-center">
                  <div className="w-0.5 h-4 bg-emerald-400 animate-pulse" />
                  <span className="ml-1 text-[10px] font-sans font-semibold bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded shadow">
                    Sarah Chen (typing...)
                  </span>
                </div>

                <div className="absolute top-[165px] left-[320px] pointer-events-none flex items-center">
                  <div className="w-0.5 h-4 bg-indigo-400 animate-pulse" />
                  <span className="ml-1 text-[10px] font-sans font-semibold bg-indigo-500 text-white px-1.5 py-0.5 rounded shadow">
                    Alex Rivera
                  </span>
                </div>

                <pre className="font-mono">
                  <span className="text-slate-500">01</span>  <span className="text-purple-400">package</span> com.synccode.engine;<br/>
                  <span className="text-slate-500">02</span>  <br/>
                  <span className="text-slate-500">03</span>  <span className="text-purple-400">import</span> java.util.concurrent.*;<br/>
                  <span className="text-slate-500">04</span>  <br/>
                  <span className="text-slate-500">05</span>  <span className="text-indigo-400">/** High-performance Java 21 Virtual Threads Order Executor */</span><br/>
                  <span className="text-slate-500">06</span>  <span className="text-blue-400">public class</span> <span className="text-yellow-300">OrderProcessorService</span> &#123;<br/>
                  <span className="text-slate-500">07</span>      <span className="text-blue-400">private final</span> ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();<br/>
                  <span className="text-slate-500">08</span>  <br/>
                  <span className="text-slate-500">09</span>      <span className="text-blue-400">public</span> CompletableFuture&lt;String&gt; submitOrder(String userId, <span className="text-blue-400">double</span> amount) &#123;<br/>
                  <span className="text-slate-500">10</span>          <span className="text-purple-400">return</span> CompletableFuture.supplyAsync(() -&gt; &#123;<br/>
                  <span className="text-slate-500">11</span>              System.out.printf(<span className="text-emerald-300">"Dispatching virtual thread order: %s%n"</span>, userId);<br/>
                  <span className="text-slate-500">12</span>              <span className="text-purple-400">return</span> <span className="text-emerald-300">"DISPATCHED"</span>;<br/>
                  <span className="text-slate-500">13</span>          &#125;, virtualExecutor);<br/>
                  <span className="text-slate-500">14</span>      &#125;<br/>
                  <span className="text-slate-500">15</span>  &#125;
                </pre>
              </div>

              {/* Live Video / Collaborators side panel */}
              <div className="border-t lg:border-t-0 lg:border-l border-slate-800 p-3 bg-slate-900/60 flex flex-col gap-2 font-sans">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>WebRTC Call</span>
                  <span className="text-emerald-400 text-[10px]">Connected</span>
                </div>

                <div className="relative aspect-video rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                    alt="Devin"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-slate-950/80 text-[10px] px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Devin Vance (Host)
                  </span>
                </div>

                <div className="relative aspect-video rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80"
                    alt="Sarah"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-slate-950/80 text-[10px] px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Sarah Chen (Editor)
                  </span>
                </div>

                <div className="mt-auto pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Screen Sharing Active</span>
                  <span className="text-indigo-400 font-medium">1080p 60fps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">Core Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered for Production Full-Stack Workflows
            </p>
            <p className="mt-3 text-slate-400">
              Unlike toy collaborative pads, SyncCode implements industrial-grade conflict-free replicated data types, strict server-side capacity boundaries, and WebRTC streaming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Monaco Editor & Yjs CRDT</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Industrial Monaco code editing with syntax highlighting, word wrap, code folding, and multi-language support. Backed by Yjs CRDTs ensuring peer convergence without lost updates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real WebRTC & LiveKit Calling</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Authentic browser audio and video calling. Mute/unmute microphone, toggle camera, share screen, and detect active speakers with real AudioContext analysis while coding.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Strict 6-User Room Bound</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Enforced concurrency control on the backend: room capacity is strictly capped at 6 active participants. Concurrent 7th join attempts are rejected with clear server error states.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Immutable Version Snapshots</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Create named checkpoints with complete file tree snapshots. Compare version diffs side-by-side and restore past project states with synchronized collaborative updates.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Isolated Code Execution</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Execute code safely with structured standard output, stderr, execution duration, and exit codes. Integrates with containerized Judge0 sandboxes without server compromise.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">The Color API Theme Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Toggle between White theme, Dark IDE workspace, and dynamic Random Color Theme powered by The Color API with automatic WCAG contrast preservation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Architecture */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-2">Under The Hood</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Production Full-Stack Architecture
            </p>
            <p className="mt-3 text-slate-400">
              Clean separation of concerns across Spring Boot, dedicated Node.js collaboration microservice, and React client.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <Server className="w-6 h-6 text-indigo-400" />
                <h4 className="text-base font-bold text-white">Java 21 & Spring Boot 3</h4>
              </div>
              <ul className="text-xs text-slate-400 space-y-2.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Spring Security 6 with stateless JWT authorization
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Spring Data MongoDB for users, rooms, snapshots & files
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  LiveKit Server SDK short-lived token generation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  REST APIs under /api/v1 documented with Swagger/OpenAPI
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-cyan-400" />
                <h4 className="text-base font-bold text-white">Collaboration Service</h4>
              </div>
              <ul className="text-xs text-slate-400 space-y-2.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Dedicated Yjs WebSocket server using CRDT documents
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Sub-millisecond concurrent multi-cursor synchronization
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Role-based document mutation permission checks
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Debounced checkpoint persistence to MongoDB
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-6 h-6 text-emerald-400" />
                <h4 className="text-base font-bold text-white">Modern React SPA</h4>
              </div>
              <ul className="text-xs text-slate-400 space-y-2.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Monaco Editor with multi-tab file explorer
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Real-time room chat with markdown snippet support
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  LiveKit WebRTC video grid & active speaker detection
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Tailwind CSS with dynamic theme contrast engine
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6 text-left">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-base font-semibold text-white">How does concurrent editing work without conflicts?</h3>
              <p className="mt-2 text-sm text-slate-400">
                SyncCode utilizes Yjs, a high-performance Conflict-free Replicated Data Type (CRDT). Every insertion and deletion is assigned an immutable lamport clock and client identifier. Edits commute and converge deterministically on every peer.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-base font-semibold text-white">How is the 6-participant limit enforced?</h3>
              <p className="mt-2 text-sm text-slate-400">
                The Spring Boot backend enforces atomic check-and-increment operations on room memberships. If a room has 6 online participants, additional join requests are immediately rejected with a 409 Conflict status.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-base font-semibold text-white">Can viewers modify shared files?</h3>
              <p className="mt-2 text-sm text-slate-400">
                No. Room memberships enforce strict roles: OWNER, EDITOR, and VIEWER. The editor is placed in read-only mode for viewers, and the collaboration service rejects incoming mutations from unauthorized identities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SyncCode</span>
            <span>—</span>
            <span>Code Together. Talk in Real Time.</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onOpenApiDocs} className="hover:text-slate-300 transition">
              Backend Architecture
            </button>
            <span className="hover:text-slate-300 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Documentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

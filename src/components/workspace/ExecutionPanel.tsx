import React from 'react';
import { ExecutionResult } from '../../types';
import { Play, RotateCcw, Terminal, AlertCircle, CheckCircle2, Clock, Cpu, Info, ShieldAlert } from 'lucide-react';

interface ExecutionPanelProps {
  result: ExecutionResult | null;
  isRunning: boolean;
  onRunCode: () => void;
  onClearOutput: () => void;
  language: string;
  isExecutionConfigured?: boolean;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  result,
  isRunning,
  onRunCode,
  onClearOutput,
  language,
  isExecutionConfigured = false
}) => {
  return (
    <div className="h-48 border-t border-slate-800 bg-slate-950 flex flex-col font-mono text-xs select-none">
      {/* Terminal Title Bar */}
      <div className="h-9 px-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between text-slate-300 font-sans">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-xs uppercase tracking-wider">Output & Execution Sandbox</span>
          <span className="text-[10px] text-slate-500 font-mono">({language})</span>
          {!isExecutionConfigured && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Not Configured
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {result && (
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {result.timeMs}ms
              </span>
              {result.memoryKb && (
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-slate-500" />
                  {Math.round(result.memoryKb / 1024)}MB
                </span>
              )}
              <span
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  result.exitCode === 0
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                Exit {result.exitCode}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClearOutput}
              title="Clear Output"
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Run Code Button: Gracefully disabled if not configured */}
            <button
              onClick={onRunCode}
              disabled={!isExecutionConfigured || isRunning}
              title={!isExecutionConfigured ? "Code execution is not configured yet." : "Execute in sandbox"}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow ${
                isExecutionConfigured
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-75'
              }`}
            >
              {isRunning ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output Console Body */}
      <div className="flex-1 overflow-y-auto p-3 text-slate-200 leading-relaxed font-mono">
        {!isExecutionConfigured ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="max-w-md p-4 rounded-xl bg-slate-900 border border-slate-800 text-center font-sans space-y-2">
              <div className="inline-flex p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1">
                <Info className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Code execution is not configured yet.</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Code execution is an optional server-side feature that requires an isolated container sandbox (e.g. self-hosted Judge0 or Docker runner).
              </p>
              <p className="text-[11px] text-slate-500">
                All real-time collaboration features — Monaco live editing, Yjs CRDTs, WebRTC video calling, room chat, and project snapshots — remain fully active.
              </p>
            </div>
          </div>
        ) : isRunning ? (
          <div className="flex items-center gap-2 text-slate-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Spawning isolated sandbox process...</span>
          </div>
        ) : result ? (
          <div className="space-y-2">
            {result.compileOutput && (
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <span className="font-bold block text-[11px] mb-1">Compilation Log:</span>
                <pre className="whitespace-pre-wrap">{result.compileOutput}</pre>
              </div>
            )}

            {result.stdout && (
              <div>
                <pre className="whitespace-pre-wrap text-emerald-300">{result.stdout}</pre>
              </div>
            )}

            {result.stderr && (
              <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                <pre className="whitespace-pre-wrap">{result.stderr}</pre>
              </div>
            )}

            {!result.stdout && !result.stderr && !result.compileOutput && (
              <span className="text-slate-500 italic">Program exited with code {result.exitCode} (no output).</span>
            )}
          </div>
        ) : (
          <div className="text-slate-600 italic">
            Click "Run Code" to compile and execute current file in an isolated container sandbox.
          </div>
        )}
      </div>
    </div>
  );
};

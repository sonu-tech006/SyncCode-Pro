/**
 * Isolated Code Execution Client
 *
 * Code execution is an OPTIONAL feature controlled by server-side configuration.
 * SyncCode operates without requiring any paid third-party code-execution APIs.
 * When no isolated sandbox service is configured, the Run Code button is disabled gracefully
 * and displays: "Code execution is not configured yet."
 *
 * Collaborative editing, chat, authentication, snapshots, and WebRTC video calling
 * remain 100% operational independently of code execution.
 */

import { ExecutionResult } from '../types';
import { api } from './api';

/**
 * Checks whether code execution is enabled via server-side configuration.
 */
export async function isCodeExecutionAvailable(): Promise<boolean> {
  try {
    const config = await api.getSystemConfig();
    return !!config.codeExecutionEnabled;
  } catch {
    return false;
  }
}

/**
 * Executes code if an authorized execution sandbox is configured on the backend.
 * Rejects cleanly if the service is not configured.
 */
export async function executeCode(code: string, language: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  const isAvailable = await isCodeExecutionAvailable();

  if (!isAvailable) {
    return {
      stdout: '',
      stderr: 'Code execution is not configured yet.',
      exitCode: 1,
      timeMs: 0,
      status: 'SANDBOX_OFFLINE'
    };
  }

  // If server-side proxy route is available (/api/v1/execution/run)
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  try {
    const token = localStorage.getItem('synccode_auth_token');
    const resp = await fetch(`${apiBase}/execution/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        code,
        language
      })
    });

    if (resp.ok) {
      const data = await resp.json();
      return {
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        compileOutput: data.compileOutput || '',
        exitCode: data.exitCode ?? 0,
        timeMs: data.timeMs || Math.round(performance.now() - startTime),
        memoryKb: data.memoryKb,
        status: data.exitCode === 0 ? 'SUCCESS' : 'ERROR'
      };
    }
  } catch (err: any) {
    console.warn('[SyncCode Execution] Backend execution endpoint unavailable:', err.message);
  }

  return {
    stdout: '',
    stderr: 'Code execution is not configured yet.',
    exitCode: 1,
    timeMs: Math.round(performance.now() - startTime),
    status: 'SANDBOX_OFFLINE'
  };
}

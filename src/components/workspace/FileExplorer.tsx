import React, { useState } from 'react';
import { FileItem } from '../../types';
import {
  FileCode2,
  FolderPlus,
  FilePlus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Folder,
  Code
} from 'lucide-react';

interface FileExplorerProps {
  files: FileItem[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, language: string) => Promise<void>;
  onRenameFile: (fileId: string, newName: string) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  isReadOnly?: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  isReadOnly = false
}) => {
  const [newFilePrompt, setNewFilePrompt] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLang, setNewFileLang] = useState('java');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    // Detect language from extension if available
    let lang = newFileLang;
    const lower = newFileName.toLowerCase();
    if (lower.endsWith('.java')) lang = 'java';
    else if (lower.endsWith('.ts') || lower.endsWith('.tsx')) lang = 'typescript';
    else if (lower.endsWith('.js') || lower.endsWith('.jsx')) lang = 'javascript';
    else if (lower.endsWith('.py')) lang = 'python';
    else if (lower.endsWith('.cpp') || lower.endsWith('.cc')) lang = 'cpp';
    else if (lower.endsWith('.sql')) lang = 'sql';
    else if (lower.endsWith('.md')) lang = 'markdown';
    else if (lower.endsWith('.json')) lang = 'json';

    await onCreateFile(newFileName.trim(), lang);
    setNewFileName('');
    setNewFilePrompt(false);
  };

  const handleRenameSubmit = async (e: React.FormEvent, fileId: string) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await onRenameFile(fileId, editName.trim());
    setEditingFileId(null);
  };

  const getLanguageColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'java':
        return 'text-amber-400';
      case 'typescript':
      case 'javascript':
        return 'text-blue-400';
      case 'python':
        return 'text-emerald-400';
      case 'cpp':
        return 'text-rose-400';
      case 'markdown':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-r border-slate-800 text-slate-300 w-64 shrink-0 select-none file-explorer-sidebar">
      {/* Explorer Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Explorer</span>
        
        {!isReadOnly && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setNewFilePrompt(true)}
              title="New File"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <FilePlus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* New File Inline Form */}
      {newFilePrompt && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-slate-800 bg-slate-900/80">
          <input
            type="text"
            autoFocus
            placeholder="filename.java"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="w-full bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-xs text-white focus:outline-none mb-1.5"
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setNewFilePrompt(false)}
              className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-0.5 text-[11px] font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-500"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto py-1">
        <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 flex items-center gap-1">
          <Folder className="w-3 h-3 text-indigo-400" />
          <span>PROJECT ROOT</span>
        </div>

        <div className="space-y-0.5 mt-0.5">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const isEditing = file.id === editingFileId;

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center justify-between px-3 py-1.5 text-xs rounded-md mx-1 cursor-pointer transition ${
                  isActive
                    ? 'bg-indigo-600/20 text-white font-medium border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1 mr-2">
                  <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${getLanguageColor(file.language)}`} />
                  
                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleRenameSubmit(e, file.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => setEditingFileId(null)}
                        className="bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white w-full"
                      />
                    </form>
                  ) : (
                    <span className="truncate">{file.name}</span>
                  )}
                </div>

                {!isReadOnly && !isEditing && (
                  <div className="hidden group-hover:flex items-center gap-1 opacity-80 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFileId(file.id);
                        setEditName(file.name);
                      }}
                      title="Rename"
                      className="p-1 hover:text-white"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {files.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileToDelete(file);
                        }}
                        title="Delete File"
                        className="p-1 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full text-slate-100 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-2">Delete File?</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Are you sure you want to permanently remove <span className="text-white font-mono">{fileToDelete.name}</span>? This action synchronizes across all active room editors.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onDeleteFile(fileToDelete.id);
                  setFileToDelete(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

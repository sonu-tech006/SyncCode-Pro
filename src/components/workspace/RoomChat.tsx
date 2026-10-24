import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { ChatMessage } from '../../types';
import { Send, Terminal, MessageSquare, Code, Sparkles } from 'lucide-react';

interface RoomChatProps {
  roomId: string;
  currentUserId: string;
}

export const RoomChat: React.FC<RoomChatProps> = ({ roomId, currentUserId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();

    // Listen to local BroadcastChannel for instant real-time message sync between tabs
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`synccode_chat_${roomId}`);
      bc.onmessage = (event) => {
        if (event.data?.type === 'new_chat_msg') {
          setMessages((prev) => [...prev, event.data.message]);
        }
      };
    } catch {}

    return () => {
      if (bc) bc.close();
    };
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const msgs = await api.getChatMessages(roomId);
      setMessages(msgs);
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const newMsg = await api.addChatMessage(roomId, trimmed);
      setMessages((prev) => [...prev, newMsg]);
      setText('');

      // Broadcast to other tabs/peers
      try {
        const bc = new BroadcastChannel(`synccode_chat_${roomId}`);
        bc.postMessage({ type: 'new_chat_msg', message: newMsg });
        bc.close();
      } catch {}
    } catch (e) {
      console.error('Failed to dispatch message:', e);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800 w-80 shrink-0 text-slate-300 side-panel-container">
      {/* Chat Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Room Chat</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{messages.length} messages</span>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => {
          if (m.systemMessage) {
            return (
              <div
                key={m.id}
                className="py-1 px-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 text-center font-medium"
              >
                {m.message}
              </div>
            );
          }

          const isSelf = m.senderId === currentUserId;

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[11px]">
                <span className="font-semibold text-slate-300">{m.senderName}</span>
                <span className="text-[10px] text-slate-500">{formatTime(m.createdAt)}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  isSelf
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {m.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-2 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type message or paste code..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

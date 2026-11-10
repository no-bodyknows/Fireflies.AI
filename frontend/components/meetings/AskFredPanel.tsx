'use client';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, User, Copy, Check } from 'lucide-react';
import { askFredAI } from '@/lib/api';
import { useToast } from '@/components/Toast';

interface AskFredPanelProps {
  meetingId: number;
  meetingTitle: string;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

interface Message {
  role: 'fred' | 'user';
  text: string;
  actions?: string[];
}

export default function AskFredPanel({
  meetingId,
  meetingTitle,
  isOpen,
  onClose,
  darkMode,
}: AskFredPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'fred',
      text: `Hi! I'm Fred, your AI meeting assistant. Ask me anything about "${meetingTitle}", or choose a quick prompt below:`,
      actions: [
        'Summarize key decisions',
        'List all action items & owners',
        'Draft a follow-up email',
        'What was the meeting tone & sentiment?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askFredAI(meetingId, q);
      setMessages((prev) => [
        ...prev,
        { role: 'fred', text: res.answer, actions: res.suggested_actions },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'fred',
          text: "I'm having trouble retrieving details right now. Please verify your backend server is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    showToast('Copied answer to clipboard!', 'success');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-96 z-40 border-l shadow-2xl flex flex-col transition-colors animate-in slide-in-from-right duration-200 ${
        darkMode ? 'bg-[#0f111c] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-violet-500/25">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-bold tracking-tight">AskFred AI</h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-violet-500/20 text-violet-400">Assistant</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{meetingTitle}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start space-x-2 max-w-[90%]">
              {m.role === 'fred' && (
                <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed relative group ${
                  m.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-xs'
                    : darkMode
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                    : 'bg-slate-100 border border-slate-200/60 text-slate-800 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.role === 'fred' && (
                  <button
                    onClick={() => handleCopyMessage(m.text, idx)}
                    className="absolute -bottom-2 -right-2 p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy response"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Action Chips from Fred */}
            {m.actions && (
              <div className="mt-2 pl-8 flex flex-wrap gap-1.5">
                {m.actions.map((act, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(act)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all text-left ${
                      darkMode
                        ? 'border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20'
                        : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
                    }`}
                  >
                    ✨ {act}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-violet-500 animate-pulse pl-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fred is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className={`p-3 border-t flex items-center space-x-2 ${darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/50'}`}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Fred about this meeting..."
          className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-40 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

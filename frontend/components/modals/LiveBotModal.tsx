'use client';
import { useState } from 'react';
import { X, Bot, Sparkles, Check, Globe } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface LiveBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function LiveBotModal({ isOpen, onClose, darkMode }: LiveBotModalProps) {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [botName, setBotName] = useState("Fred's Notetaker");
  const [language, setLanguage] = useState('English (US)');
  const [isJoining, setIsJoining] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingUrl.trim()) {
      showToast('Please enter a valid meeting URL', 'error');
      return;
    }

    setIsJoining(true);
    setTimeout(() => {
      setIsJoining(false);
      showToast(`🤖 ${botName} has joined your live meeting! Recording initialized.`, 'success');
      setMeetingUrl('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg mx-auto rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
          darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 mr-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">Add Fred to Live Meeting</h2>
              <p className={`text-[11px] sm:text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Send Fireflies AI bot to capture and transcribe in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
              darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleJoin} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Live Meeting URL <span className="text-violet-500">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="url"
                required
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://zoom.us/j/... or meet.google.com/..."
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <p className={`text-[11px] mt-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Supports Zoom, Google Meet, Microsoft Teams, Webex, and GoToMeeting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Bot Display Name</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Transcription Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="English (US)">English (US)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-violet-50/50 border-violet-100'}`}>
            <div className="flex items-center space-x-2 text-violet-600 dark:text-violet-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>What happens next:</span>
            </div>
            <ul className={`space-y-1 pl-4 list-disc text-[11px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <li>Fred requests permission to join the meeting room as an attendee</li>
              <li>Speech is transcribed with automated speaker recognition</li>
              <li>Summary and action items will sync straight to your Notebook within 3 minutes of call completion</li>
            </ul>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isJoining}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/25 transition-all disabled:opacity-50"
            >
              {isJoining ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting Bot...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Bot Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

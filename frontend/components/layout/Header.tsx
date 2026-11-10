'use client';
import { useState } from 'react';
import { Search, Bell, Sparkles, Plus, Radio, Upload, X } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface HeaderProps {
  darkMode: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onOpenNewMeeting: () => void;
  onOpenLiveBot: () => void;
  onOpenSettings?: () => void;
}

export default function Header({
  darkMode,
  searchQuery,
  setSearchQuery,
  onOpenNewMeeting,
  onOpenLiveBot,
  onOpenSettings,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { showToast } = useToast();

  const notifications = [
    { id: 1, title: 'Meeting notes ready', desc: 'Q4 Product Strategy & Architecture Sync summary has been processed.', time: '10m ago' },
    { id: 2, title: 'Action item completed', desc: 'Sarah Chen completed "Verify database indexing on transcript timestamps".', time: '1h ago' },
    { id: 3, title: 'Fred Notetaker joined', desc: 'Fred has connected to your Zoom meeting room.', time: '2h ago' },
  ];

  return (
    <header
      className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md transition-colors ${
        darkMode ? 'bg-[#0b0d17]/85 border-slate-800/80' : 'bg-white/85 border-slate-200/90'
      }`}
    >
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search meetings, transcripts, action items, or attendees..."
          className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all ${
            darkMode
              ? 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder-slate-500'
              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
          }`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 ml-4">
        {/* Live Bot Status Badge */}
        <button
          onClick={onOpenLiveBot}
          className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
            darkMode
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
          }`}
          title="Click to invite Fred to live meeting"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold">Fred: Auto-Join Active</span>
        </button>

        {/* Upload Audio / File button */}
        <button
          onClick={onOpenNewMeeting}
          className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
            darkMode
              ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Upload className="w-3.5 h-3.5 opacity-70" />
          <span>Upload File</span>
        </button>

        {/* New Meeting Primary Purple Button */}
        <button
          onClick={onOpenNewMeeting}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Meeting</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl border transition-colors relative ${
              darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
          </button>

          {showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 ${
                darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold">Notifications</span>
                <span className="text-[10px] text-violet-500 font-semibold cursor-pointer">Mark all as read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                      darkMode ? 'hover:bg-slate-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-xs font-semibold">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className={`text-[11px] line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
          title="Account settings"
        >
          LK
        </div>
      </div>
    </header>
  );
}

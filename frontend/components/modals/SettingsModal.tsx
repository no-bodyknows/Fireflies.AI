'use client';
import { useState } from 'react';
import { X, User, Bell, Shield, Sliders, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function SettingsModal({ isOpen, onClose, darkMode }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notetaker' | 'notifications' | 'privacy'>('notetaker');
  const [autoJoin, setAutoJoin] = useState(true);
  const [recordVideo, setRecordVideo] = useState(true);
  const [aiTone, setAiTone] = useState('Concise & Action-oriented');
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSave = () => {
    showToast('Settings saved successfully!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col md:flex-row transition-colors ${
          darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Left Nav */}
        <div className={`w-full md:w-48 p-4 border-b md:border-b-0 md:border-r ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">Settings</h3>
          <nav className="space-y-1">
            {[
              { id: 'notetaker', label: 'Notetaker Rules', icon: Sliders },
              { id: 'profile', label: 'Profile & Team', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'privacy', label: 'Security & Privacy', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : darkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold tracking-tight capitalize">{activeTab} Preferences</h2>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeTab === 'notetaker' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-semibold">Auto-Join All Calendar Meetings</p>
                    <p className="text-[11px] text-slate-400">Fred automatically enters calendar events with a video URL</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoJoin}
                    onChange={(e) => setAutoJoin(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-semibold">Record Video in Addition to Audio</p>
                    <p className="text-[11px] text-slate-400">Captures presentation screen shares and speaker webcams</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={recordVideo}
                    onChange={(e) => setRecordVideo(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">AI Summary Personality</label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-violet-500 ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Concise & Action-oriented">Concise & Action-oriented</option>
                    <option value="Detailed Executive Brief">Detailed Executive Brief</option>
                    <option value="Technical & Architecture Focus">Technical & Architecture Focus</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Love Kumar"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    disabled
                    defaultValue="love@fireflies.ai"
                    className={`w-full px-3 py-2 rounded-xl border text-xs opacity-60 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Current Workspace</label>
                  <input
                    type="text"
                    defaultValue="Fireflies Engineering & Product"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-400">Select where to receive post-meeting summaries:</p>
                {['Email me when transcript is ready', 'Slack direct message with action items', 'Notify attendees with view-only link'].map((pref, i) => (
                  <label key={i} className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-violet-600 rounded" />
                    <span>{pref}</span>
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <p className="font-semibold">SOC2 Type II Certified Workspace</p>
                  <p className="text-[11px] mt-0.5">All meeting transcripts and audio files are encrypted with AES-256 at rest.</p>
                </div>
                <p className="text-slate-400 text-[11px]">Data retention policy: Infinite (Enterprise plan). You can delete any meeting anytime.</p>
              </div>
            )}
          </div>

          <div className={`p-4 border-t flex justify-end space-x-2 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
            <button
              onClick={onClose}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { X, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const INTEGRATIONS = [
  { name: 'Zoom', category: 'Video Conferencing', status: 'Connected', desc: 'Auto-record and transcribe scheduled Zoom calls.' },
  { name: 'Google Meet', category: 'Video Conferencing', status: 'Available', desc: 'Sync with Google Calendar to capture Meet links.' },
  { name: 'Microsoft Teams', category: 'Collaboration', status: 'Available', desc: 'Fireflies bot joins MS Teams channels automatically.' },
  { name: 'Slack', category: 'Team Chat', status: 'Connected', desc: 'Push meeting summaries and action items into Slack channels.' },
  { name: 'Notion', category: 'Knowledge Base', status: 'Available', desc: 'Export structured meeting notes into your Notion database.' },
  { name: 'HubSpot & Salesforce', category: 'CRM', status: 'Available', desc: 'Log sales call transcripts & customer notes directly into CRM deals.' },
];

export default function IntegrationsModal({ isOpen, onClose, darkMode }: IntegrationsModalProps) {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleToggle = (name: string, status: string) => {
    if (status === 'Connected') {
      showToast(`${name} integration settings saved.`, 'info');
    } else {
      showToast(`${name} connected successfully! Webhooks active.`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl mx-auto rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
          darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="min-w-0 mr-2">
            <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">Apps & Integrations</h2>
            <p className={`text-[11px] sm:text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Connect Fireflies to your daily video platforms, CRM, and team apps
            </p>
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

        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto flex-1">
          {INTEGRATIONS.map((app) => (
            <div
              key={app.name}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-semibold text-xs">{app.name}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      app.status === 'Connected'
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                        : 'bg-violet-500/15 text-violet-500 border border-violet-500/20'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {app.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800">
                <span className="text-[10px] text-slate-400">{app.category}</span>
                <button
                  onClick={() => handleToggle(app.name, app.status)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                    app.status === 'Connected'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                      : 'bg-violet-600 hover:bg-violet-700 text-white'
                  }`}
                >
                  {app.status === 'Connected' ? 'Manage' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={`p-4 border-t flex justify-end ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

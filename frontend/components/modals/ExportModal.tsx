'use client';
import { useState } from 'react';
import { X, FileText, Download, Copy, Check, Code, Printer } from 'lucide-react';
import { Meeting } from '@/types';
import { exportMeetingToMarkdown, exportMeetingToTxt } from '@/lib/utils';
import { useToast } from '@/components/Toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  darkMode: boolean;
}

export default function ExportModal({ isOpen, onClose, meeting, darkMode }: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !meeting) return null;

  const handleDownload = (format: 'md' | 'txt' | 'json') => {
    let content = '';
    let filename = `${meeting.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notes`;
    let mimeType = 'text/plain';

    if (format === 'md') {
      content = exportMeetingToMarkdown(meeting);
      filename += '.md';
      mimeType = 'text/markdown';
    } else if (format === 'txt') {
      content = exportMeetingToTxt(meeting);
      filename += '.txt';
      mimeType = 'text/plain';
    } else if (format === 'json') {
      content = JSON.stringify(meeting, null, 2);
      filename += '.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Exported meeting notes as .${format.toUpperCase()}`, 'success');
  };

  const handleCopyMarkdown = async () => {
    const md = exportMeetingToMarkdown(meeting);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    showToast('Meeting notes copied to clipboard as Markdown!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg mx-auto rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
          darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 mr-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">Export Meeting Notes</h2>
              <p className={`text-[11px] sm:text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {meeting.title}
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

        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto">
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Choose your preferred export format. Includes full AI summary, action items checklist, and timestamped transcripts.
          </p>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-2">
            <button
              onClick={() => handleDownload('md')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 transition-all group ${
                darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-violet-500/50 hover:bg-slate-800/40' : 'bg-slate-50 border-slate-200 hover:border-violet-500 hover:bg-violet-50/30'
              }`}
            >
              <FileText className="w-6 h-6 text-violet-600 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold">Markdown (.md)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Notion, Obsidian, GitHub</p>
              </div>
            </button>

            <button
              onClick={() => handleDownload('txt')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 transition-all group ${
                darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-violet-500/50 hover:bg-slate-800/40' : 'bg-slate-50 border-slate-200 hover:border-violet-500 hover:bg-violet-50/30'
              }`}
            >
              <FileText className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold">Plain Text (.txt)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Email notes, Slack text</p>
              </div>
            </button>

            <button
              onClick={() => handleDownload('json')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 transition-all group ${
                darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-violet-500/50 hover:bg-slate-800/40' : 'bg-slate-50 border-slate-200 hover:border-violet-500 hover:bg-violet-50/30'
              }`}
            >
              <Code className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold">JSON Data (.json)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">API payload & backup</p>
              </div>
            </button>

            <button
              onClick={handlePrint}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 transition-all group ${
                darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-violet-500/50 hover:bg-slate-800/40' : 'bg-slate-50 border-slate-200 hover:border-violet-500 hover:bg-violet-50/30'
              }`}
            >
              <Printer className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold">PDF / Print</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Clean PDF report</p>
              </div>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopyMarkdown}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Markdown to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className={`p-4 border-t flex justify-end ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

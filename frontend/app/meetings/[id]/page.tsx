'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import AudioPlayer from '@/components/meetings/AudioPlayer';
import TranscriptView from '@/components/meetings/TranscriptView';
import SummaryPanel from '@/components/meetings/SummaryPanel';
import AskFredPanel from '@/components/meetings/AskFredPanel';
import EditMeetingModal from '@/components/modals/EditMeetingModal';
import ExportModal from '@/components/modals/ExportModal';
import LiveBotModal from '@/components/modals/LiveBotModal';
import SettingsModal from '@/components/modals/SettingsModal';
import IntegrationsModal from '@/components/modals/IntegrationsModal';
import { ToastProvider, useToast } from '@/components/Toast';
import { Meeting, ActionItem } from '@/types';
import { fetchMeeting, deleteMeeting } from '@/lib/api';
import { formatDate, formatDuration, getInitials, getSpeakerStyle } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Bot,
  Download,
  Share2,
  Trash2,
  Edit3,
  Sparkles,
  ExternalLink
} from 'lucide-react';

function MeetingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Modals & Panels
  const [isAskFredOpen, setIsAskFredOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLiveBotOpen, setIsLiveBotOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);

  const { showToast } = useToast();

  const loadMeeting = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await fetchMeeting(id);
      setMeeting(data);
    } catch (err: any) {
      console.error(err);
      showToast('Meeting not found or backend server is offline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeeting();
  }, [id]);

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (!isPlaying) setIsPlaying(true);
  };

  const handleDelete = async () => {
    if (!meeting) return;
    if (confirm(`Are you sure you want to permanently delete "${meeting.title}"?`)) {
      try {
        await deleteMeeting(meeting.id);
        showToast('Meeting deleted successfully', 'success');
        router.push('/');
      } catch {
        showToast('Failed to delete meeting', 'error');
      }
    }
  };

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Meeting link copied to clipboard! 🔗', 'success');
    }
  };

  const renderStatusBadge = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === 'completed') {
      return (
        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
          Completed
        </span>
      );
    }
    if (s === 'upcoming') {
      return (
        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-violet-500/15 text-violet-500 border border-violet-500/25">
          Upcoming
        </span>
      );
    }
    if (s === 'delayed') {
      return (
        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25">
          Delayed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-500">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        <span>Live</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${darkMode ? 'bg-[#0b0d17] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Loading meeting notes & audio player...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${darkMode ? 'bg-[#0b0d17] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
        <div className="text-center space-y-3 max-w-sm">
          <h2 className="text-lg font-bold">Meeting Not Found</h2>
          <p className="text-xs text-slate-400">This meeting may have been deleted or does not exist.</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white transition-colors"
          >
            &larr; Back to Meetings Notebook
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen transition-colors ${darkMode ? 'bg-[#0b0d17] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      {/* Sidebar */}
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenLiveBot={() => setIsLiveBotOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Meeting Header Bar */}
        <header
          className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md shrink-0 transition-colors ${
            darkMode ? 'bg-[#0b0d17]/85 border-slate-800/80' : 'bg-white/85 border-slate-200/90'
          }`}
        >
          {/* Back & Title */}
          <div className="flex items-center space-x-3 min-w-0 mr-4">
            <Link
              href="/"
              className={`p-2 rounded-xl border transition-colors ${
                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
              title="Back to Notebook"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold tracking-tight truncate">{meeting.title}</h1>
                {renderStatusBadge(meeting.status)}
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                <span>{formatDate(meeting.date)}</span>
                <span>•</span>
                <span>{formatDuration(meeting.duration)}</span>
                <span>•</span>
                <span>{meeting.participants?.length || 0} attendees</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* AskFred Button */}
            <button
              onClick={() => setIsAskFredOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AskFred AI</span>
            </button>

            {/* Export Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                darkMode ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Download className="w-3.5 h-3.5 opacity-75" />
              <span>Export</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                darkMode ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 opacity-75" />
              <span>Share</span>
            </button>

            {/* Edit Details */}
            <button
              onClick={() => setIsEditOpen(true)}
              className={`p-2 rounded-xl border transition-colors ${
                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
              title="Edit meeting details"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Delete Meeting */}
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Delete meeting"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Split Screen Workspace Body */}
        <div className="flex-1 overflow-hidden p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: AI Summary & Notes (5 cols) */}
          <div className="lg:col-span-5 h-full overflow-hidden flex flex-col min-h-0">
            <SummaryPanel
              meetingId={meeting.id}
              summary={meeting.summary}
              actionItems={meeting.action_items || []}
              participants={meeting.participants || []}
              transcripts={meeting.transcripts || []}
              onActionItemsChange={(items) => setMeeting({ ...meeting, action_items: items })}
              onSeek={handleSeek}
              darkMode={darkMode}
            />
          </div>

          {/* Right Column: Audio Player & Interactive Transcript (7 cols) */}
          <div className="lg:col-span-7 h-full overflow-hidden flex flex-col space-y-4 min-h-0">
            {/* Audio Media Player */}
            <AudioPlayer
              audioUrl={meeting.audio_url}
              totalDuration={meeting.duration || 1800}
              currentTime={currentTime}
              onTimeUpdate={(t) => setCurrentTime(t)}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onSeek={handleSeek}
              darkMode={darkMode}
            />

            {/* Interactive Transcript View */}
            <div className="flex-1 overflow-hidden min-h-0">
              <TranscriptView
                transcripts={meeting.transcripts || []}
                currentTime={currentTime}
                onSeek={handleSeek}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out AskFred AI Drawer */}
      <AskFredPanel
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        isOpen={isAskFredOpen}
        onClose={() => setIsAskFredOpen(false)}
        darkMode={darkMode}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        meeting={meeting}
        darkMode={darkMode}
      />

      {/* Edit Metadata Modal */}
      <EditMeetingModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        meeting={meeting}
        onUpdated={(updated) => setMeeting(updated)}
        darkMode={darkMode}
      />

      {/* Other workspace modals */}
      <LiveBotModal
        isOpen={isLiveBotOpen}
        onClose={() => setIsLiveBotOpen(false)}
        darkMode={darkMode}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        darkMode={darkMode}
      />

      <IntegrationsModal
        isOpen={isIntegrationsOpen}
        onClose={() => setIsIntegrationsOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
}

export default function MeetingDetailPage() {
  return (
    <ToastProvider>
      <MeetingDetailContent />
    </ToastProvider>
  );
}

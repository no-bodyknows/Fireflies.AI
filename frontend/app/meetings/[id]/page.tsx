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
import RescheduleModal from '@/components/modals/RescheduleModal';
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
  ExternalLink,
  Menu,
  BookOpen,
  MessageSquare,
  CalendarSync
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

  // Responsive & Mobile State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'summary' | 'transcript'>('summary');

  // Modals & Panels
  const [isAskFredOpen, setIsAskFredOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
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
    if (s === 'missed' || s === 'delayed') {
      return (
        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25">
          Missed
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
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenLiveBot={() => setIsLiveBotOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Meeting Header Bar */}
        <header
          className={`h-16 border-b px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md shrink-0 transition-colors ${
            darkMode ? 'bg-[#0b0d17]/85 border-slate-800/80' : 'bg-white/85 border-slate-200/90'
          }`}
        >
          {/* Back & Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 mr-2 sm:mr-4">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`p-2 rounded-xl border lg:hidden shrink-0 transition-colors ${
                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title="Open Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            <Link
              href="/"
              className={`p-2 rounded-xl border transition-colors shrink-0 ${
                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
              title="Back to Notebook"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1 className="text-xs sm:text-sm font-bold tracking-tight truncate max-w-[140px] sm:max-w-xs md:max-w-sm">{meeting.title}</h1>
                <div className="shrink-0">{renderStatusBadge(meeting.status)}</div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                <span>{formatDate(meeting.date)}</span>
                <span>•</span>
                <span>{formatDuration(meeting.duration)}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{meeting.participants?.length || 0} attendees</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Reschedule Button if Missed */}
            {(meeting.status === 'missed' || meeting.status === 'delayed') && (
              <button
                onClick={() => setIsRescheduleOpen(true)}
                className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all shadow-xs"
                title="Reschedule this missed meeting"
              >
                <CalendarSync className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reschedule</span>
              </button>
            )}

            {/* AskFred Button */}
            <button
              onClick={() => setIsAskFredOpen(true)}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AskFred AI</span>
              <span className="sm:hidden">Fred</span>
            </button>

            {/* Export Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                darkMode ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Download className="w-3.5 h-3.5 opacity-75" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
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

        {/* Mobile View Switcher (< lg) */}
        <div className={`lg:hidden flex items-center justify-around border-b px-3 py-2 shrink-0 ${
          darkMode ? 'bg-[#121422] border-slate-800' : 'bg-slate-100/70 border-slate-200'
        }`}>
          <button
            onClick={() => setMobileTab('summary')}
            className={`flex-1 py-1.5 px-3 mx-1 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
              mobileTab === 'summary'
                ? 'bg-violet-600 text-white shadow-xs'
                : darkMode
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI Notes & Tasks</span>
          </button>
          <button
            onClick={() => setMobileTab('transcript')}
            className={`flex-1 py-1.5 px-3 mx-1 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
              mobileTab === 'transcript'
                ? 'bg-violet-600 text-white shadow-xs'
                : darkMode
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Audio & Transcript</span>
          </button>
        </div>

        {/* Missed Meeting Reschedule Banner */}
        {(meeting.status === 'missed' || meeting.status === 'delayed') && (
          <div className={`mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            darkMode ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <div className="flex items-center space-x-2 min-w-0">
              <CalendarSync className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate font-medium">This meeting was missed. You can reschedule it to a new upcoming slot.</span>
            </div>
            <button
              onClick={() => setIsRescheduleOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
            >
              Reschedule Now
            </button>
          </div>
        )}

        {/* Desktop Split Workspace (>= lg) */}
        <div className="hidden lg:grid flex-1 overflow-hidden p-6 grid-cols-12 gap-5">
          {/* Left Column: AI Summary & Notes (5 cols) */}
          <div className="col-span-5 h-full overflow-hidden flex flex-col min-h-0">
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
          <div className="col-span-7 h-full overflow-hidden flex flex-col space-y-4 min-h-0">
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

        {/* Mobile / Tablet Responsive Workspace (< lg) */}
        <div className="flex lg:hidden flex-1 overflow-hidden p-3 flex-col space-y-3 min-h-0">
          {/* Sticky Player at Top for Both Tabs */}
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

          {/* Tab 1: AI Summary & Action Items */}
          {mobileTab === 'summary' && (
            <div className="flex-1 overflow-hidden min-h-0">
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
          )}

          {/* Tab 2: Interactive Transcript */}
          {mobileTab === 'transcript' && (
            <div className="flex-1 overflow-hidden min-h-0">
              <TranscriptView
                transcripts={meeting.transcripts || []}
                currentTime={currentTime}
                onSeek={handleSeek}
                darkMode={darkMode}
              />
            </div>
          )}
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

      {/* Reschedule Missed Meeting Modal */}
      <RescheduleModal
        isOpen={isRescheduleOpen}
        meeting={meeting}
        onClose={() => setIsRescheduleOpen(false)}
        onRescheduled={(updated) => setMeeting(updated)}
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

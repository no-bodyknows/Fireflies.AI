'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MeetingCard from '@/components/meetings/MeetingCard';
import MeetingRow from '@/components/meetings/MeetingRow';
import NewMeetingModal from '@/components/modals/NewMeetingModal';
import LiveBotModal from '@/components/modals/LiveBotModal';
import SettingsModal from '@/components/modals/SettingsModal';
import IntegrationsModal from '@/components/modals/IntegrationsModal';
import { ToastProvider, useToast } from '@/components/Toast';
import { Meeting, FilterStatus, ViewMode, SortOption } from '@/types';
import { fetchMeetings, deleteMeeting } from '@/lib/api';
import { formatDuration } from '@/lib/utils';
import {
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Sparkles,
  Bot,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterStatus>('all');
  const [selectedParticipant, setSelectedParticipant] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isLiveBotOpen, setIsLiveBotOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);

  const { showToast } = useToast();

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await fetchMeetings();
      setMeetings(data);
    } catch (err: any) {
      console.error(err);
      showToast('Could not reach backend API. Ensure FastAPI server is running on port 8000.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleDeleteMeeting = async (id: number) => {
    const previous = [...meetings];
    setMeetings((prev) => prev.filter((m) => m.id !== id));

    try {
      await deleteMeeting(id);
      showToast('Meeting deleted successfully', 'success');
    } catch (err: any) {
      setMeetings(previous);
      showToast('Failed to delete meeting', 'error');
    }
  };

  // Extract unique participants across all meetings
  const allParticipants = useMemo(() => {
    const names = new Set<string>();
    meetings.forEach((m) => {
      m.participants?.forEach((p) => {
        if (p.name) names.add(p.name);
      });
    });
    return Array.from(names);
  }, [meetings]);

  // Filter & Sort
  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((m) => {
        // Tab Status Filter
        if (activeTab !== 'all' && m.status !== activeTab) {
          return false;
        }

        // Participant Dropdown Filter
        if (selectedParticipant !== 'all') {
          const hasParticipant = m.participants?.some(
            (p) => p.name.toLowerCase() === selectedParticipant.toLowerCase()
          );
          if (!hasParticipant) return false;
        }

        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const titleMatch = m.title.toLowerCase().includes(q);
          const overviewMatch = m.summary?.overview?.toLowerCase().includes(q);
          const topicsMatch = m.summary?.key_topics?.toLowerCase().includes(q);
          const transcriptMatch = m.transcripts?.some(
            (t) => t.text.toLowerCase().includes(q) || t.speaker.toLowerCase().includes(q)
          );
          const participantMatch = m.participants?.some((p) => p.name.toLowerCase().includes(q));

          return titleMatch || overviewMatch || topicsMatch || transcriptMatch || participantMatch;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'duration-desc') {
          return b.duration - a.duration;
        }
        if (sortBy === 'duration-asc') {
          return a.duration - b.duration;
        }
        if (sortBy === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [meetings, activeTab, selectedParticipant, searchQuery, sortBy]);

  // Aggregate stats
  const totalDurationSeconds = meetings.reduce((sum, m) => sum + (m.duration || 0), 0);
  const totalActionItems = meetings.reduce((sum, m) => sum + (m.action_items?.length || 0), 0);

  return (
    <div className={`flex min-h-screen transition-colors ${darkMode ? 'bg-[#0b0d17] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      {/* Fireflies Navigation Sidebar */}
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenLiveBot={() => setIsLiveBotOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Universal Top Header */}
        <Header
          darkMode={darkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenNewMeeting={() => setIsNewMeetingOpen(true)}
          onOpenLiveBot={() => setIsLiveBotOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Page Title & Stats Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-extrabold tracking-tight">Meetings Notebook</h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    {meetings.length} Total
                  </span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Access full AI summaries, speaker-tagged transcripts, and actionable deliverables.
                </p>
              </div>

              {/* Quick Stat Badges */}
              <div className="flex items-center space-x-2 text-xs">
                <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <Clock className="w-3.5 h-3.5 text-violet-500" />
                  <span>{formatDuration(totalDurationSeconds)} transcribed</span>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{totalActionItems} action items</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Toolbar */}
            <div className={`p-3 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
              darkMode ? 'bg-[#121422] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              {/* Status Tabs */}
              <div className="flex items-center space-x-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                {[
                  { id: 'all', label: 'All Meetings' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'delayed', label: 'Delayed' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as FilterStatus)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-violet-600 text-white shadow-xs'
                        : darkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Controls: Participant, Sort, View Switcher */}
              <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                {/* Participant Dropdown */}
                <select
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="all">All Attendees</option>
                  {allParticipants.map((name, i) => (
                    <option key={i} value={name}>{name}</option>
                  ))}
                </select>

                {/* Sort By Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="duration-desc">Duration (Longest)</option>
                  <option value="duration-asc">Duration (Shortest)</option>
                  <option value="title-asc">Title (A-Z)</option>
                </select>

                {/* Grid / List View Toggle */}
                <div className={`flex items-center p-0.5 rounded-xl border ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'}`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="Grid card view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'table' ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="Table list view"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Meetings Display */}
            {loading ? (
              <div className="text-center py-24 space-y-3">
                <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-medium text-slate-400">Loading your meeting library...</p>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className={`text-center py-20 border rounded-2xl p-6 ${
                darkMode ? 'bg-[#121422] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold tracking-tight mb-1">No meetings match your filter</h3>
                <p className={`text-xs max-w-sm mx-auto mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Try clearing your search query or schedule a new meeting using our AI template generator.
                </p>
                <button
                  onClick={() => setIsNewMeetingOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Meeting</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onDelete={handleDeleteMeeting}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            ) : (
              <div className={`border rounded-2xl overflow-hidden divide-y ${
                darkMode ? 'bg-[#121422] border-slate-800 divide-slate-800' : 'bg-white border-slate-200 divide-slate-100 shadow-xs'
              }`}>
                {filteredMeetings.map((meeting) => (
                  <MeetingRow
                    key={meeting.id}
                    meeting={meeting}
                    onDelete={handleDeleteMeeting}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Modals */}
      <NewMeetingModal
        isOpen={isNewMeetingOpen}
        onClose={() => setIsNewMeetingOpen(false)}
        onCreated={loadMeetings}
        darkMode={darkMode}
      />

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

export default function MeetingsPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  MessageSquareQuote,
  Play,
  Pause,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Search,
  Volume2,
  Sparkles,
  Calendar,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { formatTime, getInitials, getSpeakerStyle } from '@/lib/utils';

interface SoundbiteItem {
  id: number;
  meetingId: number;
  meetingTitle: string;
  speaker: string;
  quote: string;
  startTime: number;
  endTime: number;
  tags: string[];
}

const DEFAULT_SOUNDBITES: SoundbiteItem[] = [
  {
    id: 1,
    meetingId: 1,
    meetingTitle: 'Sprint 42 Retrospective & Demo',
    speaker: 'Sarah Chen',
    quote: 'Our sprint velocity reached 48 points, up 15%. Moving Redis caching to the edge helped our p99 response times significantly.',
    startTime: 9,
    endTime: 25,
    tags: ['Architecture', 'Performance', 'Redis'],
  },
  {
    id: 2,
    meetingId: 2,
    meetingTitle: 'Enterprise AI Notetaker Discovery Call',
    speaker: 'Enterprise Lead',
    quote: 'Our account executives spend almost an hour per client manually typing notes into Salesforce. Having Fireflies sync summaries automatically is huge.',
    startTime: 13,
    endTime: 32,
    tags: ['Sales', 'CRM', 'Salesforce'],
  },
  {
    id: 3,
    meetingId: 3,
    meetingTitle: 'Q4 Product Strategy & Architecture Sync',
    speaker: 'Sarah Chen',
    quote: 'We need to migrate our real-time WebSocket connection to edge workers so audio packet seeking stays under 50ms for overseas attendees.',
    startTime: 10,
    endTime: 28,
    tags: ['Latency', 'WebSockets', 'Edge'],
  },
  {
    id: 4,
    meetingId: 1,
    meetingTitle: 'Sprint 42 Retrospective & Demo',
    speaker: 'Love Kumar',
    quote: 'Let us make sure the interactive transcripts have sub-second timestamp seek sync so attendees can jump right to key discussion points.',
    startTime: 46,
    endTime: 60,
    tags: ['UX', 'Audio Player', 'Milestone'],
  },
  {
    id: 5,
    meetingId: 4,
    meetingTitle: 'Weekly Engineering All-Hands',
    speaker: 'David Miller',
    quote: 'The unit test coverage for our FastAPI endpoints is now up to 92%, and our Dockerized CI build takes under 2 minutes.',
    startTime: 12,
    endTime: 29,
    tags: ['Testing', 'CI/CD', 'Docker'],
  },
];

interface SoundbitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function SoundbitesModal({ isOpen, onClose, darkMode }: SoundbitesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState('all');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [soundbites, setSoundbites] = useState<SoundbiteItem[]>(DEFAULT_SOUNDBITES);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // If modal closes, stop playing audio
    if (!isOpen && playingId !== null) {
      setPlayingId(null);
      if (audioRef.current) audioRef.current.pause();
    }
  }, [isOpen, playingId]);

  if (!isOpen) return null;

  const handlePlaySoundbite = (id: number) => {
    if (playingId === id) {
      setPlayingId(null);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setPlayingId(id);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setTimeout(() => {
        setPlayingId(null);
      }, 7000);
    }
  };

  const handleCopyQuote = async (text: string, speaker: string, id: number) => {
    await navigator.clipboard.writeText(`"${text}" — ${speaker}`);
    setCopiedId(id);
    showToast('Soundbite quote copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareSoundbite = (title: string, speaker: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/#soundbite-${title}`);
    showToast(`Shared soundbite by ${speaker}! Link copied. 🔗`, 'success');
  };

  // Filter soundbites
  const filtered = soundbites.filter((s) => {
    const matchSearch =
      !searchQuery.trim() ||
      s.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchMeeting = selectedMeeting === 'all' || s.meetingTitle === selectedMeeting;
    return matchSearch && matchMeeting;
  });

  const uniqueMeetings = Array.from(new Set(soundbites.map((s) => s.meetingTitle)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl mx-auto rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
          darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Hidden Audio Player for Previewing Soundbites */}
        <audio
          ref={audioRef}
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          onEnded={() => setPlayingId(null)}
        />

        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 mr-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight">Soundbites Library</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-500/15 text-violet-500 border border-violet-500/20">
                  {filtered.length} clips
                </span>
              </div>
              <p className={`text-[11px] sm:text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Curated audio clips, memorable quotes, and soundbite highlights from meetings
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

        {/* Toolbar: Search & Meeting Filter */}
        <div className={`p-3 sm:p-4 border-b flex flex-col sm:flex-row gap-2.5 ${darkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotes, speakers, or tags..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <select
            value={selectedMeeting}
            onChange={(e) => setSelectedMeeting(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">All Source Meetings</option>
            {uniqueMeetings.map((m, i) => (
              <option key={i} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Soundbites List */}
        <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquareQuote className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-400 font-medium">No soundbites match your search criteria.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const isPlaying = playingId === item.id;
              const speakerStyle = getSpeakerStyle(item.speaker);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPlaying
                      ? 'border-violet-500/50 bg-violet-500/10 dark:bg-violet-950/20 shadow-md'
                      : darkMode
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top: Speaker & Timestamp */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-5 h-5 rounded-full ${speakerStyle.bg} ${speakerStyle.text} flex items-center justify-center text-[9px] font-bold`}>
                        {getInitials(item.speaker)}
                      </div>
                      <span className="text-xs font-bold">{item.speaker}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        [{formatTime(item.startTime)} - {formatTime(item.endTime)}]
                      </span>
                    </div>

                    <Link
                      href={`/meetings/${item.meetingId}`}
                      onClick={onClose}
                      className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center space-x-1"
                    >
                      <span className="truncate max-w-[150px] sm:max-w-xs">{item.meetingTitle}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </Link>
                  </div>

                  {/* Quote Text */}
                  <p className={`text-xs italic leading-relaxed pl-7 mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    &ldquo;{item.quote}&rdquo;
                  </p>

                  {/* Player & Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/80 pl-7">
                    {/* Play Snippet Button */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePlaySoundbite(item.id)}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          isPlaying
                            ? 'bg-violet-600 text-white'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        <span>{isPlaying ? 'Playing...' : 'Play Clip'}</span>
                      </button>

                      {/* Animated Waveform Indicator */}
                      {isPlaying && (
                        <div className="flex items-center space-x-0.5">
                          {[30, 80, 50, 100, 60, 90, 40].map((h, idx) => (
                            <span
                              key={idx}
                              className="w-0.5 bg-violet-500 rounded-full animate-pulse"
                              style={{ height: `${(h * 14) / 100}px`, animationDelay: `${idx * 80}ms` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tags & Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {item.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          #{t}
                        </span>
                      ))}

                      <button
                        onClick={() => handleCopyQuote(item.quote, item.speaker, item.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Copy quote"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleShareSoundbite(item.meetingTitle, item.speaker)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Share soundbite link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-between items-center ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
          <span className="text-[11px] text-slate-400">Bookmark any transcript quote in meeting view to add to Soundbites</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useMemo } from 'react';
import { Transcript } from '@/types';
import { Search, Copy, Check, Bookmark, Sparkles, Filter, X } from 'lucide-react';
import { formatTime, getInitials, getSpeakerStyle } from '@/lib/utils';
import { useToast } from '@/components/Toast';

interface TranscriptViewProps {
  transcripts: Transcript[];
  currentTime: number;
  onSeek: (time: number) => void;
  darkMode: boolean;
}

export default function TranscriptView({
  transcripts,
  currentTime,
  onSeek,
  darkMode,
}: TranscriptViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  const { showToast } = useToast();

  // Extract unique speakers for filter dropdown
  const uniqueSpeakers = useMemo(() => {
    return Array.from(new Set(transcripts.map((t) => t.speaker))).filter(Boolean);
  }, [transcripts]);

  // Find currently active transcript segment based on currentTime
  const activeSegmentIndex = useMemo(() => {
    return transcripts.findIndex((t, idx) => {
      const nextStartTime = idx < transcripts.length - 1 ? transcripts[idx + 1].start_time : t.start_time + 20;
      const endTime = t.end_time || nextStartTime;
      return currentTime >= t.start_time && currentTime < endTime;
    });
  }, [transcripts, currentTime]);

  // Filter transcripts by search query & speaker
  const filteredTranscripts = useMemo(() => {
    return transcripts.filter((t) => {
      const matchSpeaker = selectedSpeaker === 'All' || t.speaker.toLowerCase() === selectedSpeaker.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        t.text.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        t.speaker.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchSpeaker && matchSearch;
    });
  }, [transcripts, searchQuery, selectedSpeaker]);

  const handleCopyQuote = async (e: React.MouseEvent, text: string, speaker: string, time: number, idx: number) => {
    e.stopPropagation();
    const formatted = `[${formatTime(time)}] ${speaker}: "${text}"`;
    await navigator.clipboard.writeText(formatted);
    setCopiedId(idx);
    showToast('Quote copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleBookmark = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    if (bookmarkedIds.includes(idx)) {
      setBookmarkedIds(bookmarkedIds.filter((id) => id !== idx));
      showToast('Soundbite removed from bookmarks', 'info');
    } else {
      setBookmarkedIds([...bookmarkedIds, idx]);
      showToast('Saved segment as Soundbite highlight! 🎙️', 'success');
    }
  };

  // Helper to highlight matching search words inside text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase().trim() ? (
        <mark key={i} className="bg-amber-300 dark:bg-amber-400/40 text-black dark:text-amber-200 px-0.5 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className={`border rounded-2xl flex flex-col h-full overflow-hidden transition-colors shadow-sm ${
        darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Search & Filter Toolbar */}
      <div className={`p-3 sm:p-4 border-b flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 ${darkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript text, keywords, or speakers..."
            className={`w-full pl-8 pr-7 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Speaker filter & match count */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between">
          <select
            value={selectedSpeaker}
            onChange={(e) => setSelectedSpeaker(e.target.value)}
            className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-xl border text-xs focus:outline-none ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="All">All Speakers ({uniqueSpeakers.length})</option>
            {uniqueSpeakers.map((spk, idx) => (
              <option key={idx} value={spk}>{spk}</option>
            ))}
          </select>

          {searchQuery && (
            <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 shrink-0">
              {filteredTranscripts.length} {filteredTranscripts.length === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>
      </div>

      {/* Transcript Body List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/50">
        {filteredTranscripts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xs text-slate-400 font-medium">No transcript segments match your filter.</p>
          </div>
        ) : (
          filteredTranscripts.map((t, idx) => {
            const isCurrentlyPlaying = idx === activeSegmentIndex;
            const isBookmarked = bookmarkedIds.includes(idx);
            const style = getSpeakerStyle(t.speaker);

            return (
              <div
                key={idx}
                onClick={() => onSeek(t.start_time)}
                className={`pt-3 first:pt-0 pb-2 px-3 rounded-xl transition-all duration-150 cursor-pointer group relative ${
                  isCurrentlyPlaying
                    ? 'bg-violet-500/10 border border-violet-500/30 dark:bg-violet-950/30 dark:border-violet-500/40 shadow-sm'
                    : darkMode
                    ? 'hover:bg-slate-900/60'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Speaker Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    {/* Avatar */}
                    <div
                      className={`w-6 h-6 rounded-full ${style.bg} ${style.text} flex items-center justify-center text-[10px] font-bold shadow-xs`}
                    >
                      {getInitials(t.speaker)}
                    </div>
                    {/* Name */}
                    <span className="text-xs font-bold tracking-tight">{t.speaker}</span>
                    {/* Timestamp Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(t.start_time);
                      }}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white transition-colors"
                      title="Seek player to timestamp"
                    >
                      {formatTime(t.start_time)}
                    </button>
                    {isCurrentlyPlaying && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleCopyQuote(e, t.text, t.speaker, t.start_time, idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Copy quote"
                    >
                      {copiedId === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => handleToggleBookmark(e, idx)}
                      className={`p-1 rounded-md transition-colors ${
                        isBookmarked
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={isBookmarked ? 'Remove Soundbite' : 'Save as Soundbite'}
                    >
                      <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Transcript text */}
                <p className={`text-xs leading-relaxed pl-8 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {renderHighlightedText(t.text, searchQuery)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { Meeting } from '@/types';
import { Calendar, Clock, Trash2, ArrowUpRight, CheckSquare } from 'lucide-react';
import { formatDate, formatDuration, getInitials, getSpeakerStyle } from '@/lib/utils';

interface MeetingRowProps {
  meeting: Meeting;
  onDelete: (id: number) => void;
  darkMode: boolean;
}

export default function MeetingRow({ meeting, onDelete, darkMode }: MeetingRowProps) {
  const completedActions = meeting.action_items?.filter((a) => a.is_completed).length || 0;
  const totalActions = meeting.action_items?.length || 0;

  const renderStatusBadge = () => {
    const s = meeting.status?.toLowerCase();
    if (s === 'completed') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
          Completed
        </span>
      );
    }
    if (s === 'upcoming') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-500/15 text-violet-500 border border-violet-500/25">
          Upcoming
        </span>
      );
    }
    if (s === 'missed' || s === 'delayed') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25">
          Missed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-500">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        <span>Live</span>
      </span>
    );
  };

  return (
    <div
      className={`flex items-center justify-between p-3 sm:p-3.5 border-b transition-colors group ${
        darkMode ? 'border-slate-800/80 hover:bg-slate-900/60' : 'border-slate-100 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center space-x-2.5 sm:space-x-4 flex-1 min-w-0 mr-2 sm:mr-4">
        <div className="shrink-0">{renderStatusBadge()}</div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/meetings/${meeting.id}`}
            className="text-xs font-bold tracking-tight hover:text-violet-600 dark:hover:text-violet-400 transition-colors truncate block"
          >
            {meeting.title}
          </Link>
          <p className={`text-[11px] truncate mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {meeting.summary?.overview || 'No summary'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-6 text-xs text-slate-400 shrink-0">
        {/* Attendees */}
        <div className="hidden sm:flex items-center -space-x-1.5 overflow-hidden">
          {meeting.participants?.slice(0, 3).map((p, idx) => {
            const style = getSpeakerStyle(p.name);
            return (
              <div
                key={idx}
                title={p.name}
                className={`w-5 h-5 rounded-full border border-white dark:border-[#121422] ${style.bg} ${style.text} flex items-center justify-center text-[8px] font-bold`}
              >
                {getInitials(p.name)}
              </div>
            );
          })}
        </div>

        {/* Date */}
        <div className="hidden md:flex items-center space-x-1 w-24">
          <Calendar className="w-3 h-3 opacity-70" />
          <span className="text-[11px]">{formatDate(meeting.date)}</span>
        </div>

        {/* Duration */}
        <div className="hidden lg:flex items-center space-x-1 w-16">
          <Clock className="w-3 h-3 opacity-70" />
          <span className="text-[11px]">{formatDuration(meeting.duration)}</span>
        </div>

        {/* Actions count */}
        {totalActions > 0 && (
          <div className="hidden xl:flex items-center space-x-1 w-12 text-[11px]">
            <CheckSquare className="w-3 h-3 text-violet-500" />
            <span>{completedActions}/{totalActions}</span>
          </div>
        )}

        {/* Links & Delete */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Link
            href={`/meetings/${meeting.id}`}
            className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-colors shrink-0"
          >
            <span className="hidden sm:inline">Open Notes &rarr;</span>
            <span className="sm:hidden">Notes &rarr;</span>
          </Link>
          <button
            onClick={() => {
              if (confirm(`Delete "${meeting.title}"?`)) {
                onDelete(meeting.id);
              }
            }}
            className="p-1 rounded text-slate-400 hover:text-rose-500 transition-opacity"
            title="Delete meeting"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

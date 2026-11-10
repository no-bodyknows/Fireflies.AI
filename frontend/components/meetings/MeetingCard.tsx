'use client';
import Link from 'next/link';
import { Meeting } from '@/types';
import { Calendar, Clock, Users, Trash2, ArrowUpRight, CheckSquare, Sparkles } from 'lucide-react';
import { formatDate, formatDuration, getInitials, getSpeakerStyle } from '@/lib/utils';

interface MeetingCardProps {
  meeting: Meeting;
  onDelete: (id: number) => void;
  darkMode: boolean;
}

export default function MeetingCard({ meeting, onDelete, darkMode }: MeetingCardProps) {
  const completedActions = meeting.action_items?.filter((a) => a.is_completed).length || 0;
  const totalActions = meeting.action_items?.length || 0;

  const renderStatusBadge = () => {
    const s = meeting.status?.toLowerCase();
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
      <span className="inline-flex items-center space-x-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-500 border border-rose-500/25">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        <span>Live</span>
      </span>
    );
  };

  return (
    <div
      className={`border rounded-2xl p-5 transition-all duration-200 group flex flex-col justify-between hover:shadow-lg ${
        darkMode
          ? 'bg-[#121422] border-slate-800 hover:border-violet-500/40 hover:shadow-violet-950/20'
          : 'bg-white border-slate-200/90 hover:border-violet-400 hover:shadow-violet-100/50'
      }`}
    >
      <div>
        {/* Header: Title & Badges */}
        <div className="flex justify-between items-start gap-2 mb-2.5">
          <Link
            href={`/meetings/${meeting.id}`}
            className="text-sm font-bold tracking-tight line-clamp-1 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex-1"
          >
            {meeting.title}
          </Link>
          <div className="flex items-center space-x-1.5 shrink-0">
            {renderStatusBadge()}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${meeting.title}"?`)) {
                  onDelete(meeting.id);
                }
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
              title="Delete meeting"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Date & Duration Info */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-400 mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <span>{formatDate(meeting.date)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span>{formatDuration(meeting.duration)}</span>
          </div>
        </div>

        {/* Summary Snippet */}
        <p className={`text-xs leading-relaxed line-clamp-2 mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {meeting.summary?.overview || 'No executive summary generated yet.'}
        </p>
      </div>

      <div>
        {/* Participants Avatars */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {meeting.participants?.slice(0, 4).map((p, idx) => {
              const style = getSpeakerStyle(p.name);
              return (
                <div
                  key={idx}
                  title={p.name}
                  className={`w-6 h-6 rounded-full border-2 border-white dark:border-[#121422] ${style.bg} ${style.text} flex items-center justify-center text-[9px] font-bold`}
                >
                  {getInitials(p.name)}
                </div>
              );
            })}
            {(meeting.participants?.length || 0) > 4 && (
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#121422] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[9px] font-bold">
                +{meeting.participants.length - 4}
              </div>
            )}
          </div>

          {/* Action Items pill & View Link */}
          <div className="flex items-center space-x-2">
            {totalActions > 0 && (
              <span className="flex items-center space-x-1 text-[11px] font-medium text-slate-400">
                <CheckSquare className="w-3 h-3 text-violet-500" />
                <span>{completedActions}/{totalActions}</span>
              </span>
            )}
            <Link
              href={`/meetings/${meeting.id}`}
              className="flex items-center space-x-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
            >
              <span>Notes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

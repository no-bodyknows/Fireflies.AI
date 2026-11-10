'use client';
import { useState } from 'react';
import {
  X,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Activity,
  Layers
} from 'lucide-react';
import { getInitials, getSpeakerStyle } from '@/lib/utils';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function AnalyticsModal({ isOpen, onClose, darkMode }: AnalyticsModalProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  if (!isOpen) return null;

  const speakers = [
    { name: 'Love Kumar', pct: 38, words: 1420 },
    { name: 'Sarah Chen', pct: 32, words: 1180 },
    { name: 'David Miller', pct: 18, words: 690 },
    { name: 'Enterprise Lead', pct: 12, words: 440 },
  ];

  const topics = [
    { name: 'Architecture', count: 4, growth: '+25%' },
    { name: 'RedisCache', count: 3, growth: '+40%' },
    { name: 'PlaywrightTests', count: 2, growth: '+15%' },
    { name: 'CRMIntegration', count: 2, growth: '+10%' },
    { name: 'LatencyOptimization', count: 2, growth: '+30%' },
    { name: 'DevSecOps', count: 1, growth: 'New' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl mx-auto rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
          darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 mr-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight">Conversation Analytics & Trends</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                  Live Insights
                </span>
              </div>
              <p className={`text-[11px] sm:text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Workspace intelligence, sentiment scores, and speaker cadence metrics
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

        {/* Time Range Filter Bar */}
        <div className={`px-4 sm:px-6 py-2.5 border-b flex items-center justify-between ${darkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
          <span className="text-xs font-semibold text-slate-400">Analysis Window:</span>
          <div className="flex items-center space-x-1">
            {[
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'all', label: 'All Time' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeRange === tab.id
                    ? 'bg-violet-600 text-white shadow-xs'
                    : darkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1">
                <Layers className="w-3.5 h-3.5 text-violet-500" />
                <span>Total Calls</span>
              </div>
              <p className="text-lg font-extrabold tracking-tight">6 Meetings</p>
              <span className="text-[10px] text-emerald-500 font-semibold">+2 vs last week</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Talk Time</span>
              </div>
              <p className="text-lg font-extrabold tracking-tight">3h 45m</p>
              <span className="text-[10px] text-violet-500 font-semibold">100% transcribed</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1">
                <Activity className="w-3.5 h-3.5 text-pink-500" />
                <span>Avg Cadence</span>
              </div>
              <p className="text-lg font-extrabold tracking-tight">144 wpm</p>
              <span className="text-[10px] text-slate-400 font-semibold">Optimal pace</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1">
                <Smile className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sentiment</span>
              </div>
              <p className="text-lg font-extrabold text-emerald-500 tracking-tight">78% Positive</p>
              <span className="text-[10px] text-emerald-500 font-semibold">+4% high morale</span>
            </div>
          </div>

          {/* Section: Sentiment Analysis Breakdown */}
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Sentiment Distribution</h3>
              <span className="text-[11px] font-semibold text-violet-500">Based on 3,730 words</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-center">
                <Smile className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <span className="text-base font-extrabold text-emerald-500">74%</span>
                <p className="text-[11px] font-semibold mt-0.5">Collaborative & Constructive</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                <Meh className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-base font-extrabold text-slate-400">22%</span>
                <p className="text-[11px] font-semibold mt-0.5">Neutral / Technical Sync</p>
              </div>

              <div className="p-3 rounded-xl border border-rose-500/25 bg-rose-500/10 text-center">
                <Frown className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                <span className="text-base font-extrabold text-rose-500">4%</span>
                <p className="text-[11px] font-semibold mt-0.5">Blockers & Risk Flags</p>
              </div>
            </div>
          </div>

          {/* Section: Speaker Talk-Time Leaderboard */}
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
              Speaker Talk-Time Share Leaderboard
            </h3>

            <div className="space-y-3">
              {speakers.map((s, idx) => {
                const style = getSpeakerStyle(s.name);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded-full ${style.bg} ${style.text} flex items-center justify-center text-[9px] font-bold`}>
                          {getInitials(s.name)}
                        </div>
                        <span className="font-semibold">{s.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {s.pct}% ({s.words} words)
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Top Trending Topics Cloud */}
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Top Discussion Keywords & Topic Velocity
            </h3>

            <div className="flex flex-wrap gap-2">
              {topics.map((t, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800 text-slate-200'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-bold text-violet-600 dark:text-violet-400">#{t.name}</span>
                  <span className="text-slate-400 text-[10px]">({t.count} calls)</span>
                  <span className="text-emerald-500 text-[10px] font-bold">{t.growth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
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

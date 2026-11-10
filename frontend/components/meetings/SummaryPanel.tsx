'use client';
import { useState } from 'react';
import { Summary, ActionItem, Participant, Transcript } from '@/types';
import { CheckSquare, Square, Plus, Trash2, Sparkles, BarChart2, BookOpen, Clock, Users } from 'lucide-react';
import { addActionItem, toggleActionItem, deleteActionItem } from '@/lib/api';
import { formatTime, getInitials, getSpeakerStyle } from '@/lib/utils';
import { useToast } from '@/components/Toast';

interface SummaryPanelProps {
  meetingId: number;
  summary?: Summary;
  actionItems: ActionItem[];
  participants: Participant[];
  transcripts: Transcript[];
  onActionItemsChange: (items: ActionItem[]) => void;
  onSeek: (time: number) => void;
  darkMode: boolean;
}

export default function SummaryPanel({
  meetingId,
  summary,
  actionItems,
  participants,
  transcripts,
  onActionItemsChange,
  onSeek,
  darkMode,
}: SummaryPanelProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'actions' | 'analytics'>('summary');
  const [newTask, setNewTask] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const { showToast } = useToast();

  const handleToggleAction = async (actionId: number) => {
    // Optimistic UI update
    const previous = [...actionItems];
    const updated = actionItems.map((a) => (a.id === actionId ? { ...a, is_completed: !a.is_completed } : a));
    onActionItemsChange(updated);

    try {
      await toggleActionItem(actionId);
      const isNowDone = updated.find((a) => a.id === actionId)?.is_completed;
      showToast(isNowDone ? 'Action item marked as complete! ✅' : 'Action item reopened.', 'success');
    } catch {
      onActionItemsChange(previous);
      showToast('Failed to update action item.', 'error');
    }
  };

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      setIsAdding(true);
      const created = await addActionItem(meetingId, {
        task: newTask.trim(),
        assignee: newAssignee.trim() || undefined,
        is_completed: false,
      });
      onActionItemsChange([...actionItems, created]);
      setNewTask('');
      setNewAssignee('');
      showToast('New action item added! 📌', 'success');
    } catch {
      showToast('Failed to add action item.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteAction = async (actionId: number) => {
    const previous = [...actionItems];
    onActionItemsChange(actionItems.filter((a) => a.id !== actionId));

    try {
      await deleteActionItem(actionId);
      showToast('Action item removed.', 'info');
    } catch {
      onActionItemsChange(previous);
      showToast('Failed to delete action item.', 'error');
    }
  };

  // Calculate talk-time metrics
  const speakerStats = participants.map((p) => {
    const speakerTranscripts = transcripts.filter((t) => t.speaker?.toLowerCase() === p.name.toLowerCase());
    const totalWords = speakerTranscripts.reduce((sum, t) => sum + t.text.split(/\s+/).length, 0);
    return { name: p.name, words: totalWords };
  });
  const totalAllWords = speakerStats.reduce((s, p) => s + p.words, 0) || 1;

  // Split topics into pill list
  const topicList = summary?.key_topics
    ? summary.key_topics.split(/[,•;]+/).map((t) => t.trim()).filter(Boolean)
    : [];

  const completedCount = actionItems.filter((a) => a.is_completed).length;

  return (
    <div
      className={`border rounded-2xl flex flex-col h-full overflow-hidden transition-colors shadow-sm ${
        darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header Tabs */}
      <div className={`flex border-b px-3 sm:px-4 pt-3 space-x-3 sm:space-x-6 text-xs font-semibold overflow-x-auto no-scrollbar ${darkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
        {[
          { id: 'summary', label: 'AI Notes & Outline', icon: BookOpen },
          { id: 'actions', label: `Action Items (${completedCount}/${actionItems.length})`, icon: CheckSquare },
          { id: 'analytics', label: 'Speaker Analytics', icon: BarChart2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 pb-2.5 border-b-2 shrink-0 transition-all ${
                isActive
                  ? 'border-violet-600 text-violet-600 dark:text-violet-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: AI Notes & Outline */}
      {activeTab === 'summary' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Executive Summary */}
          <div>
            <div className="flex items-center space-x-2 text-violet-600 dark:text-violet-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Executive AI Summary</span>
            </div>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {summary?.overview || 'No AI summary generated for this meeting.'}
            </p>
          </div>

          {/* Key Topics & Chapters */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Key Topics & Discussion Chapters
            </h3>
            {topicList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {topicList.map((topic, idx) => (
                  <span
                    key={idx}
                    className={`text-xs font-medium px-3 py-1 rounded-full border transition-all hover:scale-[1.02] ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-violet-500/50'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-violet-500'
                    }`}
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No key topics indexed.</p>
            )}
          </div>

          {/* Timestamp Chapters / Quick Jumps */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Interactive Discussion Jumps
            </h3>
            <div className="space-y-1.5">
              {transcripts.slice(0, 5).map((t, i) => (
                <button
                  key={i}
                  onClick={() => onSeek(t.start_time)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs text-left transition-colors ${
                    darkMode
                      ? 'bg-slate-900/60 border-slate-800 hover:border-violet-500/50 text-slate-200'
                      : 'bg-slate-50 border-slate-200 hover:border-violet-500 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <Clock className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span className="font-semibold text-[11px] shrink-0">[{formatTime(t.start_time)}]</span>
                    <span className="truncate text-slate-400">{t.speaker}: {t.text}</span>
                  </div>
                  <span className="text-[10px] text-violet-500 font-bold shrink-0">Jump &rarr;</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Action Items */}
      {activeTab === 'actions' && (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Extracted Deliverables
              </span>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                {completedCount} of {actionItems.length} completed
              </span>
            </div>

            {actionItems.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400">No action items recorded yet.</p>
              </div>
            ) : (
              actionItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start justify-between p-2.5 rounded-xl border transition-all group ${
                    item.is_completed
                      ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800'
                      : darkMode
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    onClick={() => handleToggleAction(item.id)}
                    className="flex items-start space-x-2.5 cursor-pointer flex-1 mr-2"
                  >
                    <button className="mt-0.5 text-violet-600 focus:outline-none shrink-0">
                      {item.is_completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 hover:text-violet-500" />
                      )}
                    </button>
                    <div>
                      <p
                        className={`text-xs leading-snug ${
                          item.is_completed ? 'line-through text-slate-400' : 'font-medium'
                        }`}
                      >
                        {item.task}
                      </p>
                      {item.assignee && (
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                          @{item.assignee}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAction(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Action Item Inline Form */}
          <form onSubmit={handleAddAction} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              + Add Custom Action Item
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                placeholder="What needs to be done?..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className={`flex-1 sm:flex-2 px-3 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
                }`}
              />
              <input
                type="text"
                placeholder="Assignee..."
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
                }`}
              />
              <button
                type="submit"
                disabled={isAdding}
                className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-colors shrink-0 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Speaker Analytics & Sentiment */}
      {activeTab === 'analytics' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Sentiment Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Sentiment Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10">
                <span className="text-base font-extrabold text-emerald-500">76%</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Positive / Collaborative</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <span className="text-base font-extrabold text-slate-400">22%</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Neutral / Objective</p>
              </div>
              <div className="p-3 rounded-xl border border-rose-500/25 bg-rose-500/10">
                <span className="text-base font-extrabold text-rose-500">2%</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Critical / Blockers</p>
              </div>
            </div>
          </div>

          {/* Talk-Time Share per Participant */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Speaker Talk-Time Share
            </h3>
            <div className="space-y-3">
              {speakerStats.map((s, idx) => {
                const pct = Math.round((s.words / totalAllWords) * 100);
                const style = getSpeakerStyle(s.name);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-1.5">
                        <div className={`w-4 h-4 rounded-full ${style.bg} ${style.text} flex items-center justify-center text-[8px] font-bold`}>
                          {getInitials(s.name)}
                        </div>
                        <span className="font-semibold">{s.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{pct}% ({s.words} words)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">Average Cadence</span>
              <span className="font-bold text-sm">142 words/min</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Questions Asked</span>
              <span className="font-bold text-sm">8 inquiries</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

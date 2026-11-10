'use client';
import { useState } from 'react';
import { X, FileText, Sparkles, Upload, Plus, Trash2, Users, CheckSquare, AlertCircle } from 'lucide-react';
import { createMeeting } from '@/lib/api';
import { parseTranscriptText } from '@/lib/utils';
import { useToast } from '@/components/Toast';

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  darkMode: boolean;
}

const SAMPLE_TEMPLATES = [
  {
    name: 'Sprint Retrospective & Demo',
    title: 'Sprint 42 Retrospective & Demo',
    duration: 1800,
    participants: [{ name: 'Love Kumar' }, { name: 'Sarah Chen' }, { name: 'David Miller' }],
    overview: 'Sprint 42 retrospective focusing on velocity increase, backend microservice benchmarks, and resolving CI pipeline flaky tests.',
    key_topics: 'Velocity Analysis, Docker Cache Optimization, Playwright Tests, Team Morale',
    transcripts: [
      { speaker: 'Love Kumar', start_time: 0, end_time: 8, text: 'Welcome team. Let us review what went well and what we can improve in Sprint 42.' },
      { speaker: 'Sarah Chen', start_time: 9, end_time: 25, text: 'Our sprint velocity reached 48 points, up 15%. Moving Redis caching to the edge helped our p99 response times significantly.' },
      { speaker: 'David Miller', start_time: 26, end_time: 45, text: 'The only pain point was our end-to-end integration tests timing out on GitHub Actions.' },
      { speaker: 'Love Kumar', start_time: 46, end_time: 60, text: 'Understood. Let us isolate the flaky network tests and configure proper retry mechanisms.' }
    ],
    action_items: [
      { task: 'Refactor end-to-end test suite to remove network race conditions', assignee: 'David Miller', is_completed: false },
      { task: 'Publish Sprint 42 release notes to Slack announcements', assignee: 'Sarah Chen', is_completed: true }
    ]
  },
  {
    name: 'Client Discovery & Requirements',
    title: 'Enterprise AI Notetaker Discovery Call',
    duration: 2100,
    participants: [{ name: 'Love Kumar' }, { name: 'Enterprise Lead' }],
    overview: 'In-depth requirements discovery with prospective enterprise client reviewing automatic CRM sync, data privacy, and custom vocabulary.',
    key_topics: 'CRM Integration, Custom Vocabulary, SSO & SCIM, Audio Player Seeking',
    transcripts: [
      { speaker: 'Love Kumar', start_time: 0, end_time: 12, text: 'Thank you for connecting today. How is your team currently handling post-call documentation?' },
      { speaker: 'Enterprise Lead', start_time: 13, end_time: 32, text: 'Our account executives spend almost an hour per client manually typing notes into Salesforce.' },
      { speaker: 'Love Kumar', start_time: 33, end_time: 55, text: 'Fireflies eliminates that completely by syncing structured executive summaries and action items straight to the contact record.' }
    ],
    action_items: [
      { task: 'Send Salesforce integration sandbox walkthrough video', assignee: 'Love Kumar', is_completed: false },
      { task: 'Follow up with pricing tier for 250 enterprise seats', assignee: 'Love Kumar', is_completed: false }
    ]
  }
];

export default function NewMeetingModal({
  isOpen,
  onClose,
  onCreated,
  darkMode,
}: NewMeetingModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'upload' | 'templates'>('form');

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [status, setStatus] = useState<'completed' | 'upcoming' | 'delayed'>('completed');
  const [audioUrl, setAudioUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [overview, setOverview] = useState('');
  const [keyTopics, setKeyTopics] = useState('');

  // Participants & Action Items
  const [participants, setParticipants] = useState<{ name: string; email?: string }[]>([
    { name: 'Love Kumar', email: 'love@fireflies.ai' }
  ]);
  const [newParticipant, setNewParticipant] = useState('');

  const [actionItems, setActionItems] = useState<{ task: string; assignee?: string; is_completed: boolean }[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newAssignee, setNewAssignee] = useState('');

  // Upload / Paste State
  const [rawTranscriptText, setRawTranscriptText] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleAddParticipant = () => {
    if (!newParticipant.trim()) return;
    setParticipants([...participants, { name: newParticipant.trim() }]);
    setNewParticipant('');
  };

  const handleRemoveParticipant = (idx: number) => {
    setParticipants(participants.filter((_, i) => i !== idx));
  };

  const handleAddActionItem = () => {
    if (!newTask.trim()) return;
    setActionItems([...actionItems, { task: newTask.trim(), assignee: newAssignee.trim() || undefined, is_completed: false }]);
    setNewTask('');
    setNewAssignee('');
  };

  const handleRemoveActionItem = (idx: number) => {
    setActionItems(actionItems.filter((_, i) => i !== idx));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawTranscriptText(content);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      showToast(`Loaded ${file.name} successfully`, 'info');
    };
    reader.readAsText(file);
  };

  const handleApplyTemplate = (tpl: typeof SAMPLE_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setDurationMinutes(Math.round(tpl.duration / 60));
    setParticipants(tpl.participants);
    setOverview(tpl.overview);
    setKeyTopics(tpl.key_topics);
    setActionItems(tpl.action_items);
    setActiveTab('form');
    showToast(`Loaded template: "${tpl.name}"`, 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a meeting title.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let parsedTranscripts: any[] = [];
      if (rawTranscriptText.trim()) {
        parsedTranscripts = parseTranscriptText(rawTranscriptText);
        // Also extract participant names from parsed transcripts if participants list is small
        const speakerNames = Array.from(new Set(parsedTranscripts.map((t) => t.speaker)));
        speakerNames.forEach((name) => {
          if (!participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
            participants.push({ name });
          }
        });
      }

      // Default mock transcripts if none provided
      if (parsedTranscripts.length === 0) {
        parsedTranscripts = [
          {
            speaker: participants[0]?.name || 'Host',
            start_time: 0,
            end_time: 15,
            text: `Welcome everyone to ${title.trim()}. Today we're reviewing our core goals, updates, and upcoming deliverables.`
          },
          {
            speaker: participants[1]?.name || 'Attendee',
            start_time: 16,
            end_time: 35,
            text: `Glad to be here. All current tasks are progressing on schedule. Let's make sure we log all action items.`
          }
        ];
      }

      const payload = {
        title: title.trim(),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        duration: durationMinutes * 60,
        status,
        audio_url: audioUrl.trim(),
        participants: participants.length > 0 ? participants : [{ name: 'Love Kumar' }],
        transcripts: parsedTranscripts,
        summary: {
          overview: overview.trim() || `Discussion centered on ${title.trim()} objectives, project milestones, and team deliverables.`,
          key_topics: keyTopics.trim() || 'Project Planning, Team Execution, Deliverables'
        },
        action_items: actionItems
      };

      await createMeeting(payload);
      showToast('Meeting created successfully!', 'success');
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create meeting');
      showToast(err.message || 'Failed to create meeting', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Create New Meeting</h2>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Add notes manually, import a transcript file, or load an AI template
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workflow Tabs */}
        <div className={`flex border-b px-6 pt-3 space-x-6 text-xs font-semibold ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          {[
            { id: 'form', label: 'Form Entry', icon: FileText },
            { id: 'upload', label: 'Upload / Paste Transcript', icon: Upload },
            { id: 'templates', label: '1-Click AI Templates', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 pb-3 border-b-2 transition-all ${
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

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'templates' && (
            <div className="space-y-3">
              <p className={`text-xs mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Select a ready-made meeting template. Each template generates realistic multi-turn transcripts, executive summaries, and action items:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SAMPLE_TEMPLATES.map((tpl, i) => (
                  <div
                    key={i}
                    onClick={() => handleApplyTemplate(tpl)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                      darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-violet-500' : 'bg-slate-50 border-slate-200 hover:border-violet-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2 text-violet-600 dark:text-violet-400 font-bold text-xs mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{tpl.name}</span>
                    </div>
                    <p className={`text-[11px] line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tpl.overview}</p>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center space-x-3">
                      <span>{tpl.participants.length} attendees</span>
                      <span>•</span>
                      <span>{tpl.action_items.length} action items</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Upload File (.txt, .vtt, .json)</label>
                <div className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
                  darkMode ? 'border-slate-800 bg-slate-900/40 hover:border-violet-500' : 'border-slate-200 bg-slate-50 hover:border-violet-500'
                }`}>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-violet-600" />
                  <p className="font-semibold mb-0.5">Click to choose transcript file or drag and drop</p>
                  <p className="text-[11px] text-slate-400">Accepts plain text, WebVTT, or JSON files</p>
                  <input
                    type="file"
                    accept=".txt,.vtt,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="transcript-upload-input"
                  />
                  <label
                    htmlFor="transcript-upload-input"
                    className="inline-block mt-3 px-3 py-1.5 rounded-lg bg-violet-600 text-white font-medium cursor-pointer text-xs shadow-sm hover:bg-violet-700"
                  >
                    Select File
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Or Paste Raw Transcript Lines</label>
                <textarea
                  rows={6}
                  value={rawTranscriptText}
                  onChange={(e) => setRawTranscriptText(e.target.value)}
                  placeholder="Love Kumar [00:00]: Welcome everyone...&#10;Sarah Chen [00:15]: Thanks for having me..."
                  className={`w-full p-3 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                  }`}
                />
                <p className="text-[11px] text-slate-400 mt-1">Our parser automatically extracts speaker names and start timestamps.</p>
              </div>
            </div>
          )}

          {(activeTab === 'form' || activeTab === 'upload') && (
            <form id="new-meeting-form" onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Meeting Title <span className="text-violet-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Engineering Architecture Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={480}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">Participants</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {participants.map((p, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{p.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(idx)}
                        className="hover:text-rose-500 transition-colors ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add participant name..."
                    value={newParticipant}
                    onChange={(e) => setNewParticipant(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                    className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddParticipant}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Summary Overview */}
              <div>
                <label className="block text-xs font-semibold mb-1">AI Executive Summary (Optional)</label>
                <textarea
                  rows={2}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Brief high-level summary of the meeting..."
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              {/* Key Topics */}
              <div>
                <label className="block text-xs font-semibold mb-1">Key Topics & Chapters (Comma separated)</label>
                <input
                  type="text"
                  value={keyTopics}
                  onChange={(e) => setKeyTopics(e.target.value)}
                  placeholder="e.g. Architecture, Latency Optimization, AskFred AI"
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              {/* Action Items */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">Action Items</label>
                {actionItems.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {actionItems.map((ai, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="w-3.5 h-3.5 text-violet-500" />
                          <span>{ai.task}</span>
                          {ai.assignee && <span className="text-slate-400 text-[10px]">(@{ai.assignee})</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveActionItem(idx)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Task description..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddActionItem())}
                    className={`flex-2 px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Assignee (optional)..."
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddActionItem())}
                    className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddActionItem}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex justify-end space-x-2 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
              darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cancel
          </button>
          <button
            form="new-meeting-form"
            type="submit"
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Creating Meeting...</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Create Meeting</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

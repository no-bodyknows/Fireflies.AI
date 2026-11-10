'use client';
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Users, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Meeting, Participant } from '@/types';
import { updateMeeting } from '@/lib/api';
import { useToast } from '@/components/Toast';

interface EditMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onUpdated: (updatedMeeting: Meeting) => void;
  darkMode: boolean;
}

export default function EditMeetingModal({
  isOpen,
  onClose,
  meeting,
  onUpdated,
  darkMode,
}: EditMeetingModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [status, setStatus] = useState<'completed' | 'upcoming' | 'delayed' | 'live'>('completed');
  const [participants, setParticipants] = useState<{ name: string; email?: string }[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title || '');
      if (meeting.date) {
        const d = new Date(meeting.date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        setDate(d.toISOString().slice(0, 16));
      }
      setDurationMinutes(Math.round((meeting.duration || 1800) / 60));
      setStatus(meeting.status || 'completed');
      setParticipants(meeting.participants ? [...meeting.participants] : []);
    }
  }, [meeting, isOpen]);

  if (!isOpen || !meeting) return null;

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    setParticipants((prev) => [
      ...prev,
      { name: newParticipantName.trim(), email: newParticipantEmail.trim() || undefined },
    ]);
    setNewParticipantName('');
    setNewParticipantEmail('');
  };

  const handleRemoveParticipant = (idx: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Meeting title is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updated = await updateMeeting(meeting.id, {
        title: title.trim(),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        duration: durationMinutes * 60,
        status,
        participants,
      });

      showToast('Meeting updated successfully!', 'success');
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update meeting');
      showToast(err.message || 'Failed to update meeting', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg mx-auto rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
          darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="min-w-0 mr-2">
            <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">Edit Meeting Details</h2>
            <p className={`text-[11px] sm:text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Update title, schedule, lifecycle status, and attendees
            </p>
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

        {/* Error Alert */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold mb-1">Meeting Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <option value="live">Live Now</option>
            </select>
          </div>

          {/* Participants Manager */}
          <div>
            <label className="block text-xs font-semibold mb-2">Meeting Participants</label>
            <div className="space-y-2 mb-3">
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                    darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{p.name}</span>
                    {p.email && <span className="text-slate-400 text-[11px]">({p.email})</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(idx)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Attendee name..."
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <input
                type="email"
                placeholder="Email (optional)..."
                value={newParticipantEmail}
                onChange={(e) => setNewParticipantEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="p-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors flex items-center justify-center shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={`pt-4 border-t flex justify-end space-x-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
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
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

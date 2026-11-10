'use client';
import { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, CalendarSync, Sparkles } from 'lucide-react';
import { Meeting } from '@/types';
import { rescheduleMeeting } from '@/lib/api';
import { useToast } from '@/components/Toast';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onRescheduled: (updatedMeeting: Meeting) => void;
  darkMode: boolean;
}

export default function RescheduleModal({
  isOpen,
  onClose,
  meeting,
  onRescheduled,
  darkMode,
}: RescheduleModalProps) {
  const getFutureDateTime = () => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow same time
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const getMinDateTime = () => {
    const d = new Date(Date.now() - 10 * 60 * 1000); // 10 min grace buffer
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [date, setDate] = useState(getFutureDateTime);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (meeting && isOpen) {
      setDate(getFutureDateTime());
      setDurationMinutes(Math.round((meeting.duration || 1800) / 60));
      setError(null);
    }
  }, [meeting, isOpen]);

  if (!isOpen || !meeting) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Future date validation
    const selectedTimestamp = new Date(date).getTime();
    const nowTimestamp = Date.now();
    if (selectedTimestamp < nowTimestamp - 10 * 60 * 1000) {
      setError('Rescheduled date and time cannot be in the past. Please select an upcoming date and time.');
      showToast('Cannot reschedule to a past date.', 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updated = await rescheduleMeeting(
        meeting.id,
        new Date(date).toISOString(),
        durationMinutes * 60,
        'upcoming'
      );

      showToast(`"${meeting.title}" rescheduled successfully! Now marked as Upcoming. 🗓️`, 'success');
      onRescheduled(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reschedule meeting');
      showToast(err.message || 'Failed to reschedule meeting', 'error');
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
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 mr-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <CalendarSync className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">Reschedule Meeting</h2>
              <p className={`text-[11px] sm:text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {meeting.title}
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

        {/* Info Banner */}
        <div className={`px-4 sm:px-6 pt-4 pb-1`}>
          <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
            darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This meeting will be moved from <strong>Missed</strong> to <strong>Upcoming</strong> status with the newly scheduled slot.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold mb-1">
              New Date & Time <span className="text-violet-500">* (Upcoming)</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                required
                min={getMinDateTime()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Must be an upcoming date/time</p>
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

          {/* Attendees Summary */}
          {meeting.participants && meeting.participants.length > 0 && (
            <div>
              <label className="block text-xs font-semibold mb-1.5">Scheduled Attendees ({meeting.participants.length})</label>
              <div className="flex flex-wrap gap-1.5">
                {meeting.participants.map((p, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

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
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20 transition-all disabled:opacity-50"
            >
              <CalendarSync className="w-3.5 h-3.5" />
              <span>{loading ? 'Rescheduling...' : 'Confirm Reschedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

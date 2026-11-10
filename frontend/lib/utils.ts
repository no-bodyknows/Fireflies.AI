import { Meeting, Transcript } from '@/types';

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 min';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }
  return `${mins} min`;
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTES = [
  { bg: 'bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' },
  { bg: 'bg-violet-500/15', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/20' },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  { bg: 'bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
  { bg: 'bg-cyan-500/15', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
];

export function getSpeakerStyle(speaker: string) {
  let hash = 0;
  for (let i = 0; i < (speaker || '').length; i++) {
    hash = (hash << 5) - hash + speaker.charCodeAt(i);
  }
  const idx = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

export function parseTranscriptText(raw: string): Transcript[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const results: Transcript[] = [];
  let currentTime = 0;

  // Regex matches: "Speaker Name [01:23]: text" OR "Speaker Name (01:23): text" OR "Speaker Name: text"
  const patternWithTime = /^(?:\[?(\d{1,2}:\d{2})\]?\s+)?([^:]+):\s*(.*)$/;

  for (const line of lines) {
    const match = line.match(patternWithTime);
    if (match) {
      const timeStr = match[1];
      const speaker = match[2].trim();
      const text = match[3].trim();

      let startTime = currentTime;
      if (timeStr) {
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 2) {
          startTime = parts[0] * 60 + parts[1];
        }
      }

      const durationEstimate = Math.max(4, Math.min(30, Math.floor(text.length / 15)));
      results.push({
        speaker: speaker || 'Speaker',
        start_time: startTime,
        end_time: startTime + durationEstimate,
        text,
      });

      currentTime = startTime + durationEstimate + 1;
    } else {
      // Continuation line
      if (results.length > 0) {
        results[results.length - 1].text += ' ' + line.trim();
      } else {
        results.push({
          speaker: 'Speaker 1',
          start_time: currentTime,
          end_time: currentTime + 5,
          text: line.trim(),
        });
        currentTime += 6;
      }
    }
  }

  return results;
}

export function exportMeetingToMarkdown(meeting: Meeting): string {
  let md = `# ${meeting.title}\n\n`;
  md += `**Date:** ${formatDateTime(meeting.date)}  \n`;
  md += `**Duration:** ${formatDuration(meeting.duration)}  \n`;
  md += `**Attendees:** ${meeting.participants?.map((p) => p.name).join(', ') || 'N/A'}  \n\n`;

  md += `## 📋 AI Executive Summary\n\n`;
  md += `${meeting.summary?.overview || 'No summary available.'}\n\n`;

  if (meeting.summary?.key_topics) {
    md += `### Key Topics & Discussion Points\n\n`;
    md += `${meeting.summary.key_topics}\n\n`;
  }

  md += `## ✅ Action Items\n\n`;
  if (meeting.action_items?.length) {
    meeting.action_items.forEach((item) => {
      const mark = item.is_completed ? '[x]' : '[ ]';
      const assignee = item.assignee ? ` (@${item.assignee})` : '';
      md += `- ${mark} ${item.task}${assignee}\n`;
    });
  } else {
    md += `_No action items recorded._\n`;
  }
  md += `\n`;

  md += `## 🎙️ Meeting Transcript\n\n`;
  if (meeting.transcripts?.length) {
    meeting.transcripts.forEach((t) => {
      md += `**[${formatTime(t.start_time)}] ${t.speaker}:**\n> ${t.text}\n\n`;
    });
  } else {
    md += `_No transcript available._\n`;
  }

  return md;
}

export function exportMeetingToTxt(meeting: Meeting): string {
  let txt = `${meeting.title.toUpperCase()}\n`;
  txt += `=========================================================\n`;
  txt += `Date: ${formatDateTime(meeting.date)}\n`;
  txt += `Duration: ${formatDuration(meeting.duration)}\n`;
  txt += `Attendees: ${meeting.participants?.map((p) => p.name).join(', ') || 'N/A'}\n\n`;

  txt += `AI SUMMARY:\n`;
  txt += `${meeting.summary?.overview || 'N/A'}\n\n`;

  txt += `ACTION ITEMS:\n`;
  if (meeting.action_items?.length) {
    meeting.action_items.forEach((item, idx) => {
      const status = item.is_completed ? '[COMPLETED]' : '[OPEN]';
      txt += `${idx + 1}. ${status} ${item.task} (Assignee: ${item.assignee || 'Unassigned'})\n`;
    });
  } else {
    txt += `None\n`;
  }
  txt += `\nTRANSCRIPT:\n`;
  if (meeting.transcripts?.length) {
    meeting.transcripts.forEach((t) => {
      txt += `[${formatTime(t.start_time)}] ${t.speaker}: ${t.text}\n`;
    });
  }
  return txt;
}

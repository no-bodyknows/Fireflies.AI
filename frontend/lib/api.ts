import { Meeting, MeetingInput, ActionItem, AskFredResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchMeetings(params?: {
  search?: string;
  participant?: string;
  status?: string;
}): Promise<Meeting[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.participant && params.participant !== 'all') query.set('participant', params.participant);
  if (params?.status && params.status !== 'all') query.set('status', params.status);

  const url = `${API_BASE}/api/meetings${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch meetings');
  return res.json();
}

export async function fetchMeeting(id: number | string): Promise<Meeting> {
  const res = await fetch(`${API_BASE}/api/meetings/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch meeting #${id}`);
  return res.json();
}

export async function createMeeting(data: MeetingInput | any): Promise<Meeting> {
  const res = await fetch(`${API_BASE}/api/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create meeting' }));
    throw new Error(err.detail || 'Failed to create meeting');
  }
  return res.json();
}

export async function updateMeeting(id: number, data: Partial<Meeting>): Promise<Meeting> {
  const res = await fetch(`${API_BASE}/api/meetings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update meeting' }));
    throw new Error(err.detail || 'Failed to update meeting');
  }
  return res.json();
}

export async function rescheduleMeeting(
  id: number,
  date: string,
  duration: number,
  status: string = 'upcoming'
): Promise<Meeting> {
  const res = await fetch(`${API_BASE}/api/meetings/${id}/reschedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, duration, status }),
  });
  if (!res.ok) throw new Error('Failed to reschedule meeting');
  return res.json();
}

export async function deleteMeeting(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/meetings/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete meeting');
}

export async function addActionItem(
  meetingId: number,
  item: { task: string; assignee?: string; is_completed?: boolean }
): Promise<ActionItem> {
  const res = await fetch(`${API_BASE}/api/meetings/${meetingId}/action-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to add action item');
  return res.json();
}

export async function toggleActionItem(actionId: number): Promise<ActionItem> {
  const res = await fetch(`${API_BASE}/api/action-items/${actionId}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to toggle action item');
  return res.json();
}

export async function deleteActionItem(actionId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/action-items/${actionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete action item');
}

export async function askFredAI(meetingId: number, question: string): Promise<AskFredResponse> {
  const res = await fetch(`${API_BASE}/api/meetings/${meetingId}/ask-fred`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('AskFred encountered an issue');
  return res.json();
}

export interface Participant {
  id?: number;
  name: string;
  email?: string;
}

export interface Transcript {
  id?: number;
  speaker: string;
  start_time: number;
  end_time?: number;
  text: string;
}

export interface Summary {
  id?: number;
  overview?: string;
  key_topics?: string;
}

export interface ActionItem {
  id: number;
  task: string;
  assignee?: string;
  is_completed: boolean;
  meeting_id?: number;
}

export interface ActionItemInput {
  id?: number;
  task: string;
  assignee?: string;
  is_completed?: boolean;
  meeting_id?: number;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  duration: number; // in seconds
  audio_url?: string;
  status: 'completed' | 'upcoming' | 'missed' | 'delayed' | 'live';
  created_at?: string;
  participants: Participant[];
  transcripts: Transcript[];
  summary?: Summary;
  action_items: ActionItem[];
}

export interface MeetingInput {
  title: string;
  date: string;
  duration: number;
  audio_url?: string;
  status?: string;
  participants?: Participant[];
  transcripts?: Transcript[];
  summary?: Summary;
  action_items?: ActionItemInput[];
}

export interface AskFredResponse {
  answer: string;
  suggested_actions?: string[];
}

export type ViewMode = 'grid' | 'table';
export type FilterStatus = 'all' | 'completed' | 'upcoming' | 'missed';
export type SortOption = 'newest' | 'oldest' | 'duration-desc' | 'duration-asc' | 'title-asc';

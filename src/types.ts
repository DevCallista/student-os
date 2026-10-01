export type ThemeMode = 'light' | 'dark' | 'system';

export type Task = {
  id: string;
  title: string;
  course?: string;
  due?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
  units: string;
  type: 'core' | 'elective';
  color: string;
  progress: number;
  next: string;
};

export type ScheduleItem = {
  id: string;
  title: string;
  day: string;
  time: string;
  course: string;
  type: 'lecture' | 'study' | 'deadline';
};

export type Goal = {
  id: string;
  title: string;
  detail: string;
  progress: number;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  done: boolean;
};

export type Note = {
  id: string;
  title: string;
  body: string;
};

export type Review = {
  id: string;
  title: string;
  summary: string;
  date: string;
};

export type Workspace = {
  profile: {
    name: string;
    faculty: string;
    year: string;
    theme: ThemeMode;
    accountMode: 'guest' | 'account';
    syncStatus: 'local' | 'syncing' | 'synced' | 'offline' | 'error';
  };
  tasks: Task[];
  courses: Course[];
  schedule: ScheduleItem[];
  goals: Goal[];
  projects: Project[];
  notes: Note[];
  reviews: Review[];
};

export type NavKey = 'today' | 'tasks' | 'schedule' | 'academics' | 'focus' | 'reviews' | 'settings';

import { type Workspace } from '../types';

const today = new Date().toISOString();

export const starterWorkspace: Workspace = {
  profile: {
    name: 'Victor',
    faculty: 'Information Technology',
    year: '300 Level',
    theme: 'system',
    accountMode: 'guest',
    syncStatus: 'local',
  },
  tasks: [
    {
      id: 't1',
      title: 'Review Data Communication lecture notes',
      course: 'ICT 305',
      due: 'Today',
      completed: false,
      priority: 'high',
      createdAt: today,
    },
    {
      id: 't2',
      title: 'Practice database normalization exercises',
      course: 'UIL-IFT 309',
      due: 'Tomorrow',
      completed: false,
      priority: 'high',
      createdAt: today,
    },
    {
      id: 't3',
      title: 'Sketch web app ideas for semester project',
      course: 'IFT 302',
      due: 'Thu',
      completed: true,
      priority: 'medium',
      createdAt: today,
    },
    {
      id: 't4',
      title: 'Outline OS topic summary',
      course: 'CSC 308',
      due: 'Fri',
      completed: false,
      priority: 'medium',
      createdAt: today,
    },
  ],
  courses: [
    { id: 'c1', code: 'ICT 305', name: 'Data Communications Systems and Network', units: '3 Units', type: 'core', color: '#7c3aed', progress: 62, next: 'Subnetting practice' },
    { id: 'c2', code: 'UIL-IFT 301', name: 'Data Analysis', units: '2 Units', type: 'core', color: '#1d4ed8', progress: 55, next: 'Probability recap' },
    { id: 'c3', code: 'UIL-IFT 303', name: 'Data Structures and Algorithm', units: '2 Units', type: 'core', color: '#dc2626', progress: 48, next: 'Trees and recursion' },
    { id: 'c4', code: 'UIL-IFT 309', name: 'Database Programming', units: '2 Units', type: 'core', color: '#0ea5e9', progress: 71, next: 'PL/SQL joins' },
    { id: 'c5', code: 'IFT 302', name: 'Web Application Development', units: '2 Units', type: 'core', color: '#14b8a6', progress: 58, next: 'API and state handling' },
    { id: 'c6', code: 'CSC 308', name: 'Operating Systems', units: '3 Units', type: 'core', color: '#f59e0b', progress: 64, next: 'Process scheduling' },
    { id: 'c7', code: 'UIL-IFT 305', name: 'Data Compression and Web Based Multimedia', units: '2 Units', type: 'elective', color: '#ec4899', progress: 40, next: 'Compression algorithms' },
    { id: 'c8', code: 'IFT 308', name: 'Ethics and Legal Issues in IT', units: '2 Units', type: 'core', color: '#10b981', progress: 45, next: 'Privacy and IP' },
  ],
  schedule: [
    { id: 's1', title: 'ICT 305 Lecture', day: 'Mon', time: '10:00', course: 'ICT 305', type: 'lecture' },
    { id: 's2', title: 'Database Lab', day: 'Tue', time: '14:00', course: 'UIL-IFT 309', type: 'study' },
    { id: 's3', title: 'Web App Studio', day: 'Wed', time: '13:00', course: 'IFT 302', type: 'study' },
    { id: 's4', title: 'OS Assignment Due', day: 'Fri', time: '17:00', course: 'CSC 308', type: 'deadline' },
  ],
  goals: [
    { id: 'g1', title: 'Become stronger at backend fundamentals', detail: 'Build confidence in data structures, SQL, and system design.', progress: 72 },
    { id: 'g2', title: 'Finish a polished student portfolio project', detail: 'Ship a functional project with a clear problem-solution narrative.', progress: 46 },
  ],
  projects: [
    { id: 'p1', title: 'Student OS redesign', summary: 'Improve the dashboard, notes, and focus flow.', done: false },
    { id: 'p2', title: 'Database mini-project', summary: 'Use SQL to model a school attendance registry.', done: true },
  ],
  notes: [
    { id: 'n1', title: 'Database normalization', body: 'Keep the schema consistent, identify repeating groups, and separate concerns early.' },
    { id: 'n2', title: 'Study rhythm', body: 'Use short review blocks after each lecture to prevent backlog from accumulating.' },
  ],
  reviews: [
    { id: 'r1', title: 'Week 4 review', summary: 'Good momentum on coursework; need tighter follow-through on revision blocks.', date: '2026-10-01' },
    { id: 'r2', title: 'Focus check-in', summary: 'Morning deep work is most effective; reduce context switching in the afternoon.', date: '2026-09-25' },
  ],
};

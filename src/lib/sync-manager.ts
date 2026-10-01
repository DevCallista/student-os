import { db, isConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { type Workspace, type Task, type Course, type Goal, type Project, type Note, type Review, type ScheduleItem } from '../types';

type SyncListener = (state: 'syncing' | 'synced' | 'error') => void;

let currentUid: string | null = null;
let syncListeners: Set<SyncListener> = new Set();
let pendingChanges: Map<string, any> = new Map();

export function setSyncUid(uid: string | null) {
  currentUid = uid;
}

export function onSyncStateChange(listener: SyncListener) {
  syncListeners.add(listener);
  return () => syncListeners.delete(listener);
}

function notifySyncState(state: 'syncing' | 'synced' | 'error') {
  syncListeners.forEach((listener) => listener(state));
}

/**
 * Firestore Data Model
 *
 * /users/{uid}/workspace/profile        — user profile and settings
 * /users/{uid}/workspace/metadata       — sync metadata
 * /users/{uid}/tasks/{taskId}           — individual task document
 * /users/{uid}/courses/{courseId}       — individual course document
 * /users/{uid}/goals/{goalId}           — individual goal document
 * /users/{uid}/projects/{projectId}     — individual project document
 * /users/{uid}/notes/{noteId}           — individual note document
 * /users/{uid}/schedules/{scheduleId}   — individual schedule item
 * /users/{uid}/reviews/{reviewId}       — individual review document
 */

/**
 * Push local workspace to Firestore.
 * Called during guest→account migration or periodic sync.
 */
export async function pushWorkspaceToCloud(workspace: Workspace, uid: string) {
  if (!isConfigured || !db || !uid) return;

  try {
    notifySyncState('syncing');
    const batch = writeBatch(db);

    // Profile and metadata
    const profileRef = doc(db, `users/${uid}/workspace`, 'profile');
    batch.set(profileRef, {
      ...workspace.profile,
      name: workspace.profile.name || 'Student',
      faculty: workspace.profile.faculty || 'Information Technology',
      year: workspace.profile.year || '300 Level',
      theme: workspace.profile.theme || 'system',
      accountMode: 'account',
      updatedAt: serverTimestamp(),
    });

    const metadataRef = doc(db, `users/${uid}/workspace`, 'metadata');
    batch.set(metadataRef, {
      lastMigration: new Date().toISOString(),
      migratedFrom: 'guest',
      taskCount: workspace.tasks.length,
      courseCount: workspace.courses.length,
      syncedAt: serverTimestamp(),
    });

    // Tasks
    workspace.tasks.forEach((task) => {
      const taskRef = doc(db, `users/${uid}/tasks`, task.id);
      batch.set(taskRef, {
        ...task,
        createdAt: task.createdAt,
        updatedAt: serverTimestamp(),
      });
    });

    // Courses
    workspace.courses.forEach((course) => {
      const courseRef = doc(db, `users/${uid}/courses`, course.id);
      batch.set(courseRef, {
        ...course,
        updatedAt: serverTimestamp(),
      });
    });

    // Goals
    workspace.goals.forEach((goal) => {
      const goalRef = doc(db, `users/${uid}/goals`, goal.id);
      batch.set(goalRef, {
        ...goal,
        updatedAt: serverTimestamp(),
      });
    });

    // Projects
    workspace.projects.forEach((project) => {
      const projectRef = doc(db, `users/${uid}/projects`, project.id);
      batch.set(projectRef, {
        ...project,
        updatedAt: serverTimestamp(),
      });
    });

    // Notes
    workspace.notes.forEach((note) => {
      const noteRef = doc(db, `users/${uid}/notes`, note.id);
      batch.set(noteRef, {
        ...note,
        updatedAt: serverTimestamp(),
      });
    });

    // Schedules
    workspace.schedule.forEach((item) => {
      const schedRef = doc(db, `users/${uid}/schedules`, item.id);
      batch.set(schedRef, {
        ...item,
        updatedAt: serverTimestamp(),
      });
    });

    // Reviews
    workspace.reviews.forEach((review) => {
      const reviewRef = doc(db, `users/${uid}/reviews`, review.id);
      batch.set(reviewRef, {
        ...review,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    notifySyncState('synced');
  } catch (error) {
    console.error('Push to cloud error:', error);
    notifySyncState('error');
    throw error;
  }
}

/**
 * Pull full workspace from Firestore.
 * Called on sign-in to restore user's cloud workspace.
 */
export async function pullWorkspaceFromCloud(uid: string): Promise<Partial<Workspace> | null> {
  if (!isConfigured || !db || !uid) return null;

  try {
    notifySyncState('syncing');

    // Fetch profile
    const profileRef = doc(db, `users/${uid}/workspace`, 'profile');
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      notifySyncState('synced');
      return null; // No cloud workspace yet
    }

    const profile = profileSnap.data();

    // Fetch all tasks
    const tasksSnap = await getDocs(collection(db, `users/${uid}/tasks`));
    const tasks: Task[] = tasksSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Task));

    // Fetch all courses
    const coursesSnap = await getDocs(collection(db, `users/${uid}/courses`));
    const courses: Course[] = coursesSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Course));

    // Fetch all goals
    const goalsSnap = await getDocs(collection(db, `users/${uid}/goals`));
    const goals: Goal[] = goalsSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Goal));

    // Fetch all projects
    const projectsSnap = await getDocs(collection(db, `users/${uid}/projects`));
    const projects: Project[] = projectsSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Project));

    // Fetch all notes
    const notesSnap = await getDocs(collection(db, `users/${uid}/notes`));
    const notes: Note[] = notesSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Note));

    // Fetch all schedules
    const schedulesSnap = await getDocs(collection(db, `users/${uid}/schedules`));
    const schedule: ScheduleItem[] = schedulesSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as ScheduleItem));

    // Fetch all reviews
    const reviewsSnap = await getDocs(collection(db, `users/${uid}/reviews`));
    const reviews: Review[] = reviewsSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Review));

    const cloudWorkspace: Partial<Workspace> = {
      profile: {
        ...profile,
        accountMode: 'account',
        theme: profile.theme || 'system',
      },
      tasks,
      courses,
      goals,
      projects,
      notes,
      schedule,
      reviews,
    };

    notifySyncState('synced');
    return cloudWorkspace;
  } catch (error) {
    console.error('Pull from cloud error:', error);
    notifySyncState('error');
    throw error;
  }
}

/**
 * Sync a single task to Firestore.
 * Called whenever a task is updated locally.
 */
export async function syncTaskToCloud(task: Task, uid: string) {
  if (!isConfigured || !db || !uid || !currentUid) return;

  try {
    notifySyncState('syncing');
    const taskRef = doc(db, `users/${uid}/tasks`, task.id);
    await setDoc(taskRef, {
      ...task,
      updatedAt: serverTimestamp(),
      updatedByDevice: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    });
    notifySyncState('synced');
  } catch (error) {
    console.error('Task sync error:', error);
    notifySyncState('error');
  }
}

/**
 * Sync a single course to Firestore.
 */
export async function syncCourseToCloud(course: Course, uid: string) {
  if (!isConfigured || !db || !uid || !currentUid) return;

  try {
    notifySyncState('syncing');
    const courseRef = doc(db, `users/${uid}/courses`, course.id);
    await setDoc(courseRef, {
      ...course,
      updatedAt: serverTimestamp(),
    });
    notifySyncState('synced');
  } catch (error) {
    console.error('Course sync error:', error);
    notifySyncState('error');
  }
}

/**
 * Set up real-time listener for tasks.
 * Called after sign-in to keep local tasks in sync with cloud.
 */
export function listenToTasks(uid: string, onUpdate: (tasks: Task[]) => void) {
  if (!isConfigured || !db || !uid) return () => {};

  try {
    const q = query(collection(db, `users/${uid}/tasks`));
    return onSnapshot(
      q,
      (snapshot) => {
        const tasks: Task[] = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as Task));
        onUpdate(tasks);
      },
      (error) => {
        console.error('Tasks listener error:', error);
        notifySyncState('error');
      },
    );
  } catch (error) {
    console.error('Failed to set up tasks listener:', error);
    return () => {};
  }
}

/**
 * Set up real-time listener for courses.
 */
export function listenToCourses(uid: string, onUpdate: (courses: Course[]) => void) {
  if (!isConfigured || !db || !uid) return () => {};

  try {
    const q = query(collection(db, `users/${uid}/courses`));
    return onSnapshot(
      q,
      (snapshot) => {
        const courses: Course[] = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as Course));
        onUpdate(courses);
      },
      (error) => {
        console.error('Courses listener error:', error);
        notifySyncState('error');
      },
    );
  } catch (error) {
    console.error('Failed to set up courses listener:', error);
    return () => {};
  }
}

/**
 * Soft-delete a task (mark deleted:true, preserve cloud record for sync safety)
 */
export async function softDeleteTask(taskId: string, uid: string) {
  if (!isConfigured || !db || !uid || !currentUid) return;

  try {
    const taskRef = doc(db, `users/${uid}/tasks`, taskId);
    await updateDoc(taskRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Delete task error:', error);
  }
}

/**
 * Export user's workspace as JSON for backup.
 */
export function exportWorkspaceJSON(workspace: Workspace): string {
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      ...workspace,
    },
    null,
    2,
  );
}

/**
 * Import workspace from JSON backup.
 */
export function importWorkspaceJSON(json: string): Partial<Workspace> | null {
  try {
    const data = JSON.parse(json);
    if (data.version !== '1.0') {
      console.warn('Unsupported backup version:', data.version);
      return null;
    }

    const { tasks, courses, goals, projects, notes, schedule, reviews, profile } = data;

    return {
      profile: profile || { name: 'Imported', faculty: '', year: '', theme: 'system', accountMode: 'guest', syncStatus: 'local' },
      tasks: tasks || [],
      courses: courses || [],
      goals: goals || [],
      projects: projects || [],
      notes: notes || [],
      schedule: schedule || [],
      reviews: reviews || [],
    };
  } catch (error) {
    console.error('Import error:', error);
    return null;
  }
}

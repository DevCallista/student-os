import { useEffect, useMemo, useState } from 'react';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { starterWorkspace } from './data/starterData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useServiceWorker } from './hooks/useServiceWorker';
import { computeTaskStats, formatMinutes, getTodayLabel, syncStatusTone } from './lib/sync';
import { type NavKey, type Task, type Workspace } from './types';

const navItems: Array<{ key: NavKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'academics', label: 'Academics' },
  { key: 'focus', label: 'Focus' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'settings', label: 'Settings' },
];

const emptyTaskDraft = { title: '', course: '', due: 'Today', priority: 'medium' as const };

function App() {
  const { user, migrateGuestToAccount } = useAuth();
  const [workspace, setWorkspace] = useLocalStorage<Workspace>('student-os-workspace', starterWorkspace);
  const [currentView, setCurrentView] = useState<NavKey>('today');
  const [taskDraft, setTaskDraft] = useState(emptyTaskDraft);
  const [focusMinutes, setFocusMinutes] = useState(45);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [authModalOpen, setAuthModalOpen] = useState(true);

  useServiceWorker();

  useEffect(() => {
    if (user) {
      setAuthModalOpen(false);
    }
  }, [user]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && workspace.profile.syncStatus === 'offline') {
      setWorkspace((prev) => ({ ...prev, profile: { ...prev.profile, syncStatus: 'synced' } }));
    }

    if (!isOnline && workspace.profile.syncStatus !== 'error') {
      setWorkspace((prev) => ({ ...prev, profile: { ...prev.profile, syncStatus: 'offline' } }));
    }
  }, [isOnline, setWorkspace, workspace.profile.syncStatus]);

  const taskStats = useMemo(() => computeTaskStats(workspace.tasks), [workspace.tasks]);
  const todayLabel = useMemo(() => getTodayLabel(), []);
  const todaysTasks = workspace.tasks.filter((task) => !task.completed).slice(0, 4);

  const handleAddTask = () => {
    if (!taskDraft.title.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskDraft.title.trim(),
      course: taskDraft.course || 'General',
      due: taskDraft.due,
      completed: false,
      priority: taskDraft.priority,
      createdAt: new Date().toISOString(),
    };

    setWorkspace((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
      profile: { ...prev.profile, syncStatus: prev.profile.accountMode === 'account' ? 'syncing' : 'local' },
    }));

    setTaskDraft(emptyTaskDraft);
  };

  const toggleTask = (taskId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    }));
  };

  const updateTheme = (theme: Workspace['profile']['theme']) => {
    setWorkspace((prev) => ({
      ...prev,
      profile: { ...prev.profile, theme },
    }));
  };

  const handleGuestContinue = () => {
    setWorkspace((prev) => ({
      ...prev,
      profile: { ...prev.profile, accountMode: 'guest', syncStatus: 'local' },
    }));
  };

  const handleAccountMigration = async () => {
    if (!user?.uid) return;
    await migrateGuestToAccount(workspace);
    setWorkspace((prev) => ({
      ...prev,
      profile: { ...prev.profile, accountMode: 'account', syncStatus: 'synced' },
    }));
  };

  useEffect(() => {
    const root = document.documentElement;
    const resolvedTheme = workspace.profile.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : workspace.profile.theme;

    root.dataset.theme = resolvedTheme;
  }, [workspace.profile.theme]);

  const renderContent = () => {
    if (currentView === 'today') {
      return (
        <>
          <section className="hero card">
            <div>
              <div className="eyebrow">Student OS</div>
              <h1>Good morning, {workspace.profile.name}</h1>
              <p>{todayLabel}</p>
            </div>
            <button className="primary" type="button">Start focus</button>
          </section>

          <div className="stats-grid">
            <div className="stat card">
              <span className="stat-label">Tasks</span>
              <strong>{workspace.tasks.length}</strong>
              <small>{taskStats.done} done</small>
            </div>
            <div className="stat card">
              <span className="stat-label">Focus</span>
              <strong>{formatMinutes(focusMinutes)}</strong>
              <small>session length</small>
            </div>
            <div className="stat card">
              <span className="stat-label">Courses</span>
              <strong>{workspace.courses.length}</strong>
              <small>active</small>
            </div>
            <div className="stat card">
              <span className="stat-label">Sync</span>
              <strong>{syncStatusTone[workspace.profile.syncStatus]}</strong>
              <small>{isOnline ? 'online' : 'offline'}</small>
            </div>
          </div>

          <div className="two-col">
            <section className="card panel">
              <div className="section-header">
                <h3>Today's focus</h3>
                <button type="button" className="ghost">Open plan</button>
              </div>
              <div className="focus-card">
                <span className="pill">Database revision</span>
                <h4>45 minutes</h4>
                <button type="button" className="primary block">Start focus</button>
              </div>
            </section>

            <section className="card panel">
              <div className="section-header">
                <h3>Priorities</h3>
              </div>
              <ul className="simple-list">
                {todaysTasks.map((task) => (
                  <li key={task.id}>
                    <button className="checkbox" type="button" onClick={() => toggleTask(task.id)}>
                      {task.completed ? '✓' : '○'}
                    </button>
                    <span>{task.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      );
    }

    if (currentView === 'tasks') {
      return (
        <>
          <section className="card composer">
            <h3>Add task</h3>
            <div className="task-form">
              <input
                value={taskDraft.title}
                onChange={(e) => setTaskDraft((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Review lecture notes..."
              />
              <input
                value={taskDraft.course}
                onChange={(e) => setTaskDraft((prev) => ({ ...prev, course: e.target.value }))}
                placeholder="Course"
              />
              <select
                value={taskDraft.priority}
                onChange={(e) => setTaskDraft((prev) => ({ ...prev, priority: e.target.value as typeof prev.priority }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button type="button" className="primary" onClick={handleAddTask}>Save</button>
            </div>
          </section>

          <section className="card panel">
            <div className="section-header">
              <h3>All tasks</h3>
            </div>
            <ul className="task-list">
              {workspace.tasks.map((task) => (
                <li key={task.id} className={`task-row ${task.completed ? 'done' : ''}`}>
                  <button className="checkbox large" type="button" onClick={() => toggleTask(task.id)}>
                    {task.completed ? '✓' : '○'}
                  </button>
                  <div>
                    <strong>{task.title}</strong>
                    <small>{task.course} · {task.due}</small>
                  </div>
                  <span className={`priority ${task.priority}`}>{task.priority}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      );
    }

    if (currentView === 'schedule') {
      return (
        <section className="card panel">
          <div className="section-header">
            <h3>Schedule</h3>
          </div>
          <ul className="timeline">
            {workspace.schedule.map((item) => (
              <li key={item.id} className="timeline-item">
                <span className="dot" />
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.day} · {item.time} · {item.course}</small>
                </div>
                <span className="pill soft">{item.type}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    }

    if (currentView === 'academics') {
      return (
        <div className="course-grid">
          {workspace.courses.map((course) => (
            <section key={course.id} className="card course-card" style={{ borderColor: course.color }}>
              <div className="course-header">
                <span className="course-code" style={{ color: course.color }}>{course.code}</span>
                <span className="pill type">{course.type}</span>
              </div>
              <h3>{course.name}</h3>
              <div className="mini-meta">
                <span>{course.units}</span>
                <span>{course.next}</span>
              </div>
              <div className="meter"><span style={{ width: `${course.progress}%`, background: course.color }} /></div>
              <small>{course.progress}% complete</small>
            </section>
          ))}
        </div>
      );
    }

    if (currentView === 'focus') {
      return (
        <section className="card focus-panel">
          <div className="section-header">
            <h3>Focus session</h3>
          </div>
          <div className="focus-control">
            <button type="button" onClick={() => setFocusMinutes((prev) => Math.max(15, prev - 15))}>−</button>
            <strong>{formatMinutes(focusMinutes)}</strong>
            <button type="button" onClick={() => setFocusMinutes((prev) => Math.min(180, prev + 15))}>+</button>
          </div>
          <button type="button" className="primary block">Start focused work</button>
        </section>
      );
    }

    if (currentView === 'reviews') {
      return (
        <div className="review-list">
          {workspace.reviews.map((review) => (
            <section key={review.id} className="card panel">
              <div className="section-header">
                <h3>{review.title}</h3>
                <small>{review.date}</small>
              </div>
              <p>{review.summary}</p>
            </section>
          ))}
        </div>
      );
    }

    return (
      <section className="card panel">
        <div className="section-header">
          <h3>Settings</h3>
        </div>

        <div className="settings-stack">
          <div className="setting-row">
            <span>Account mode</span>
            <button type="button" className="ghost" onClick={() => setWorkspace((prev) => ({
              ...prev,
              profile: { ...prev.profile, accountMode: prev.profile.accountMode === 'guest' ? 'account' : 'guest' },
            }))}>
              {workspace.profile.accountMode === 'guest' ? 'Guest mode' : 'Cloud account'}
            </button>
          </div>

          <div className="setting-row">
            <span>Theme</span>
            <select value={workspace.profile.theme} onChange={(e) => updateTheme(e.target.value as Workspace['profile']['theme'])}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="setting-row">
            <span>Sync</span>
            <button type="button" className="ghost" onClick={() => setWorkspace((prev) => ({
              ...prev,
              profile: { ...prev.profile, syncStatus: isOnline ? 'syncing' : 'offline' },
            }))}>
              Sync now
            </button>
          </div>
        </div>
      </section>
    );
  };

  return (
    <>
      <div className="app-shell">
        <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="brand-block">
            <div className="brand-mark">S</div>
            <div>
              <strong>Student OS</strong>
              <small>Local-first workspace</small>
            </div>
          </div>

          <nav className="nav">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={currentView === item.key ? 'nav-item active' : 'nav-item'}
                onClick={() => {
                  setCurrentView(item.key);
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-card">
            <span>Workspace</span>
            <strong>{workspace.profile.accountMode === 'guest' ? 'Guest' : 'Synced account'}</strong>
          </div>
        </aside>

        <main className="main-panel">
          <header className="topbar">
            <button className="menu-button" type="button" onClick={() => setIsMobileMenuOpen((prev) => !prev)}>
              ☰
            </button>
            <div className="topbar-status">
              <span className={`status ${workspace.profile.syncStatus}`}>{syncStatusTone[workspace.profile.syncStatus]}</span>
            </div>
          </header>

          {renderContent()}
        </main>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onGuestContinue={handleGuestContinue}
        onAccountMigrate={user ? handleAccountMigration : undefined}
      />
    </>
  );
}

export default App;

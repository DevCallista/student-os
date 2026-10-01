export const syncStatusTone: Record<string, string> = {
  local: 'Local only',
  syncing: 'Syncing…',
  synced: 'Synced',
  offline: 'Offline',
  error: 'Sync issue',
};

export function getTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function computeTaskStats(tasks: Array<{ completed: boolean }>) {
  const done = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - done;
  return { done, pending };
}

export function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

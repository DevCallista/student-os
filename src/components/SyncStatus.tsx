import React, { useEffect, useState } from 'react';
import { onSyncStateChange } from '../lib/sync-manager';

type SyncStatusProps = {
  className?: string;
};

const statusLabels: Record<string, string> = {
  syncing: '↻ Syncing…',
  synced: '✓ Synced',
  error: '! Sync issue',
  local: '○ Local',
  offline: '◯ Offline',
};

export function SyncStatus({ className }: SyncStatusProps) {
  const [syncState, setSyncState] = useState<'syncing' | 'synced' | 'error' | 'local'>('local');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsubscribe = onSyncStateChange((state) => {
      setSyncState(state);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const displayState = isOnline ? syncState : 'offline';
  const label = statusLabels[displayState] || statusLabels['local'];

  return (
    <div className={`status ${displayState} ${className || ''}`}>
      {label}
    </div>
  );
}

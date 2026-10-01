import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SyncStatus } from './SyncStatus';

export function AccountPanel() {
  const { user, signOut, firebaseConfigured } = useAuth();

  const handleSignOut = async () => {
    if (confirm('Sign out? Your local data will remain.')) {
      await signOut();
    }
  };

  if (!user) return null;

  return (
    <div className="account-panel card">
      <div className="account-header">
        <div className="account-avatar">{user.email?.[0]?.toUpperCase() || 'U'}</div>
        <div>
          <strong>{user.displayName || 'User'}</strong>
          <small>{user.email}</small>
        </div>
      </div>

      {firebaseConfigured && (
        <div className="sync-section">
          <SyncStatus className="full" />
          <small style={{ display: 'block', marginTop: '8px', color: 'var(--muted)' }}>
            Your workspace is synced to your cloud account.
          </small>
        </div>
      )}

      <button className="ghost block" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  );
}

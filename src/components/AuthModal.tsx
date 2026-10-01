import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGuestContinue: () => void;
  onAccountMigrate?: () => Promise<void>;
};

export function AuthModal({ isOpen, onClose, onGuestContinue, onAccountMigrate }: AuthModalProps) {
  const { signIn, loading, error, firebaseConfigured } = useAuth();
  const [showMigrationChoice, setShowMigrationChoice] = useState(false);

  if (!isOpen) return null;

  const handleGuestClick = () => {
    onGuestContinue();
    onClose();
  };

  const handleSignInClick = async () => {
    await signIn();
    // Auth state will update via the AuthProvider
  };

  const handleMigrateClick = async () => {
    if (onAccountMigrate) {
      await onAccountMigrate();
      onClose();
    }
  };

  if (showMigrationChoice) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-body">
            <h2>Sync your workspace?</h2>
            <p>You have local data that can be backed up to your cloud account.</p>
            <div className="modal-actions vertical">
              <button className="primary block" onClick={handleMigrateClick} disabled={loading}>
                {loading ? 'Migrating...' : 'Migrate & Sync'}
              </button>
              <button className="ghost block" onClick={() => setShowMigrationChoice(false)}>
                Keep local only
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content welcome">
        <div className="modal-body">
          <div className="welcome-header">
            <div className="brand-mark large">S</div>
            <h1>Student OS</h1>
            <p>Your personal student workspace, offline & always available.</p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="modal-actions vertical">
            <button className="primary block" onClick={handleGuestClick}>
              Continue as Guest
            </button>

            {firebaseConfigured && (
              <button className="ghost block" onClick={handleSignInClick} disabled={loading}>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>
            )}

            {!firebaseConfigured && (
              <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                Firebase not configured. Running in guest mode.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

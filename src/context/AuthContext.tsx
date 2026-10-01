import React, { createContext, useContext, useEffect, useState } from 'react';
import { initAuth, signInWithGoogle, signOutUser, isConfigured } from '../lib/firebase';
import { setSyncUid, pullWorkspaceFromCloud, pushWorkspaceToCloud } from '../lib/sync-manager';
import { type Workspace } from '../types';

type AuthContextType = {
  user: any | null;
  loading: boolean;
  error: string | null;
  firebaseConfigured: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  migrateGuestToAccount: (workspace: Workspace) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(!isConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = initAuth((authUser) => {
      setUser(authUser);
      if (authUser) {
        setSyncUid(authUser.uid);
      } else {
        setSyncUid(null);
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      await signOutUser();
      setUser(null);
      setSyncUid(null);
    } catch (err: any) {
      setError(err.message || 'Sign-out failed');
    }
  };

  const migrateGuestToAccount = async (workspace: Workspace) => {
    try {
      setError(null);
      setLoading(true);
      
      if (!user?.uid) throw new Error('Not authenticated');

      // Push local guest workspace to Firestore
      await pushWorkspaceToCloud(workspace, user.uid);
      setSyncUid(user.uid);
    } catch (err: any) {
      setError(err.message || 'Migration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        firebaseConfigured: isConfigured,
        signIn: handleSignIn,
        signOut: handleSignOut,
        migrateGuestToAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Models } from "appwrite";
import {
  getCurrentUser,
  getUserPreferences,
  logout as appwriteLogout,
} from "@/lib/appwrite";
import { UserPreferences } from "@/types/media";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  preferences: UserPreferences | null;
  loading: boolean;
  refreshAuth: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  preferences: null,
  loading: true,
  refreshAuth: async () => {},
  refreshPreferences: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshPreferences = useCallback(async (userId?: string) => {
    const id = userId || user?.$id;
    if (!id) {
      setPreferences(null);
      return;
    }
    try {
      const prefs = await getUserPreferences(id);
      setPreferences(prefs);
    } catch {
      setPreferences(null);
    }
  }, [user?.$id]);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        await refreshPreferences(currentUser.$id);
      } else {
        setPreferences(null);
      }
    } catch {
      setUser(null);
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  }, [refreshPreferences]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const signOut = async () => {
    try {
      await appwriteLogout();
    } finally {
      setUser(null);
      setPreferences(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        loading,
        refreshAuth,
        refreshPreferences: () => refreshPreferences(),
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

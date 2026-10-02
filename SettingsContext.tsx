import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, WatchHistoryItem, SupabaseHealth } from '../types';
import { api } from '../api';
import { testSupabaseConnection, DEFAULT_SETTINGS } from '../lib/supabase';

interface SettingsContextType {
  settings: SiteSettings | null;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  watchHistory: WatchHistoryItem[];
  saveWatchProgress: (item: Omit<WatchHistoryItem, 'timestamp'>) => void;
  removeWatchHistory: (animeId: string) => void;
  watchlist: string[]; // anime IDs
  toggleWatchlist: (animeId: string) => void;
  isInWatchlist: (animeId: string) => boolean;
  supabaseHealth: SupabaseHealth | null;
  checkSupabaseHealth: () => Promise<SupabaseHealth>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const WATCH_HISTORY_KEY = 'ans_anime_watch_history';
const WATCHLIST_KEY = 'ans_anime_watchlist';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealth | null>(null);

  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(WATCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const checkSupabaseHealth = async () => {
    const health = await testSupabaseConnection();
    setSupabaseHealth(health);
    return health;
  };

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
    checkSupabaseHealth();
  }, []);

  const saveWatchProgress = (item: Omit<WatchHistoryItem, 'timestamp'>) => {
    setWatchHistory((prev) => {
      const updatedItem: WatchHistoryItem = {
        ...item,
        timestamp: Date.now(),
      };
      // Keep only most recent entry per anime
      const filtered = prev.filter((w) => w.animeId !== item.animeId);
      const nextList = [updatedItem, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(nextList));
      } catch (err) {
        console.warn('Could not save watch history', err);
      }
      return nextList;
    });
  };

  const removeWatchHistory = (animeId: string) => {
    setWatchHistory((prev) => {
      const nextList = prev.filter((w) => w.animeId !== animeId);
      try {
        localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(nextList));
      } catch {}
      return nextList;
    });
  };

  const toggleWatchlist = (animeId: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(animeId)
        ? prev.filter((id) => id !== animeId)
        : [...prev, animeId];
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isInWatchlist = (animeId: string) => {
    return watchlist.includes(animeId);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings,
        watchHistory,
        saveWatchProgress,
        removeWatchHistory,
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        supabaseHealth,
        checkSupabaseHealth,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

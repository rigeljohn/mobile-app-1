import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogEntry, StandupStore } from '../types';
import { generateStandup } from '../utils/claudeApi';

const STORAGE_KEY = 'devstand_logs';

const getDateStr = () => new Date().toISOString().split('T')[0];
const getId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const getSprint = () => {
  const weekNum = Math.ceil(new Date().getDate() / 7);
  return `Sprint ${weekNum}`;
};

export const useStandupStore = create<StandupStore & {
  loadLogs: () => Promise<void>;
}>((set, get) => ({
  logs: [],
  isGenerating: false,

  loadLogs: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) set({ logs: JSON.parse(stored) });
    } catch {}
  },

  addLog: async (rawLog: string) => {
    set({ isGenerating: true });
    const id = getId();
    const entry: LogEntry = {
      id,
      rawLog,
      formattedStandup: null,
      createdAt: new Date().toISOString(),
      date: getDateStr(),
      sprint: getSprint(),
    };

    const currentLogs = [entry, ...get().logs];
    set({ logs: currentLogs });

    try {
      const formatted = await generateStandup(rawLog);
      const updated = get().logs.map(l => l.id === id ? { ...l, formattedStandup: formatted } : l);
      set({ logs: updated, isGenerating: false });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      set({ isGenerating: false });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().logs));
    }
  },

  deleteLog: async (id: string) => {
    const updated = get().logs.filter(l => l.id !== id);
    set({ logs: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  clearAll: async () => {
    set({ logs: [] });
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
}));

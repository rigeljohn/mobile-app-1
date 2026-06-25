export interface LogEntry {
  id: string;
  rawLog: string;
  formattedStandup: {
    yesterday: string[];
    today: string[];
    blockers: string[];
  } | null;
  createdAt: string;
  date: string; // YYYY-MM-DD
  sprint?: string;
}

export interface StandupStore {
  logs: LogEntry[];
  isGenerating: boolean;
  addLog: (rawLog: string) => Promise<void>;
  deleteLog: (id: string) => void;
  clearAll: () => void;
}

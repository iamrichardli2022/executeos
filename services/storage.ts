
import { CalendarBlock, CaptureItem, Commitment, StrategicPriority, ExecutionSession } from "../types";

const KEYS = {
  PRIORITIES: "ps_priorities",
  CAPTURE_ITEMS: "ps_capture_items",
  COMMITMENTS: "ps_commitments",
  CALENDAR_BLOCKS: "ps_calendar_blocks",
  SESSIONS: "ps_sessions",
};

export const StorageService = {
  getPriorities: (): StrategicPriority[] => {
    const stored = localStorage.getItem(KEYS.PRIORITIES);
    return stored ? JSON.parse(stored) : [];
  },

  savePriorities: (priorities: StrategicPriority[]) => {
    localStorage.setItem(KEYS.PRIORITIES, JSON.stringify(priorities));
  },

  getCaptureItems: (): CaptureItem[] => {
    const stored = localStorage.getItem(KEYS.CAPTURE_ITEMS);
    return stored ? JSON.parse(stored) : [];
  },

  saveCaptureItems: (items: CaptureItem[]) => {
    localStorage.setItem(KEYS.CAPTURE_ITEMS, JSON.stringify(items));
  },

  getCommitments: (): Commitment[] => {
    const stored = localStorage.getItem(KEYS.COMMITMENTS);
    return stored ? JSON.parse(stored) : [];
  },

  saveCommitments: (items: Commitment[]) => {
    localStorage.setItem(KEYS.COMMITMENTS, JSON.stringify(items));
  },

  getCalendarBlocks: (): CalendarBlock[] => {
    const stored = localStorage.getItem(KEYS.CALENDAR_BLOCKS);
    return stored ? JSON.parse(stored) : [];
  },

  saveCalendarBlocks: (items: CalendarBlock[]) => {
    localStorage.setItem(KEYS.CALENDAR_BLOCKS, JSON.stringify(items));
  },

  getSessions: (): ExecutionSession[] => {
    const stored = localStorage.getItem(KEYS.SESSIONS);
    return stored ? JSON.parse(stored) : [];
  },

  saveSession: (session: ExecutionSession) => {
    const sessions = StorageService.getSessions();
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify([session, ...sessions]));
    
    // Clear current working buffers after saving to a permanent session
    StorageService.saveCaptureItems([]);
    StorageService.saveCommitments([]);
    StorageService.saveCalendarBlocks([]);
  },

  clearCurrentBuffers: () => {
    StorageService.saveCaptureItems([]);
    StorageService.saveCommitments([]);
    StorageService.saveCalendarBlocks([]);
  },

  clearAll: () => {
    localStorage.clear();
    window.location.reload();
  }
};

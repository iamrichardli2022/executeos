import { CalendarBlock, CaptureItem, Commitment, StrategicPriority } from "../types";

const KEYS = {
  PRIORITIES: "ps_priorities",
  CAPTURE_ITEMS: "ps_capture_items",
  COMMITMENTS: "ps_commitments",
  CALENDAR_BLOCKS: "ps_calendar_blocks",
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

  clearAll: () => {
    localStorage.clear();
    window.location.reload();
  }
};
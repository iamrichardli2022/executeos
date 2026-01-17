
export type ItemStatus = "inbox" | "triaged" | "scheduled" | "done" | "discarded";
export type CommitmentType = "task" | "event" | "idea" | "note" | "waiting_on";
export type EnergyLevel = "low" | "medium" | "high";
export type BlockStatus = "planned" | "confirmed" | "moved" | "cancelled" | "completed";

export interface StrategicPriority {
  id: string;
  name: string;
  weight: number;
  description: string;
  examples: string[];
  antiExamples: string[];
  isPinned?: boolean; 
}

export interface CaptureItem {
  id: string;
  rawText: string;
  createdAt: string; // ISO
  status: ItemStatus;
  suggestedType?: CommitmentType;
  suggestedPriorityId?: string;
  discardSuggestionReason?: string;
  confidence?: number;
  clarifyingQuestion?: string;
}

export interface Commitment {
  id: string;
  captureItemId: string;
  type: CommitmentType;
  title: string;
  description?: string;
  priorityId: string;
  durationMinutes: number;
  energy: EnergyLevel;
  deadlineISO?: string;
  timeWindowStartISO?: string;
  timeWindowEndISO?: string;
}

export interface CalendarBlock {
  id: string;
  commitmentId: string;
  googleEventId: string;
  calendarId: string;
  startISO: string;
  endISO: string;
  status: BlockStatus;
  lastSyncedAtISO: string;
}

export interface ExecutionSession {
  id: string;
  timestampISO: string;
  items: CaptureItem[];
  commitments: Commitment[];
  blocks: CalendarBlock[];
  alignmentScore: number;
}

export interface DemoStep {
  screen: string;
  title: string;
  instruction: string;
  targetSelector?: string;
}

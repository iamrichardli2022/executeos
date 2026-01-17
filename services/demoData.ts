
import { v4 as uuidv4 } from 'uuid';
import { StrategicPriority, CaptureItem, Commitment, CalendarBlock, ExecutionSession } from '../types';

const p1Id = uuidv4();
const p2Id = uuidv4();
const p3Id = uuidv4();

export const MOCK_PRIORITIES: StrategicPriority[] = [
  {
    id: p1Id,
    name: "Growth & Learning",
    weight: 80,
    description: "Personal development and skill acquisition.",
    examples: ["Reading", "Courses"],
    antiExamples: ["Passive scrolling"],
    isPinned: true
  },
  {
    id: p2Id,
    name: "Core Business",
    weight: 100,
    description: "Revenue generating activities and client work.",
    examples: ["Sales calls", "Product dev"],
    antiExamples: ["Administrative busywork"],
    isPinned: true
  },
  {
    id: p3Id,
    name: "Wellbeing",
    weight: 70,
    description: "Physical and mental health maintenance.",
    examples: ["Gym", "Meditation"],
    antiExamples: ["Late night work"],
    isPinned: true
  }
];

export const MOCK_INBOX_ITEMS: CaptureItem[] = [
  { id: uuidv4(), rawText: "Complete the Q3 Revenue Projection", createdAt: new Date().toISOString(), status: "inbox" },
  { id: uuidv4(), rawText: "Review the new TypeScript documentation", createdAt: new Date().toISOString(), status: "inbox" },
  { id: uuidv4(), rawText: "Book yoga class for tomorrow", createdAt: new Date().toISOString(), status: "inbox" },
  { id: uuidv4(), rawText: "Check email spam folder", createdAt: new Date().toISOString(), status: "inbox" }
];

export const getDemoExecutionData = () => {
  const now = new Date();
  
  // Task 1: Started 30 mins ago, ends in 30 mins
  const c1Id = uuidv4();
  const start1 = new Date(now.getTime() - 30 * 60000);
  const end1 = new Date(now.getTime() + 30 * 60000);

  // Task 2: Starts in 45 mins
  const c2Id = uuidv4();
  const start2 = new Date(now.getTime() + 45 * 60000);
  const end2 = new Date(now.getTime() + 105 * 60000);

  const commitments: Commitment[] = [
    {
      id: c1Id,
      captureItemId: uuidv4(),
      type: "task",
      title: "Deep Work: Core Product Architecture",
      priorityId: MOCK_PRIORITIES[1].id, // Business
      durationMinutes: 60,
      energy: "high"
    },
    {
      id: c2Id,
      captureItemId: uuidv4(),
      type: "task",
      title: "Review Design Systems for Q4",
      priorityId: MOCK_PRIORITIES[0].id, // Growth
      durationMinutes: 60,
      energy: "medium"
    }
  ];

  const blocks: CalendarBlock[] = [
    {
      id: uuidv4(),
      commitmentId: c1Id,
      googleEventId: "",
      calendarId: "local",
      startISO: start1.toISOString(),
      endISO: end1.toISOString(),
      status: "planned",
      lastSyncedAtISO: now.toISOString()
    },
    {
      id: uuidv4(),
      commitmentId: c2Id,
      googleEventId: "",
      calendarId: "local",
      startISO: start2.toISOString(),
      endISO: end2.toISOString(),
      status: "planned",
      lastSyncedAtISO: now.toISOString()
    }
  ];

  return { commitments, blocks };
};

export const getMockSession = (): ExecutionSession => {
  const sessionId = uuidv4();
  const cId = uuidv4();
  const itemId = uuidv4();
  
  return {
    id: sessionId,
    timestampISO: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    items: [
      { id: itemId, rawText: "Legacy Project Handover", createdAt: new Date().toISOString(), status: "scheduled" }
    ],
    commitments: [
      {
        id: cId,
        captureItemId: itemId,
        type: "task",
        title: "Legacy Project Handover",
        priorityId: MOCK_PRIORITIES[1].id,
        durationMinutes: 60,
        energy: "high"
      }
    ],
    blocks: [
      {
        id: uuidv4(),
        commitmentId: cId,
        googleEventId: "",
        calendarId: "local",
        startISO: new Date(Date.now() - 86400000 + 36000000).toISOString(), // Yesterday 10am
        endISO: new Date(Date.now() - 86400000 + 39600000).toISOString(),   // Yesterday 11am
        status: "completed",
        lastSyncedAtISO: new Date().toISOString()
      }
    ],
    alignmentScore: 92
  };
};

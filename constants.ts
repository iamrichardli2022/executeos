
import { StrategicPriority } from "./types";

export const PRIORITY_SUGGESTIONS: Partial<StrategicPriority>[] = [
  {
    name: "Health",
    description: "Physical and mental well-being activities.",
    examples: ["Go to gym", "Therapy session", "Meal prep"],
  },
  {
    name: "Relationship",
    description: "Time spent with partner or dating.",
    examples: ["Date night", "Deep conversation"],
  },
  {
    name: "Family",
    description: "Activities involving immediate and extended family.",
    examples: ["Call parents", "Play with kids"],
  },
  {
    name: "Business",
    description: "Professional work, career growth, and side projects.",
    examples: ["Finish report", "Client meeting"],
  },
  {
    name: "Money",
    description: "Financial planning, budgeting, and bills.",
    examples: ["Review budget", "Invest savings"],
  },
  {
    name: "Home",
    description: "Household maintenance and chores.",
    examples: ["Clean kitchen", "Home repairs"],
  },
  {
    name: "Growth",
    description: "Learning new skills and personal development.",
    examples: ["Read 30 mins", "Online course"],
  }
];

export const APP_ID = "taskos-app";

// Adding missing Google API configuration constants
// These are required by GoogleService.ts for Calendar and Tasks integration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";
export const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks";

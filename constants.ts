
import { StrategicPriority } from "./types";

// Helper to safely access environment variables in the browser
const getEnv = (name: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name] || "";
    }
  } catch (e) {
    // Ignore errors
  }
  return "";
};

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

// Fallback to empty string if not provided; Google Services will handle missing IDs gracefully or show relevant errors
export const GOOGLE_CLIENT_ID = getEnv("GOOGLE_CLIENT_ID");
export const GOOGLE_API_KEY = getEnv("GOOGLE_API_KEY") || getEnv("API_KEY");
export const SCOPES = "https://www.googleapis.com/auth/calendar.events";

export const APP_ID = "executeos-app";

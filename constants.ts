
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

// Google API configuration for Calendar/Tasks
export const GOOGLE_CLIENT_ID = ""; // To be configured for Google Auth/Calendar
export const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks";

// GOOGLE_API_KEY must be obtained exclusively from process.env.API_KEY per guidelines
export const GOOGLE_API_KEY = process.env.API_KEY;

export const APP_ID = "taskos-app";

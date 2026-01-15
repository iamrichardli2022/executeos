
import { GOOGLE_CLIENT_ID, SCOPES, APP_ID, GOOGLE_API_KEY } from "../constants";

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.result?.error?.message) return error.result.error.message;
  if (error?.error?.message) return error.error.message;
  if (error?.message) return error.message;
  if (error?.error) return typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
  return JSON.stringify(error);
};

export const GoogleService = {
  isInitialized: () => gapiInited && gisInited,

  init: async () => {
    if (gapiInited && gisInited) return;

    return new Promise<void>((resolve, reject) => {
      const checkScripts = () => {
        if (window.gapi && window.google) {
          window.gapi.load('client', async () => {
            try {
              await initializeGapiClient();
              
              if (GOOGLE_CLIENT_ID) {
                initializeGisClient();
              } else {
                console.warn("GOOGLE_CLIENT_ID is missing. Google Sign-In will not be available.");
                gisInited = true; 
              }
              resolve();
            } catch (error: any) {
              const errorMsg = extractErrorMessage(error);
              console.error("Failed to initialize Google API client:", errorMsg);
              reject(new Error(`Google API Init Error: ${errorMsg}`));
            }
          });
        } else {
          const start = Date.now();
          const timer = setInterval(() => {
            if (window.gapi && window.google) {
              clearInterval(timer);
              checkScripts();
            } else if (Date.now() - start > 10000) {
              clearInterval(timer);
              reject(new Error("Google scripts (gapi/google) failed to load after 10s."));
            }
          }, 100);
        }
      };
      checkScripts();
    });
  },

  signIn: () => {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error("Cannot sign in: GOOGLE_CLIENT_ID is not configured.");
    }
    if (!tokenClient) {
      initializeGisClient();
    }

    return new Promise<string>((resolve, reject) => {
      tokenClient.callback = async (resp: any) => {
        if (resp.error) {
          return reject(resp);
        }
        resolve(resp.access_token);
      };

      if (window.gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: "consent" });
      } else {
        tokenClient.requestAccessToken({ prompt: "" });
      }
    });
  },

  // Calendar Methods
  listCalendars: async () => {
    const response = await window.gapi.client.calendar.calendarList.list();
    return response.result.items || [];
  },

  createEvent: async (calendarId: string, eventDetails: any) => {
    const resource = {
        ...eventDetails,
        extendedProperties: {
            private: {
                app_id: APP_ID,
                ...eventDetails.extendedProperties?.private
            }
        }
    };
    
    const response = await window.gapi.client.calendar.events.insert({
      calendarId,
      resource,
    });
    return response.result;
  },

  // Tasks Methods
  listTaskLists: async () => {
    const response = await window.gapi.client.tasks.tasklists.list();
    return response.result.items || [];
  },

  createTask: async (taskListId: string, taskDetails: { title: string; notes?: string; due?: string }) => {
    const response = await window.gapi.client.tasks.tasks.insert({
      tasklist: taskListId,
      resource: taskDetails
    });
    return response.result;
  }
};

async function initializeGapiClient() {
  if (gapiInited) return;
  
  if (window.gapi && window.gapi.client) {
    if (GOOGLE_API_KEY) {
      try {
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            "https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest"
          ],
        });
        gapiInited = true;
      } catch (err) {
        throw err;
      }
    } else {
      console.warn("GOOGLE_API_KEY is missing. Calendar/Tasks functionality may be limited.");
      gapiInited = true;
    }
  } else {
    throw new Error("GAPI client library not loaded correctly.");
  }
}

function initializeGisClient() {
  if (gisInited || !GOOGLE_CLIENT_ID) return;

  if (window.google && window.google.accounts && window.google.accounts.oauth2) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: "", // defined at request time
    });
    gisInited = true;
  } else {
    console.warn("Google Identity Services not loaded correctly.");
  }
}

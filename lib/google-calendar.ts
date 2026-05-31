import "server-only";

import { randomUUID } from "crypto";
import { google, type calendar_v3 } from "googleapis";

const MEETING_TIMEZONE = "Asia/Dhaka";
const MEET_LINK_RETRIES = 3;
const PRIMARY_CALENDAR_ID = "primary";

export type GoogleMeetCreationResult = {
  eventId: string | null;
  meetLink: string | null;
  success: boolean;
};

function getGoogleCalendarConfig() {
  const clientId = process.env.CALENDAR_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.CALENDAR_GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.CALENDAR_GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.CALENDAR_GOOGLE_REFRESH_TOKEN;

  const missing = [
    ["CALENDAR_GOOGLE_CLIENT_ID", clientId],
    ["CALENDAR_GOOGLE_CLIENT_SECRET", clientSecret],
    ["CALENDAR_GOOGLE_REDIRECT_URI", redirectUri],
    ["CALENDAR_GOOGLE_REFRESH_TOKEN", refreshToken],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn("[calendar] Google Calendar OAuth is not configured", {
      missing,
    });
    return null;
  }

  return { clientId, clientSecret, redirectUri, refreshToken };
}

export async function createDiscoveryMeetingMeetLink(input: {
  startDateTime: string;
  endDateTime: string;
}): Promise<GoogleMeetCreationResult> {
  const config = getGoogleCalendarConfig();
  if (!config) {
    console.warn("[calendar] Google Calendar is not configured; skipping Meet link generation");
    return { eventId: null, meetLink: null, success: false };
  }

  try {
    const auth = new google.auth.OAuth2({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
    });
    auth.setCredentials({ refresh_token: config.refreshToken });

    const calendar = google.calendar({ version: "v3", auth });
    const requestBody: calendar_v3.Schema$Event = {
      summary: "Hylith Discovery Meeting",
      start: { dateTime: input.startDateTime, timeZone: MEETING_TIMEZONE },
      end: { dateTime: input.endDateTime, timeZone: MEETING_TIMEZONE },
    };

    const payload: calendar_v3.Params$Resource$Events$Insert = {
      calendarId: PRIMARY_CALENDAR_ID,
      conferenceDataVersion: 1,
      requestBody: {
        ...requestBody,
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      },
    };

    return await createEventWithRetry(calendar, payload, {
      calendarId: PRIMARY_CALENDAR_ID,
      requestBody,
    });
  } catch (error) {
    console.error("[calendar] Failed to create Google Meet link:", error);
    return { eventId: null, meetLink: null, success: false };
  }
}

async function createEventWithRetry(
  calendar: calendar_v3.Calendar,
  payload: calendar_v3.Params$Resource$Events$Insert,
  fallbackPayload: calendar_v3.Params$Resource$Events$Insert,
  retries = MEET_LINK_RETRIES,
): Promise<GoogleMeetCreationResult> {
  let lastEventId: string | null = null;
  let lastConferenceData: calendar_v3.Schema$ConferenceData | undefined;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const event = await calendar.events.insert(payload);
      lastEventId = event.data.id ?? null;
      lastConferenceData = event.data.conferenceData;

      const meetLink = event.data.conferenceData?.entryPoints?.find(
        (entryPoint) => entryPoint.entryPointType === "video",
      )?.uri ?? event.data.hangoutLink ?? null;

      const hasMeet = event.data.conferenceData?.entryPoints?.some(
        (entryPoint) => entryPoint.entryPointType === "video",
      );

      console.log("[calendar] Google Calendar event insert result", {
        eventId: lastEventId,
        meetLink,
        attempt,
        retryCount: attempt - 1,
        conferenceData: event.data.conferenceData,
      });

      if (hasMeet && meetLink) {
        return { eventId: lastEventId, meetLink, success: true };
      }

      console.warn("[calendar] Calendar event created without a Meet link; retrying", {
        eventId: lastEventId,
        attempt,
        retries,
        conferenceData: event.data.conferenceData,
      });
    } catch (error) {
      console.error("[calendar] Google Calendar event insert attempt failed", {
        attempt,
        retries,
        error,
      });
    }
  }

  console.error("[calendar] Failed to generate Google Meet link after retries", {
    eventId: lastEventId,
    retryCount: retries,
    conferenceData: lastConferenceData,
  });

  return await createFallbackCalendarEvent(calendar, fallbackPayload, lastEventId);
}

async function createFallbackCalendarEvent(
  calendar: calendar_v3.Calendar,
  payload: calendar_v3.Params$Resource$Events$Insert,
  existingEventId: string | null,
): Promise<GoogleMeetCreationResult> {
  if (existingEventId) {
    return { eventId: existingEventId, meetLink: null, success: false };
  }

  try {
    const event = await calendar.events.insert(payload);
    const eventId = event.data.id ?? null;

    console.log("[calendar] Created fallback Calendar event without Meet link", {
      eventId,
    });

    return { eventId, meetLink: null, success: false };
  } catch (error) {
    console.error("[calendar] Failed to create fallback Calendar event", { error });
    return { eventId: null, meetLink: null, success: false };
  }
}

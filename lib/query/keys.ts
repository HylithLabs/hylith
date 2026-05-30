export const queryKeys = {
  adminMeetings: ["admin", "meetings"] as const,
  clientMeetings: ["client", "meetings"] as const,
  availabilitySettings: ["admin", "availability-settings"] as const,
  availability: ["availability"] as const,
  availabilityDays: ["availability", "days"] as const,
  availabilitySlots: (dateKey: string) =>
    ["availability", "slots", dateKey] as const,
  notificationRecipients: ["admin", "notification-recipients"] as const,
  supabaseToken: ["supabase", "access-token"] as const,
};

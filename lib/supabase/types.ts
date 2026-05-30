export type AssignmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "closed";

export type AssignmentRow = {
  id: string;
  client_id: string;
  email: string;
  name: string;
  start_at: string;
  timezone: string;
  duration_minutes: number;
  status: AssignmentStatus;
  project_summary: string;
  company: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type SettingsRow = {
  id: string;
  available_slots: string[];
  slot_duration_minutes: number;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type NotificationRecipientRow = {
  id: string;
  email: string;
  created_at: string;
};

export type MeetingDto = {
  _id: string;
  userId: string;
  email: string;
  name: string;
  startAt: string;
  timezone: string;
  status: AssignmentStatus;
  projectSummary: string;
  company: string | null;
  phone: string | null;
  createdAt: string;
};

export type AssignmentMeetingRow = Pick<
  AssignmentRow,
  | "id"
  | "client_id"
  | "email"
  | "name"
  | "start_at"
  | "timezone"
  | "status"
  | "project_summary"
  | "company"
  | "phone"
  | "created_at"
>;

export function assignmentToMeetingDto(row: AssignmentMeetingRow): MeetingDto {
  return {
    _id: row.id,
    userId: row.client_id,
    email: row.email,
    name: row.name,
    startAt: row.start_at,
    timezone: row.timezone,
    status: row.status,
    projectSummary: row.project_summary,
    company: row.company,
    phone: row.phone,
    createdAt: row.created_at,
  };
}

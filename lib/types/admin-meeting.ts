export type AdminMeetingItem = {
  _id: string;
  userId: string;
  email: string;
  name: string;
  startAt: string;
  timezone: string;
  status: "pending" | "confirmed" | "cancelled" | "closed";
  projectSummary: string;
  company: string | null;
  phone: string | null;
  createdAt: string;
};

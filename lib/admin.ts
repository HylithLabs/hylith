export const ADMIN_EMAIL = "jotirmoybhowmik1976@gmail.com";
export const ADMIN_PASSWORD = "hylithhylith";

export function isAdminEmail(email: string | null | undefined): boolean {
  return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

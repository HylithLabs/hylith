// Decoupled: Auth.js NextAuth route handler deprecated.
// All identity management is sovereignly owned by NestJS.
export async function GET() {
  return new Response("Deprecated", { status: 404 });
}
export async function POST() {
  return new Response("Deprecated", { status: 404 });
}

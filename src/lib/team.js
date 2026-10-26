// Read-only viewers vs. the editing team.
//
// A "viewer" (for example an invited KP partner) gets a clean, read-only app:
// the editing tools and buttons are hidden and they land on the Dashboard.
// Everyone else keeps the full workspace.
//
// IMPORTANT: this list only controls what a viewer SEES. The real protection is
// in the database (supabase_viewer_access.sql), which blocks writes from anyone
// who is not on the team regardless of the UI. Add a viewer's EXACT sign-in
// email (lowercased) below to switch them into read-only mode.
export const VIEWER_EMAILS = [
  // 'sheila-REPLACE-with-her-exact-email@example.com',
].map((e) => e.toLowerCase())

export function isViewer(email) {
  return !!email && VIEWER_EMAILS.includes(email.toLowerCase())
}

export function canEdit(email) {
  return !isViewer(email)
}

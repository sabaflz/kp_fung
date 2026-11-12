// Read-only viewers vs. the editing team.
//
// A "viewer" (for example an invited KP partner) gets a clean, read-only app:
// the editing tools and buttons are hidden and they land on the Dashboard.
// Everyone else keeps the full workspace.
//
// IMPORTANT: this list only controls what a viewer SEES. The real protection is
// in the database (supabase_access.sql), which blocks writes from anyone
// who is not on the team regardless of the UI. Add a viewer's EXACT sign-in
// email (lowercased) below to switch them into read-only mode.
// Saffron's three accounts (saba.f88@gmail.com, saba.feilizadeh@gmail.com,
// saba.feilizadeh@berkeley.edu) are never viewers. They get the full workspace
// everywhere, and they are all in is_team() in the database too.
export const VIEWER_EMAILS = [
  'Sheila.X.Baxter@kp.org',
  'Amy.L.Benisch@kp.org',
  'Tamer.M.Barakat@kp.org',
].map((e) => e.toLowerCase())

// Saffron's own accounts. Owner-only tools (the test survey) check this list.
export const OWNER_EMAILS = [
  'saba.f88@gmail.com',
  'saba.feilizadeh@gmail.com',
  'saba.feilizadeh@berkeley.edu',
]

export function isOwner(email) {
  return !!email && OWNER_EMAILS.includes(email.toLowerCase())
}

export function isViewer(email) {
  return !!email && VIEWER_EMAILS.includes(email.toLowerCase())
}

export function canEdit(email) {
  return !isViewer(email)
}

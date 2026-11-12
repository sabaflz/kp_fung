# Giving the KP partners access

Three ways in exist in the app. Only one of them needs you to do
something first, and it is the one worth using before a live meeting.

## What is already built

The sign-in page offers all three:

- **Google.** No use to the partners. Their kp.org addresses are not
  Google accounts.
- **Magic link.** Works with any address, kp.org included. They type
  their email, we send a link, they click it. Nothing to set up.
- **Email and password.** Built and working, but there is no sign-up
  form anywhere in the app, by design. Someone has to create the account
  for them, which is the step below.

## Use a password for anything live

Magic link is fine for someone working at their own pace. It is a bad
bet five minutes before a meeting, because it depends on a corporate
mail system delivering an external email promptly, and on the partner
being able to click a link in it. Neither is something to discover live.

So create password accounts ahead of the first session.

## Creating the three accounts

In the Supabase dashboard, for each partner:

1. **Authentication** then **Users** then **Add user** then **Create
   new user**.
2. Enter their address exactly: `Sheila.X.Baxter@kp.org`,
   `Amy.L.Benisch@kp.org`, `Tamer.M.Barakat@kp.org`.
3. Set a password. Tick **Auto Confirm User**, or they will be sent a
   confirmation email and the password will not work until they act on
   it, which defeats the point.
4. Send each person their own password. Not in the same message as the
   link, and not in a group thread.

Then check your work: **Authentication** then **Users** should list all
three with a confirmed date and no pending invite.

## Then confirm what they will see

Their access comes from `is_viewer()` in `supabase_access.sql`, so that
file has to have been run or they sign in to an empty app.

Sign in as one of them yourself, once, before the meeting. You should
see the research and the dashboards, no editing tools, and no interest
list. That last one is deliberate: people left their email believing a
student research team was keeping it, so the partners do not get those
addresses unless the team decides to share them and the survey says so.

## If someone cannot get in

Work down this list, because it is roughly in order of likelihood.

- The address they typed does not match the one in `is_viewer()`.
  Capitalisation does not matter, spelling does.
- `supabase_access.sql` has not been run, or was run before their
  address was added to it.
- The account exists but was never confirmed. Check for a pending
  invite in **Authentication** then **Users**.
- They are hitting a stale session. Signing out and in again clears it.

To see what the database currently thinks, run this in the SQL Editor:

```sql
select email, last_sign_in_at, confirmed_at
  from auth.users
 order by email;
```

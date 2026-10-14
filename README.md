# Benefits Interview Kit

A shared, live-synced web app for the Fung x KP Benefits research team. Run interviews from a vetted question library, log every conversation in one place, pull the fields out of a transcript with AI, and watch the synthesis update for the whole team in real time.

Built with React + Vite, backed by Supabase (free), hosted on Vercel (free).

---

## What it does

- **Run** picks a question set and walks you through it live, with a progress tracker and a one-tap copy of the whole script.
- **Interviews** is the shared log. Paste a transcript, copy the extract prompt into any AI, paste the answer back, and the fields fill themselves. Everything one teammate saves shows up for everyone, instantly.
- **Question sets** is the 25-question pool. Pick questions, name a set, save it for the team.
- **Dashboard** tallies top benefits, what people want, segments and plans as the data comes in, with a quote wall and one-click export to CSV or straight into Google Sheets.

Sign-in is a magic link to your email. No passwords. Add a teammate by having them sign in with their email, no admin step needed.

---

## One-time setup (about 15 minutes, all free)

You do this once. After that everyone else just opens the link and signs in.

### 1. Create the database (Supabase)

1. Go to supabase.com and sign up (free, no card).
2. Click **New project**. Give it a name, set a database password (save it somewhere), pick the closest region. Wait about two minutes while it provisions.
3. In the left sidebar open **SQL Editor**, click **New query**, paste in the entire contents of `supabase_schema.sql` from this folder, and hit **Run**. You should see "Success." This creates the two tables and the sharing rules.
4. In the left sidebar open **Project Settings -> API**. Copy two values:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

### 2. Put the app online (Vercel)

1. Push this folder to a GitHub repo (or drag it into vercel.com's importer).
2. Go to vercel.com, sign up with GitHub (free), click **Add New -> Project**, and import the repo.
3. Before you click Deploy, open **Environment Variables** and add the two keys from step 1:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
4. Click **Deploy**. In about a minute you get a live URL like `benefits-interview-kit.vercel.app`.

### 3. Point Supabase back at that URL

So the magic link sends people to the right place:

1. Back in Supabase, open **Authentication -> URL Configuration**.
2. Set **Site URL** to your Vercel URL, and add the same URL under **Redirect URLs**.
3. Save.

That is it. Share the Vercel URL with the team. Everyone signs in with their email and sees the same shared interviews and sets.

---

## Run it locally (optional)

```bash
npm install
cp .env.example .env    # then paste your two keys into .env
npm run dev
```

Open the printed localhost URL. For the magic link to work locally, add `http://localhost:5173` to the Supabase Redirect URLs list too.

---

## The one-click AI extraction (add later)

Today, auto-fill works with zero cost and zero shared key: you copy the extract prompt plus your transcript, paste it into any AI assistant you already use, and paste its answer back into the form, which fills the fields for you.

A true one-click button (no copy-paste) needs an API key, and a shared key would mean everyone drawing on one bill. When you want it, the clean way is a Supabase **Edge Function** that holds the key server-side and does the extraction on request, so the key never ships to the browser. The button for it is already in the form, disabled, waiting for that function. Ask and it can be wired up.

---

## Files

- `supabase_schema.sql` - paste once into Supabase (step 1.3). Creates the shared tables.
- `.env.example` - the two keys the app needs.
- `src/data/pool.js` - the question pool, starter sets, field definitions, and the AI extract prompt. Edit here to change questions.
- `src/lib/` - Supabase client, auth, and the live-sync data hooks.
- `src/pages/` - the four screens.

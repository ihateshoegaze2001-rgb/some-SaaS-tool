# Caption Board — local prototype

A working version of your freemium content-suite dashboard that runs on
your own computer, using your own Anthropic (or Groq) API key.

This version has moved the frontend to **React**, and reorganized it as a
**dashboard** with a sidebar: Captions is the first tool, with a few more
already sketched in as "Coming soon" so the suite has somewhere to grow.

## What's in this folder

```
caption-board-local/
├── server.js             the backend — calls the LLM, tracks usage, serves the app
├── package.json           server dependencies + scripts (run from here)
├── .env.example            template for your API key
├── usage-db.json           created automatically — your local "database"
├── dist/                   created by the build step — the compiled dashboard
└── client/                the React app (its own mini project)
    ├── package.json        client-only dependencies (React, Vite, router, icons)
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx              routes: "/" , "/captions", and one for every other tool
        ├── main.jsx
        ├── lib/
        │   ├── tools.js          the sidebar's nav list — add a tool by adding one entry
        │   ├── api.js            fetch helpers for the Express API
        │   └── PlanContext.jsx   shared free/pro + usage state
        ├── components/           Sidebar, Layout, PageHeader
        └── pages/
            ├── Overview.jsx       dashboard home
            ├── CaptionsPage.jsx   the caption generator (ported from the old prototype)
            └── ComingSoonPage.jsx placeholder shown for any tool not built yet
```

## One-time setup

1. **Install Node.js** (if you haven't): download the LTS version from
   [nodejs.org](https://nodejs.org) and run the installer. Restart your
   terminal afterward.

2. **Get an API key — pick one:**
   - **Free, no card, for testing (recommended to start):** sign up at
     [console.groq.com](https://console.groq.com) with just an email,
     go to **API Keys**, create one.
   - **The real thing, for when you launch:** sign up at
     [console.anthropic.com](https://console.anthropic.com), go to
     **API Keys**, create one. This requires adding a card and buying
     prepaid credits — skip this until you're ready to add billing.

3. **Open a terminal in this folder** (the one with `server.js` in it).

4. **Add your API key.** Make a copy of `.env.example`, rename the copy to
   `.env`, and paste your key after the matching line, e.g.:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```

5. **Install dependencies.** This project now has two `package.json`
   files — one for the server, one for the React client — but one command
   installs both:
   ```
   npm install
   ```
   (Installing at the root automatically triggers an install inside
   `client/` too.) You only need to do this once, or again after pulling
   in a new dependency.

## Running it

Every time you want to run the app:
```
npm start
```
This builds the React dashboard and then starts the server. You should see:
```
✅ Caption Board running at http://localhost:3000
```
Open that address in your browser.

To stop the server, go back to the terminal and press `Ctrl + C`. If you
change any file in `client/src`, you'll need to run `npm start` again to
rebuild — or use the live-reloading dev mode below while actively editing.

### Editing the UI (optional, for active development)

Instead of rebuilding after every change, run:
```
npm run dev
```
This starts the server *and* a live-reloading React dev server together, at
[http://localhost:5173](http://localhost:5173). Edits to anything in
`client/src` show up instantly there. (`http://localhost:3000` still works
too, but only reflects whatever you last built with `npm start`.)

## Testing the free/paid limits

The **Free / Pro** toggle now lives in the sidebar, under the tool list —
it applies suite-wide rather than just to Captions, since usage tracking is
meant to be shared across every tool as they're added. Flip to Free and
generate until you hit the 15/month cap; flip to Pro to confirm the
300/month cap works too.

Your usage is stored in `usage-db.json`, keyed by a random ID given to your
browser in a cookie. **Delete that file** any time to reset all test usage
back to zero.

## The dashboard nav — what's there and why

Besides Captions (the only tool that's actually wired up), the sidebar
sketches in four more, picked as likely next steps for a social-content
suite:

| Tool | Idea |
|---|---|
| **Content calendar** | Lay out what's posting where, and when, across the month |
| **Hashtag finder** | Pair trending tags with niche ones so posts get found |
| **Idea bank** | A running list of post ideas/prompts, so you never start blank |
| **Brand kit** | Save your voice, tone, and off-limits words once, reused by every tool |

These are just a starting suggestion — rename, reorder, or delete any of
them in `client/src/lib/tools.js`. Each one currently shows a "Coming soon"
placeholder page; when you're ready to build one for real, give it a
`status: 'live'` entry and its own page component the way `CaptionsPage.jsx`
is wired into `App.jsx`.

## What's real vs. simulated right now

| Piece | Status |
|---|---|
| Caption generation (Groq or Claude API) | ✅ Real — whichever key you set |
| Free/Pro usage limits | ✅ Real (enforced server-side, shared across tools) |
| Dashboard nav / routing | ✅ Real (React Router) |
| Other four tools | ⚠️ Placeholder pages only — no functionality yet |
| Which plan you're on | ⚠️ Simulated via the toggle button — no real payment yet |
| Accounts / login | ⚠️ Simulated via an anonymous cookie — no real signup yet |
| Hosting | ⚠️ Your own computer only — not reachable by anyone else yet |

## Switching from Groq to Claude later

When you're ready to add billing: get an Anthropic API key, put it in
`.env` as `ANTHROPIC_API_KEY=...`, and restart the server. Nothing else in
the code needs to change — it auto-switches providers, or you can force it
with `LLM_PROVIDER=anthropic`.

## Next step

Once this feels right, we move `server.js` to a real host (e.g. Render or
Railway), swap `usage-db.json` for a proper database, add real
sign-up/login, connect the Free/Pro toggle to actual Stripe subscriptions,
and start building out one of the placeholder tools for real. Come back to
Claude when you're ready for that step.

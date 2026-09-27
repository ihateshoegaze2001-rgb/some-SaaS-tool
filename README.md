# Caption Board — local prototype

A working version of your freemium caption tool that runs on your own
computer, using your own Anthropic API key. This is step 3 of the roadmap
(get key → install Node → **this** → run it → test limits → deploy).

## What's in this folder

```
caption-board-local/
├── server.js          the backend — calls Claude, tracks usage
├── package.json        list of dependencies (Express, dotenv)
├── .env.example         template for your API key
├── usage-db.json        created automatically — your local "database"
└── public/
    └── index.html       the caption board interface (frontend)
```

## One-time setup

1. **Install Node.js** (if you haven't): download the LTS version from
   [nodejs.org](https://nodejs.org) and run the installer. Restart your
   terminal afterward.

2. **Get an API key — pick one:**
   - **Free, no card, for testing (recommended to start):** sign up at
     [console.groq.com](https://console.groq.com) with just an email,
     go to **API Keys**, create one. Groq runs fast open-source models
     for free within generous rate limits — plenty for testing this app.
   - **The real thing, for when you launch:** sign up at
     [console.anthropic.com](https://console.anthropic.com), go to
     **API Keys**, create one. This requires adding a card and buying
     prepaid credits (it's billed separately from any Claude.ai
     subscription) — skip this until you're ready to add billing.

3. **Open a terminal in this folder.**
   - Mac: right-click the folder → *New Terminal at Folder* (or open
     Terminal and type `cd ` then drag the folder in, then press Enter).
   - Windows: open the folder in File Explorer, click the address bar,
     type `cmd`, press Enter.

4. **Add your API key.** In this folder, make a copy of `.env.example` and
   rename the copy to `.env` (just `.env`, no other text — in Windows
   File Explorer, turn on "show file extensions" first so you can confirm
   it isn't secretly `.env.txt`). Open it in any text editor and paste your
   key after the matching line, so it reads e.g.:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```
   The variable name and the `=` have to stay — a file with only the raw
   key and nothing else won't work. Leave the other key line blank.

5. **Install dependencies** — in the terminal, run:
   ```
   npm install
   ```
   This downloads the two small libraries the server needs (Express and
   dotenv). You only need to do this once (or again if you change
   `package.json`).

## Running it

Every time you want to run the app:
```
npm start
```
You should see:
```
✅ Caption Board running at http://localhost:3000
```
Open that address in your browser. That's it — the corkboard interface
loads, and clicking "Pin 5 new captions" makes a real call to Claude using
your API key.

To stop the server, go back to the terminal and press `Ctrl + C`.

## Testing the free/paid limits

There's a **Simulate: Free / Simulate: Pro** toggle in the sidebar. This
stands in for real billing — flip it to Free and generate until you hit
the 15/month cap, and you should see an upgrade-style message instead of a
crash. Flip to Pro to confirm the 300/month cap works too.

Your usage is stored in `usage-db.json`, keyed by a random ID Claude gives
your browser in a cookie. **Delete that file** any time to reset all test
usage back to zero.

## What's real vs. simulated right now

| Piece | Status |
|---|---|
| Caption generation (Groq or Claude API) | ✅ Real — whichever key you set |
| Free/Pro usage limits | ✅ Real (enforced server-side) |
| Which plan you're on | ⚠️ Simulated via the toggle button — no real payment yet |
| Accounts / login | ⚠️ Simulated via an anonymous cookie — no real signup yet |
| Hosting | ⚠️ Your own computer only — not reachable by anyone else yet |

## Switching from Groq to Claude later

When you're ready to add billing: get an Anthropic API key, put it in
`.env` as `ANTHROPIC_API_KEY=...`, and restart the server. Nothing else in
the code needs to change — it auto-switches providers, or you can force it
with `LLM_PROVIDER=anthropic`. Caption quality should improve a bit; the
rest of the app behaves identically.

## Next step

Once this feels right, we move the exact same `server.js` logic to a real
host (e.g. Render or Railway), swap `usage-db.json` for a proper database,
add real sign-up/login, and connect the Free/Pro toggle to actual Stripe
subscriptions. Come back to Claude when you're ready for that step.

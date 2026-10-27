# VoteReady (civic-vote-app)

A voter information web app built on the Google Civic Information API, deployed on Netlify with no database.

## Docs
- [Product Requirements Document](docs/VoteReady_PRD.pdf)
- [Google Civic Information API Overview](docs/Google_Civic_API_Overview.pdf)

## v1.0 (Phase 1 MVP)
- **Address search**: saved only in this browser's localStorage, with a "Clear my data" button.
- **Where to vote**: polling places, early voting sites, and drop boxes on a Leaflet/OpenStreetMap map, with hours and directions links.
- **My ballot**: every contest, with candidates in API order, links, and measures with official text and pro/con statements. Users can mark picks privately (saved on device) and print them.
- **Election office**: state and local offices, registration/absentee/ballot links, hours, and contacts.
- **Demo mode**: "Try a demo" uses Google's permanent test election (ID 2000).
- **Election countdown**: shows the next upcoming election, and lets the user pick a specific election.
- **Friendly errors** for each Civic API status, and a "confirm with your election office" notice on every result.

## Stack
- React + Vite + TypeScript + Tailwind, built to `dist/`
- Netlify Functions in `netlify/functions/` proxy the Civic API so the key never reaches the browser:
  - `GET /api/elections`: CDN-cached for 1 hour
  - `GET /api/voterinfo?address=…&electionId=…`: CDN-cached for up to 24 hours
  - `GET /api/health`: reports whether `CIVIC_API_KEY` is set (never the key itself)
- Each function has a best-effort rate limit (30 requests/min per IP). Addresses are never logged.

## Deploy on Netlify
1. Netlify → **Add new site → Import an existing project** → pick this repo, branch `main`. Build settings come from `netlify.toml`.
2. **Site configuration → Environment variables** → add `CIVIC_API_KEY` with your Google Civic Information API key (scope: Functions).
3. Deploy, then open `/api/health`. It should show `"civicKeyConfigured": true`.

## Local development
```bash
npm install
npm run build        # typecheck + production build
npx netlify dev      # runs the site and functions together; put CIVIC_API_KEY in .env
```

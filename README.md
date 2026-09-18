# November Mixer — Doctor Locations

A polished single-page site for Spectrum Medical Evaluators' **November Mixer**. It lists the
event's physicians and the locations where you can find them. The page reads a **private Google
Sheet** through a Vercel serverless function, so the list stays in sync automatically — no
spreadsheet clutter, no manual publishing.

## How it works

```
Google Sheet (private)  ──▶  api/doctors.ts (Vercel fn, service account, edge-cached 30s)
                                      │ grouped + sorted JSON
                                      ▼
                        React app (SWR: polls every 60s + on tab focus)
```

- `src/lib/doctors.ts` — shared, pure logic (parse → group → sort → index). Used by both the
  API function and the UI, so the data behaves identically everywhere.
- `src/hooks/useDoctors.ts` — polling + last-good-payload caching. In local dev, if the API
  isn't running, the page falls back to sample data (`src/lib/sample.ts`).
- `api/doctors.ts` — authenticates with a Google **service account**, reads `A:B` of your
  sheet tab, and responds with `Cache-Control: s-maxage=30` so polling stays cheap.

## Sheet format

| A (Doctor)     | B (Location)                  |
| -------------- | ----------------------------- |
| Dr. Ana Reyes  | Spectrum Clinic — Makati     |
| Dr. Ana Reyes  | The Medical City — Pasig      |
| Dr. Ben Cruz   | Spectrum Clinic — Ortigas     |

- One row per **doctor–location pair** (repeat the doctor for each location — the app groups them).
- A header row is optional (it is detected and skipped). The tab defaults to `Sheet1`.

## Setup

### 1. Google Cloud (one time)

1. Create or pick a project at [console.cloud.google.com](https://console.cloud.google.com).
2. Enable the **Google Sheets API**.
3. Create a **service account** (no roles needed), then create a **JSON key** for it.
4. Share your Google Sheet with the service account email (e.g. `name@project.iam.gserviceaccount.com`)
   as **Viewer**. The sheet stays private — nobody else needs access.

### 2. Environment variables

Copy `.env.example` to `.env.local` (used by `npx vercel dev`), and add the same values in
**Vercel → Project → Settings → Environment Variables**:

| Variable                          | Required | Notes                                              |
| --------------------------------- | -------- | -------------------------------------------------- |
| `GOOGLE_SHEET_ID`                 | yes      | from the sheet URL: `/spreadsheets/d/<ID>/edit`     |
| `GOOGLE_SHEET_NAME`               | no       | defaults to `Sheet1`                                |
| `GOOGLE_SERVICE_ACCOUNT_JSON`     | one of   | the full JSON key file contents (single line is fine) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`    | pair     | alternative: email + private key fields             |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | pair  | literal `\n` escapes are handled                    |

### 3. Run locally

```bash
npm install
npm run dev        # full local stack — /api/* runs inside the Vite dev server, reading .env/.env.local
```

`npm run dev` serves the real sheet through the same handler production uses — no Vercel CLI
or login needed. If the sheet can't be read, development falls back to sample data; open
`http://localhost:5173/api/doctors` to see the raw JSON or the exact error message.

For maximum Vercel fidelity (edge caching, runtime parity), `npx vercel dev` still works too.

### 4. Deploy to Vercel

Import the repository in Vercel (the **Vite** preset is auto-detected — no `vercel.json`
needed), set the environment variables above, and deploy. `/api/doctors` becomes a
serverless function automatically.

## Scripts

| Command           | Purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Local dev server (sample data)       |
| `npm run build`   | Type-check + production build        |
| `npm run preview` | Preview the production build         |
| `npm run lint`    | Lint with oxlint                     |

## Customizing

- Brand copy, links, sync interval, and the featured event live in `src/config/site.ts`.
- Design tokens (colors, radii, easing) live in `src/index.css` under `@theme`.
- Replace the placeholder logos at `public/images/logo-full.webp` and `public/images/logo-icon.webp`.

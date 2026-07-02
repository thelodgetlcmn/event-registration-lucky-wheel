# Event Registration + Lucky Wheel

Production-ready starter for event registration, admin dashboard, winner management, and a lucky wheel.

Stack versions checked from npm on 2026-07-02:

| Package              | Version |
| -------------------- | ------- |
| Next.js              | 16.2.10 |
| React / React DOM    | 19.2.7  |
| TypeScript           | 6.0.3   |
| Tailwind CSS         | 4.3.2   |
| lucide-react         | 1.23.0  |
| Zustand              | 5.0.14  |
| Zod                  | 4.4.3   |
| isomorphic-dompurify | 3.18.0  |
| xlsx                 | 0.18.5  |
| ESLint               | 9.39.4  |
| Vitest               | 4.1.9   |
| Playwright           | 1.61.1  |

## 1. Project Structure

```txt
event-registration-lucky-wheel/
  app/
    api/
      csrf/route.ts
      register/route.ts
      sheet/route.ts
      wheel/route.ts
      winners/route.ts
    admin/
      dashboard/page.tsx
      layout.tsx
      wheel/page.tsx
      winners/page.tsx
    error.tsx
    globals.css
    layout.tsx
    loading.tsx
    not-found.tsx
    page.tsx
  components/
    admin/DashboardClient.tsx
    admin/RegistrantTable.tsx
    admin/StatsCards.tsx
    admin/WinnersClient.tsx
    layout/AdminShell.tsx
    registration/RegistrationForm.tsx
    ui/Button.tsx
    ui/ConfirmDialog.tsx
    ui/Skeleton.tsx
    ui/Spinner.tsx
    ui/TextField.tsx
    ui/ThemeToggle.tsx
    ui/ToastViewport.tsx
    wheel/LuckyWheelCanvas.tsx
    wheel/WheelClient.tsx
  e2e/registration.spec.ts
  google-apps-script/Code.gs
  hooks/
    useRegistrants.ts
    useRegistration.ts
    useToast.ts
    useWinners.ts
  lib/
    api-path.ts
    constants.ts
    fetcher.ts
    server/api-error.ts
    server/csrf.ts
    server/env.ts
    server/gas.ts
    server/request.ts
    server/response.ts
  services/
    csrf.ts
    register.ts
    sheet.ts
    wheel.ts
  styles/theme.css
  tests/
    csv.test.ts
    validation.test.ts
  types/
    api.ts
    registration.ts
    sheet.ts
    ui.ts
  utils/
    cn.ts
    csv.ts
    date.ts
    download.ts
    sanitize.ts
    validation.ts
```

File responsibilities:

| Path                                           | Purpose                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `app/page.tsx`                                 | Registration page.                                                       |
| `app/admin/dashboard/page.tsx`                 | Admin table, search, filter, sorting, pagination, import/export, reset.  |
| `app/admin/wheel/page.tsx`                     | Lucky wheel page.                                                        |
| `app/admin/winners/page.tsx`                   | Winner list page.                                                        |
| `app/api/*/route.ts`                           | Same-origin secure proxy from Next.js to Google Apps Script.             |
| `components/registration/RegistrationForm.tsx` | Client form with duplicate-submit protection and toast feedback.         |
| `components/wheel/LuckyWheelCanvas.tsx`        | Smooth Canvas wheel animation using `requestAnimationFrame`.             |
| `components/wheel/WheelClient.tsx`             | Claims winner through backend, then animates to that winner.             |
| `google-apps-script/Code.gs`                   | Apps Script backend for Google Sheets.                                   |
| `services/*`                                   | Typed client API calls.                                                  |
| `utils/validation.ts`                          | Client and server Zod validation.                                        |
| `utils/sanitize.ts`                            | Trim, sanitize, HTML escape, SQL-like detection, sheet formula escaping. |
| `lib/server/*`                                 | Server-only env, CSRF, GAS fetcher, response helpers.                    |

## 2. Package Installation

```bash
pnpm install
pnpm dev
```

Production checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

## 3. Google Apps Script

Open `google-apps-script/Code.gs`, copy the whole file into Apps Script, and set these Script Properties:

| Property         | Value                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `API_SECRET`     | Same value as `APPS_SCRIPT_SHARED_SECRET` in Vercel/`.env.local`.                         |
| `SPREADSHEET_ID` | Optional if the script is bound to the target Sheet. Required for standalone Apps Script. |

Supported endpoints:

| Method | Action            | Description                                                  |
| ------ | ----------------- | ------------------------------------------------------------ |
| GET    | `?action=health`  | API health check.                                            |
| GET    | `?action=list`    | List all registrants.                                        |
| GET    | `?action=winners` | List winners only.                                           |
| POST   | `register`        | Add new registrant.                                          |
| POST   | `drawWinner`      | Randomly select and mark one available registrant as winner. |
| POST   | `removeWinner`    | Mark a specific UUID as winner.                              |
| POST   | `import`          | Batch import rows.                                           |
| POST   | `reset`           | Clear data rows except header.                               |

Response contract:

```json
{
  "success": true,
  "message": "Success",
  "data": [],
  "error": null,
  "statusCode": 200
}
```

Important implementation notes:

- `LockService` protects `drawWinner`, `removeWinner`, `register`, `import`, and `reset`.
- Duplicate registration is checked by normalized first name + last name.
- Rate limiting uses `CacheService` and the client request id/name key.
- Inputs are validated on both Next.js and Apps Script.
- Sheet formula injection is escaped before writing to Google Sheets.
- Apps Script cannot reliably set custom CORS headers for every browser scenario; this project uses a Next.js proxy to keep CORS and secrets clean.

## 4. Google Sheet Setup

Create a Google Sheet with this header row:

```txt
Timestamp | First Name | Last Name | UUID | Status | Winner
```

The script also creates or repairs the header automatically on first run.

Recommended sheet name:

```txt
Registrations
```

## 5. Types

Core types live in:

- `types/api.ts`
- `types/registration.ts`
- `types/sheet.ts`
- `types/ui.ts`

No `any` is used in application code. Unknown API bodies are treated as `unknown`, validated, then narrowed.

## 6. API Service

Client services:

- `services/register.ts`
- `services/sheet.ts`
- `services/wheel.ts`
- `services/csrf.ts`

Server proxy:

- `app/api/register/route.ts`
- `app/api/sheet/route.ts`
- `app/api/wheel/route.ts`
- `app/api/winners/route.ts`

Architecture choice:

| Option                             | Pros                                                                        | Cons                                                              |
| ---------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Browser calls Apps Script directly | Simple                                                                      | Exposes endpoint, weak CORS control, harder CSRF/secret handling. |
| Next.js proxy to Apps Script       | Hides secret, same-origin requests, easier CSRF, better error normalization | Adds one thin server layer.                                       |

Chosen: Next.js proxy. Apps Script remains the backend/data writer; Next.js only validates, protects, and forwards.

## 7. Components

Reusable UI:

- Button
- TextField
- Spinner
- Skeleton
- ToastViewport
- ConfirmDialog
- ThemeToggle

Feature components:

- RegistrationForm
- DashboardClient
- RegistrantTable
- StatsCards
- WinnersClient
- WheelClient
- LuckyWheelCanvas

Wheel library choice:

| Option                  | Pros                                                               | Cons                                                    |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| `react-custom-roulette` | Fast to integrate                                                  | Older API surface and uncertain React 19 compatibility. |
| Winwheel.js             | Mature canvas wheel                                                | Non-React style integration.                            |
| Custom Canvas           | Full control, React 19 safe, smooth animation, low dependency risk | More code to maintain.                                  |

Chosen: custom Canvas.

## 8. Hooks

- `useRegistration` handles form submission state.
- `useRegistrants` centralizes list, import, reset, refresh, and counts.
- `useWinners` centralizes winner loading.
- `useToast` uses Zustand for global toast state.

## 9. Pages

| Route              | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `/`                | Registration.                                  |
| `/admin/dashboard` | Data table, import/export, reset, live counts. |
| `/admin/wheel`     | Lucky wheel.                                   |
| `/admin/winners`   | Winner list.                                   |
| `404`              | `app/not-found.tsx`.                           |
| Loading            | `app/loading.tsx`.                             |
| Error              | `app/error.tsx`.                               |

## 10. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
APPS_SCRIPT_SHARED_SECRET=replace-with-a-long-random-secret
```

Notes:

- Leave `NEXT_PUBLIC_API_URL` empty for same-origin `/api/*`.
- Do not put the Google Apps Script URL in client code.
- Use the same secret in Apps Script `API_SECRET`.

## 11. Deployment

Google Apps Script:

1. Create or open Google Sheet.
2. Extensions -> Apps Script.
3. Paste `google-apps-script/Code.gs`.
4. Project Settings -> Script Properties.
5. Add `API_SECRET`.
6. Add `SPREADSHEET_ID` if standalone.
7. Deploy -> New deployment.
8. Type: Web app.
9. Execute as: Me.
10. Who has access: Anyone with the link.
11. Copy the Web App URL.

Vercel:

1. Push project to GitHub.
2. Import repository in Vercel.
3. Add environment variables:
   - `GOOGLE_APPS_SCRIPT_URL`
   - `APPS_SCRIPT_SHARED_SECRET`
   - `NEXT_PUBLIC_API_URL` empty or your deployed origin if needed.
4. Build command: `pnpm build`.
5. Install command: `pnpm install`.
6. Deploy.

## 12. Troubleshooting

| Symptom                          | Cause                             | Fix                                                             |
| -------------------------------- | --------------------------------- | --------------------------------------------------------------- |
| `GOOGLE_APPS_SCRIPT_URL` missing | Env not set                       | Add it to `.env.local` or Vercel env.                           |
| `Unauthorized`                   | Secret mismatch                   | Match `APPS_SCRIPT_SHARED_SECRET` and Apps Script `API_SECRET`. |
| Empty data                       | Wrong Sheet or sheet name         | Check `SPREADSHEET_ID` and `Registrations` tab.                 |
| Duplicate registration           | Same normalized name exists       | Edit/delete row manually or reset database.                     |
| Apps Script timeout              | Sheet too large or import too big | Batch smaller files, move to Sheets API/DB when scale grows.    |
| Excel export large/slow          | `xlsx` is client-side             | Export filtered rows or move export to server.                  |

## 13. Security Checklist

- Server-side Apps Script secret enabled.
- Next.js proxy hides Apps Script URL/secret from browser.
- CSRF double-submit token on mutating API routes.
- Client and server validation with Zod.
- Apps Script validation repeats trust boundary checks.
- HTML/script markers rejected.
- SQL-like input rejected.
- Sheet formula injection escaped.
- Duplicate submit disabled in UI and checked on backend.
- Security headers configured in `next.config.ts`.
- Rate limit added in Apps Script with `CacheService`.
- No hardcoded secret or API URL in source.
- Vercel env values set per environment.

## 14. Performance Checklist

- App Router and Server Components where pages do not need client state.
- Client Components isolated to interactive features.
- Canvas wheel uses `requestAnimationFrame`.
- Excel export dynamically imports `xlsx`.
- Tables paginate before rendering.
- API calls use timeout and normalized error handling.
- Loading skeletons prevent layout jumps.
- Keep Google Sheet row count modest for Apps Script.

Google Apps Script and Sheets limits:

- Apps Script execution time is limited and can time out on large sheets.
- Spreadsheet reads/writes have daily quotas.
- `LockService` wait time is finite.
- `CacheService` is best-effort and not a durable rate limiter.
- Google Sheets is not ideal for very high write concurrency.

Scale path:

- Keep Apps Script while data is small.
- For larger events, move storage to Firestore, Postgres, Supabase, or a dedicated API.
- Keep Google Sheets as export/reporting only.

Backup and recovery:

- Enable Google Sheet version history.
- Export CSV before reset.
- Schedule Apps Script backup to copy the Sheet daily.
- Keep imported CSV files in a controlled drive folder.
- Recovery path: restore from version history or re-import latest CSV backup.

Logging and monitoring:

- Use Apps Script Executions dashboard for failures.
- Add `console.log` in Apps Script for request id/action during production incidents.
- Use Vercel Function logs for proxy errors.
- Add uptime monitoring against `/api/winners` or a dedicated `/api/health` route if needed.
- Track counts before and after each draw/export/reset.

## 15. Future Improvements

- Admin authentication with NextAuth/Auth.js or Vercel-protected routes.
- Dedicated `/api/health` route proxying Apps Script `health`.
- Audit log sheet for register/import/reset/draw actions.
- Server-side Excel export for very large datasets.
- QR code registration flow.
- Prize tiers and multiple wheels.
- Per-event namespace so one deployment can run multiple events.
- Move from Google Sheets to a transactional database when concurrency grows.

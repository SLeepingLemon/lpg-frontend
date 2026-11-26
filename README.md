# Smart LPG — Frontend

Web dashboard for **Smart LPG**, an ESP32-based LPG cylinder monitor (weight-based; no gas-leak sensor). It shows remaining gas, estimated days left, weight breakdown, cylinder status and details, daily usage, low-LPG alerts, alarm history, ESP32 online/offline health, in-website notifications and a user profile page.

## Current status

- ✅ Frontend only: React + Vite, fully routed, with auth screens and a dashboard
- ✅ Runs on **mock data** and **mock auth** — no backend or Firebase keys required
- ⏳ Backend (Node.js + Express), Firebase database and HiveMQ are **not built yet**; the frontend has placeholders ready for them

## Tech stack

| Area | Choice |
|---|---|
| UI | React 19, Vite 8, JavaScript (`.jsx`) |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`), Inter (via `@fontsource-variable/inter`), `lucide-react` icons |
| Auth | Firebase Auth (Email/Password + Google), with a mock fallback |
| Tests / lint | Vitest, oxlint |
| Hosting (planned) | Vercel |
| Planned backend | Node.js + Express, Firebase, HiveMQ (MQTT) |

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev                   # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |
| `npm test` | Run unit tests (calculations + validators) |

## Mock mode (no Firebase needed)

Mock auth is active when **either** `VITE_USE_MOCK_AUTH=true` **or** any required Firebase variable is missing. The browser console prints a warning when it is on, and the login page shows a "Demo mode" notice.

In mock mode:
- Any valid-looking email + password signs in. "Continue with Google" signs in as *Demo User*.
- "Remember me" keeps the session in `localStorage`; unchecked uses `sessionStorage` (ends when the tab closes).
- Dashboard data, device status and seed notifications always come from `src/mocks/lpgMockData.js` (via the services), regardless of auth mode.
- **Profiles** (name, username, phone, photo) and **notification read state** are saved in this browser's `localStorage` in both mock and Firebase mode until the backend exists.

## Features

| Feature | Where | Notes |
|---|---|---|
| Dashboard cards | `pages/Dashboard.jsx`, `components/dashboard/` | Refreshes every 30 s in the background; cached so returning to the page is instant |
| Cylinder details + drawing | `CylinderDetailsCard`, `CylinderIllustration` | Size / tare / install date come from the snapshot, so they update automatically when the backend reports a new cylinder. The drawing fills to the live % |
| Daily usage chart | `UsageChart` | kg/day bars for 7 / 14 / 30 days with the range average; hover or arrow keys for values; screen-reader table |
| Device health | `components/layout/DeviceHealthIndicator.jsx` | Online / Delayed / Offline from `lastSeenAt`; dropdown with device ID, last seen, send interval, uptime, firmware, IP |
| Notifications | `components/layout/NotificationBell.jsx`, `context/NotificationsContext.jsx` | Bell + unread count + mark read; a one-time "You have N new notifications" pop-up after login. Website only (no SMS/push) |
| Profile | `pages/Profile.jsx` (`/profile`) | Change photo (cropped to 256 px), full name, username (unique), mobile number. Email is read-only |

**Device thresholds:** set `EXPECTED_PUBLISH_INTERVAL_MINUTES` in `src/config/constants.js` once the ESP32 send interval is decided (placeholder: 5 min). "Delayed" = 2 missed sends, "Offline" = 3 missed sends.

## Environment variables

Copy `.env.example` → `.env.local`. **All `VITE_*` values are bundled into public JavaScript** — never put server secrets in them.

| Variable | Purpose |
|---|---|
| `VITE_USE_MOCK_AUTH` | `true` = mock auth, `false` = Firebase Auth |
| `VITE_FIREBASE_API_KEY` | Firebase web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | 〃 |
| `VITE_FIREBASE_PROJECT_ID` | 〃 |
| `VITE_FIREBASE_STORAGE_BUCKET` | 〃 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 〃 |
| `VITE_FIREBASE_APP_ID` | 〃 |
| `VITE_API_BASE_URL` | Base URL of the future Express API (e.g. `http://localhost:4000`) |
| `VITE_HIVEMQ_URL` | HiveMQ WebSocket URL (placeholder, unused) |
| `VITE_HIVEMQ_USERNAME` | 〃 |
| `VITE_HIVEMQ_PASSWORD` | 〃 — see security note in `src/services/mqttService.js` |
| `VITE_HIVEMQ_TOPIC` | 〃 |

## Connecting Firebase Auth

1. Create a project at <https://console.firebase.google.com> and add a **Web app**.
2. Copy the config values into `.env.local` and set `VITE_USE_MOCK_AUTH=false`.
3. **Authentication → Sign-in method**: enable **Email/Password** and **Google**.
4. **Authentication → Settings → Authorized domains**: make sure `localhost` is listed, and add your Vercel domain(s) (e.g. `smart-lpg.vercel.app` and any custom domain).
5. Restart `npm run dev` (Vite reads env vars only at startup).

## Deploying to Vercel

1. Push the project to GitHub and import it in Vercel (framework preset: **Vite**; build `npm run build`; output `dist`).
2. In **Project → Settings → Environment Variables**, add the same `VITE_*` variables.
3. Deploy. `vercel.json` rewrites all routes to `index.html`, so refreshing `/dashboard` works.
4. Add the Vercel domain to Firebase **Authorized domains** (step 4 above).

## Project structure

```
src/
  assets/                  optional login photo (login-cylinders.jpg|png|webp)
  components/
    auth/                  ProtectedRoute, PublicOnlyRoute, AuthLayout, FormField, PasswordField, GoogleButton
    common/                Button, Card, Avatar, StatusBadge, Toast, Spinner, ErrorState, EmptyState, Logo, statusConfig
    dashboard/             one component per dashboard card, UsageChart, CylinderIllustration, skeleton
    layout/                AppLayout (shared shell), AppHeader, DeviceHealthIndicator, NotificationBell
  config/                  firebase.js, constants.js (thresholds), routes.js
  context/                 AuthContext.jsx, NotificationsContext.jsx (providers)
  hooks/                   useAuth, useCylinderData, useDeviceStatus, useNotifications, usePolledResource, useDismiss, useNow
  mocks/                   lpgMockData.js — only imported by services
  pages/                   Dashboard, Profile, NotFound, auth/Login, auth/Register
  services/                authService (only Firebase caller), apiClient, lpgService, notificationService,
                           profileService, mqttService
  styles/                  index.css (Tailwind theme), tokens.css (CSS variables)
  utils/                   lpgCalculations (pure), validators, formatters, authErrors, imageUtils (+ tests)
```

**Rules of the road:** pages/components call **hooks/context only**; only `authService.js` touches Firebase; only services touch mock data; all derived numbers come from `utils/lpgCalculations.js`; thresholds live in `config/constants.js`.

## Data flow plan

```
ESP32 (load cell)
   │  MQTT publish  smartlpg/<deviceId>/readings  (+ heartbeat so lastSeenAt stays fresh)
   ▼
HiveMQ Cloud (broker)
   │  subscribe (server-side)
   ▼
Node.js + Express backend  ── verifies Firebase ID tokens, computes alarms + notifications,
   │                            detects cylinder replacement (weight jump) and updates capacity/tare
   │  writes
   ▼
Firebase (Firestore/RTDB: readings, alarms, user profiles)
   │  REST (apiClient) — later optionally SSE/WebSocket or Firestore listeners
   ▼
This frontend (polls every 30 s, pauses when tab hidden)
```

## Backend integration checklist

| Replace | Where | With |
|---|---|---|
| `getCylinderSnapshot()` | `src/services/lpgService.js` | `GET /api/cylinders/:id/latest` (incl. `capacityKg`, `tareWeightKg`, `installedAt`) |
| `getAlarmHistory()` | `src/services/lpgService.js` | `GET /api/cylinders/:id/alarms?limit=20` |
| `getUsageSummary()` | `src/services/lpgService.js` | `GET /api/cylinders/:id/usage?days=14` |
| `getUsageHistory()` | `src/services/lpgService.js` | `GET /api/cylinders/:id/usage/daily?days=30` |
| `getDeviceStatus()` | `src/services/lpgService.js` | `GET /api/devices/:id/status` |
| `getNotifications()` | `src/services/notificationService.js` | `GET /api/notifications?limit=50` |
| `markNotificationRead()` / `markAllNotificationsRead()` | `src/services/notificationService.js` | `PATCH /api/notifications/:id`, `POST /api/notifications/read-all` |
| `addNotification()` (mock only) | `src/services/notificationService.js` | delete — the backend creates notifications |
| `getProfile()` / `saveProfile()` / `updateProfile()` | `src/services/profileService.js` | `GET /api/users/me`, `POST /api/users`, `PATCH /api/users/me` (+ server-side username uniqueness) |
| Profile photo | `src/services/profileService.js` | `POST /api/users/me/photo` or Firebase Storage, store the URL instead of a data URL |
| *(new)* `acknowledgeAlarm()` | `src/services/lpgService.js` | `PATCH /api/alarms/:id` |
| Live readings (optional) | `src/services/mqttService.js` | prefer backend relay; direct MQTT only with read-only creds |

Keep the response shapes documented in `lpgService.js` (or adapt them there) and no component needs to change. Then delete `src/mocks/`.

The backend should verify the `Authorization: Bearer <Firebase ID token>` header that `apiClient.js` sends, using `firebase-admin`.

## Deviations from the design mockups

- **Email field added to Register.** Firebase email/password sign-up requires an email; the mockup had none.
- **"Continue with Google" button** added to Login (not in mockup) and replaces the small "Login using gmail" link on Register.
- **Visible field labels** added on Register (mockup used placeholders only) for accessibility.
- **Off-palette colours replaced**: the blue "ACCOUNT ACCESS" eyebrow and purple "Show" link now use brand red.
- **Cards are more solid** than the mockup's frosted glass, for text contrast.
- **"Sample Draft"** removed from footers → "© 2026 Smart LPG".
- **Cylinder photo** is optional: add `src/assets/login-cylinders.jpg` (or .png/.webp) and it is used automatically under a red overlay; otherwise the dark gradient is shown.
- **Status colours** (green/amber/red/grey) are separate from the brand red so "Critical" stands out; every status also has an icon and text.

## Known limitations

- All dashboard data is mock data; a single cylinder (`cyl-001`) and device (`esp32-lpg-01`) are assumed.
- Alarm acknowledgement is display-only (no action yet).
- Profiles, photos and notification read state live in the browser's `localStorage` until the backend exists: they don't sync across devices, and username uniqueness is only checked against accounts in the same browser.
- Users who sign in with Google have no username/phone until they fill them in on the Profile page.
- Notifications are website-only and update on the 30 s refresh (no push/SMS).
- No 2FA (see `TODO(2fa)` in `authService.js`).
- `npm audit` reports advisories in `@grpc/grpc-js`, a transitive dependency of Firebase's server-side Firestore code. It is not included in the browser bundle (only Firebase Auth is imported); the suggested `--force` fix would downgrade Firebase to v9, so it is intentionally not applied.

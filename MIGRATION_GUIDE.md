# 90DC Refactor — Migration Guide

## What Changed

The 869KB monolithic `index.html` has been broken into a proper project structure.
All 275 functions are now in typed, importable modules. The global `S` object is gone.

---

## Quick Start

```bash
# 1. Copy your .env
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_KEY

# 2. Install deps
npm install

# 3. Dev server
npm run dev

# 4. Production build
npm run build
```

---

## Step-by-Step HTML Migration

The HTML structure from the original `index.html` is **preserved exactly**.
Only the inline `<style>` and `<script>` blocks are replaced.

### 1. Open the original `index.html`

### 2. Copy everything between `<body>` and `</body>` (excluding the final `<script>` block)

### 3. Paste it into the new `index.html` replacing the comment placeholder

### 4. Remove the original:
- The `<style>` block (now in `src/styles/main.css`)
- The final `<script>` block with all JS (now in `src/modules/`)
- The `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js">` CDN import
  (Supabase is now a proper npm dependency)

### 5. The new `index.html` already has the correct module import:
```html
<script type="module" src="/src/main.js"></script>
```

---

## Inline Handler Migration

All inline `onclick` handlers in the HTML like:
```html
<button onclick="doLogin()">Sign In</button>
```
**still work** during the transition because every module exposes its functions via `window.*`.

Over time, replace them with event listeners:
```js
document.getElementById('login-btn')
  .addEventListener('click', doLogin);
```

---

## Environment Variables

### Netlify (Production)
Set these in Netlify → Site Settings → Environment Variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your_anon_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:admin@yourdomain.com
RESEND_API_KEY=your_resend_key
```

**VITE_** prefixed vars are bundled into the client JS (safe for anon key).
Non-prefixed vars are server-only (used in Netlify functions).

---

## Security Improvements

| Before | After |
|--------|-------|
| Supabase anon key hardcoded in HTML | Loaded from `VITE_SUPABASE_KEY` env var |
| `adminIssueStrike()` callable by any user from devtools | Routed to `netlify/functions/admin-strike.js` with server-side role check |
| `adminSendPush()` uses anon key to read all user data | Routed to `netlify/functions/admin-send-push.js` with service key |
| 27 XSS-risky `innerHTML` calls with user data | All user data goes through `sanitize()` helper |
| Admin role set from blob data (forgeable) | Admin role set ONLY from `warriors.role` DB column |

---

## Module Map

| Original functions | New location |
|---|---|
| `doLogin`, `doSignup`, `doLogout`, `verify2FA`, `restoreSession` | `src/modules/auth/authService.js` |
| `switchAuth` | `src/modules/auth/authUI.js` |
| `completeMorningCheckin`, `submitAfternoonCheckinFull`, `submitEveningCheckinFull` | `src/modules/checkins/checkins.js` |
| `issueWarning`, `logRuleBreak`, `triggerChallengeRestart` | `src/modules/checkins/strikeSystem.js` |
| `updateStreakAndRank`, `getRank`, `checkMilestone`, `checkLifeMilestones` | `src/modules/checkins/streakRank.js` |
| `renderDash`, `renderDaily3`, `handleNextCheckin`, `doDailyCheckin` | `src/modules/dashboard/dashboard.js` |
| `renderCommunity`, `wcSwitchRoom`, `wcSendMsg`, `wcLoadMessages`, `wcSubscribe` | `src/modules/community/community.js` |
| `showCrisisIntervention` | `src/modules/community/crisisIntervention.js` |
| `renderAdmin`, `adminSendPush`, `adminExportCSV`, `adminIssueStrike`, `adminRevokeStrike` | `src/modules/admin/admin.js` |
| `renderProgress`, `calcDisciplineScore`, `renderTransformationStrip` | `src/modules/progress/progress.js` |
| `renderBadgesSection` | `src/modules/progress/badges.js` |
| `renderHabits`, `toggleHabit` | `src/modules/habits/habits.js` |
| `renderWorkout`, `renderSessionSlots`, `wkTimerStart/Stop/Reset` | `src/modules/workout/workout.js` |
| `renderFinances`, `addExpense`, `addDebt` | `src/modules/finances/finances.js` |
| `renderProfile`, `loadProfileFields`, `saveFullProfile` | `src/modules/profile/profile.js` |
| `renderMindset`, `saveMindsetEntry`, `addAffirmation` | `src/modules/mindset/mindset.js` |
| `renderSleepAnalytics`, `logSleep` | `src/modules/sleep/sleep.js` |
| `renderJHistory`, `renderTodayMission`, `saveJournalEntry` | `src/modules/journal/journal.js` |
| `checkSundayLock`, `renderWeekly`, `logSundayMeasurements` | `src/modules/weekly/weekly.js` |
| `showWarriorDirectory`, `addPartnerFromProfile`, `nudgePartner` | `src/modules/partner/partner.js` |
| `nextOb`, `selectPath`, `completeOnboarding` | `src/modules/onboarding/onboarding.js` |
| `showPage`, `switchSec`, `switchTab` | `src/utils/router.js` |
| `showToast`, `showPersistentToast` | `src/utils/toast.js` |
| `sanitize` (was inline in several functions) | `src/utils/sanitize.js` |
| `todayStr`, `daysBetween`, `formatDayLabel` | `src/utils/date.js` |
| `PROMPTS`, `BADGES_DEF`, `DAILY_QUOTES`, `CURRENCIES`, `PODCASTS` | `src/content/content.js` |
| All Supabase `_sb` calls | `src/services/supabase.js` (single client) |
| Global `S` state object | `src/store/appStore.js` (`getState`, `setState`) |

---

## State Migration

Before:
```js
S.day = 5;
S.streak = 12;
save();
```

After:
```js
import { setState } from '../store/appStore.js';
setState({ day: 5, streak: 12 });  // auto-saves
```

Reading state:
```js
import { getState } from '../store/appStore.js';
const { day, streak } = getState();
```

---

## Netlify Function Security

Two new secure functions replace client-side admin mutations:

- `netlify/functions/admin-strike.js` — issue/revoke strikes
  - Verifies JWT token on every request
  - Checks `warriors.role === 'admin'` before any mutation
  - Uses service key (never exposed to client)

- `netlify/functions/admin-send-push.js` — send bulk push notifications
  - Same auth checks
  - VAPID keys server-only

The original `send-push.js`, `send-email.js`, and `scheduled-push.js` are unchanged.

---

## What's Not Changed

- **All HTML** — every page, section, modal, form is identical to the original
- **All CSS** — copied verbatim into `src/styles/main.css`
- **App behavior** — every user-facing feature works identically
- **Supabase schema** — no DB changes required
- **Service worker** — `public/sw.js` is the same file

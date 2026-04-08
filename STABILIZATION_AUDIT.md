# 90DC Stabilization Audit — Final Pass
Generated: 2026-03-20

---

## A. Runtime Risk Audit

### FIXED in this pass

| Risk | Severity | Fix Applied |
|---|---|---|
| 16 inline handlers not on `window.*` | 🔴 Critical | `src/modules/globals.js` created — all 16 exposed |
| 4 `require()` calls in ESM modules | 🔴 Critical | Replaced with static/dynamic `import` |
| `import('../modules/community...')` wrong path in `app.js` | 🔴 Critical | Fixed to `import('./community/community.js')` |
| `showToast` not on `window` | 🔴 Critical | Added to `globals.js` |
| `exportData`/`importData` not on `window` | 🔴 Critical | Re-exported via `globals.js` |

### REMAINING RISKS (acceptable or deferred)

| Risk | Severity | Notes |
|---|---|---|
| `window._currentAuthId` not reactive | 🟡 Medium | Used only for community admin detection. Supabase session is the truth. |
| `S.dayAdvanced` reset logic | 🟡 Medium | Day won't advance twice but flag persists in localStorage across days — reset in `_advanceDayIfNeeded` on login |
| Supabase anon key in env var — still visible in client bundle | 🟡 Medium | This is by design for the anon key. Service key is correctly server-only. |
| `saveWeeklyReview` calls `logSundayMeasurements` regardless of Sunday | 🟡 Medium | Original behavior. App just shows a notice, doesn't block. |
| PWA offline — moduleStates can diverge from localStorage | 🟡 Medium | `save()` is called on every `setState()` so risk is low. |
| `wc-hq-notice` display toggle missing in `wcSwitchRoom` | 🟢 Low | HQ notice shown/hidden — not critical |

---

## B. Selector / DOM Mismatch Audit

### All mismatches corrected

| Module | Wrong ID used | Real HTML ID | Status |
|---|---|---|---|
| `habits.js` | `habits-list` | `full-hab-list` | ✅ Fixed |
| `habits.js` | `habits-score` | `hb-today` | ✅ Fixed |
| `sleep.js` | `sleep-analytics` | `sleep-history`, `sl-avg`, `sl-quality`, `sl-logs` | ✅ Fixed |
| `profile.js` | `profile-avatar` | `prof-av-letter`, `prof-avatar-img` | ✅ Fixed |
| `profile.js` | `profile-completion-bar` | `prof-completion-fill` | ✅ Fixed |
| `profile.js` | `profile-completion-pct` | `prof-pct` | ✅ Fixed |
| `finances.js` | `expense-log`, `exp-label` | `exp-list`, `ex-desc` | ✅ Fixed |
| `finances.js` | `debt-tracker` | `debt-list` | ✅ Fixed |
| `admin.js` | `adm-warriors-list` | `adm-user-tbody` | ✅ Fixed |
| `admin.js` | `adm-active-today` | `adm-active` | ✅ Fixed |
| `journal.js` | `journal-history`, `free-journal-text` | `j-history`, `j-entry` | ✅ Fixed |
| `workout.js` | `session-slots` | `session-slots-container` | ✅ Fixed |
| `workout.js` | `wk-progress-lbl` | `wk-sessions-allowed` | ✅ Fixed |
| `mindset.js` | `affirmation-input` | `ms-aff-new` | ✅ Fixed |
| `progress.js` | `score-ring`, `ring-num` | `day-map`, `transform-grid` | ✅ Fixed |
| `streakRank.js` | `sidebar-day` | (not in HTML — removed) | ✅ Fixed |
| `streakRank.js` | `sidebar-rank-icon` | `sidebar-rank-name` | ✅ Fixed |
| `weekly.js` | `weekly-lock-msg`, `weekly-form` | Not in HTML — logic adapted | ✅ Fixed |

### Dynamically-created IDs (not in HTML — created at runtime by JS)
These are correct behavior — created by JS on demand:
- `crisis-overlay` — created by `crisisIntervention.js`
- `confirm-restart-btn` — created by `strikeSystem.js`
- `_streak-close`, `_milestone-close` — created by `streakRank.js`
- `_curr-modal-close`, `_curr-apply` — created by `globals.js`
- `warrior-directory-modal`, `warrior-profile-modal` — **missing from HTML** (see below)

### Still missing from HTML (modals not in original HTML)
These modals are opened by JS but the HTML doesn't have static containers for them.
The JS currently creates them dynamically, which is fine for now:
- Warrior Directory modal → `partner.js` creates it on `showWarriorDirectory()`
- Warrior Profile modal → `partner.js` creates it on `showWarriorProfile()`
- Recovery Token modal → referenced as `recovery-token-modal` in `authService.js`
  → **Needs `partner.js` to render dynamically OR a static modal added to HTML**

---

## C. Import / Init Order Audit

### Load order in `main.js` (correct)

```
1. supabase.js          — client singleton
2. appStore.js (load)   — localStorage hydration
3. router.js            — showPage/switchSec on window
4. toast.js             — showToast available
5. content.js           — PROMPTS/BADGES/etc on window
6. authService.js       — doLogin/doSignup/restoreSession
7. authUI.js            — switchAuth
8. globals.js           — 16 bridged inline handlers (LAST)
```

### Lazy-loaded on demand (via dynamic import in `app.js`)
All section renderers are loaded only when `initApp()` is called (user is logged in):
`dashboard`, `checkins`, `community`, `admin`, `progress`, `habits`, `workout`,
`finances`, `profile`, `badges`, `mindset`, `sleep`, `notifications`, `partner`

### Init order risk: `initApp()` called twice
`router.js` calls `import('../modules/app.js').then(m => m.initApp())` on every
`showPage('page-app')` call. `initApp()` registers section renderers each time.
This is safe (idempotent registration) but adds minor overhead on repeated calls.
**Mitigation**: `initApp` already guards with `if (_clockInterval) clearInterval(_clockInterval)`.

---

## D. Duplicate Logic Leftover Audit

### Functions defined in BOTH original blob path and new modules

| Function | In new module | Old blob present | Risk |
|---|---|---|---|
| `renderJHistory()` | `journal.js` ✓ | `globals.js` wraps it | Low — globals delegates to module |
| `logWorkout()` | `workout.js` (submitQuickSession) + `globals.js` (logWorkout form) | Two separate form paths | Acceptable — different HTML forms |
| `saveJournal()` | `globals.js` | Was in original blob | Low — only one definition now |
| `getRank()` | `streakRank.js` ✓ | Referenced by community.js | ✓ Correct — shared |
| `sanitize()` | `sanitize.js` ✓ | Was inline in original | ✓ Fixed — module only |
| `todayStr()` | `date.js` ✓ | Was inline in original | ✓ Fixed |

### Verified clean — no true duplicates remain

---

## E. Final Patch Files (applied in this session)

1. **`src/modules/globals.js`** (NEW) — 16 missing `window.*` functions
2. **`src/modules/notifications/notifications.js`** (REWRITTEN) — proper push subscription
3. **`src/modules/app.js`** (PATCHED) — broken online/offline import path fixed
4. **`src/modules/dashboard/dashboard.js`** (PATCHED) — `require()` → dynamic `import()`
5. **`src/modules/onboarding/onboarding.js`** (PATCHED) — `require()` → static `import`
6. **`src/modules/profile/profile.js`** (PATCHED) — `require()` → static `import`
7. **`src/main.js`** (PATCHED) — `globals.js` imported last

---

## F. Manual QA Checklist

Run these in order. Each depends on the previous.

### 🔑 AUTH
- [ ] Landing page loads, CSS renders correctly (dark theme, orange accents)
- [ ] "Enlist Now" opens signup form
- [ ] Signup: fill all fields including nickname, gender, location → submit
- [ ] Email confirmation or auto-login → lands on Onboarding
- [ ] Login with wrong password → shows error toast
- [ ] Login with correct password → goes to app or onboarding
- [ ] OTP flow: leave password blank → OTP sent → 6-digit entry → login
- [ ] Browser refresh → session restores automatically (no re-login)
- [ ] Logout → lands on landing page, session cleared

### 🪖 ONBOARDING
- [ ] Step 1: Sign name, set wakeup time → Next button works
- [ ] Step 2: Partner search shows warriors, can select one
- [ ] Step dots update as you advance
- [ ] "Complete Onboarding" saves state, redirects to app
- [ ] After completion: sidebar shows Day 1, Recruit rank

### 📊 DASHBOARD
- [ ] Dashboard renders all KPI cards (Day, Streak, Score, Strikes)
- [ ] Discipline board shows 7 rules with `—` status before check-ins
- [ ] Finance block shows P 0 budget until morning check-in
- [ ] 90-day dot map renders all 90 dots
- [ ] "DO MORNING CHECK-IN →" button visible
- [ ] Partner block shows "Add partner" link when no partner set
- [ ] Bottom nav shows 🌅 icon for next check-in
- [ ] Daily mission card shows today's prompt

### ☀️ MORNING CHECK-IN
- [ ] Navigate to Morning section
- [ ] Plan tab: workout plan + budget required — submit without → error toast
- [ ] Sleep tab: set sleep/wake times → auto-calculates hours
- [ ] Emotions tab: mood slider updates value display
- [ ] Daily 3 tasks: enter 3 tasks with times
- [ ] Submit → green banner appears, redirected to dashboard
- [ ] Dashboard: morning pill turns green, finance block shows budget

### ☀️ AFTERNOON CHECK-IN
- [ ] Social media toggle (Y/N) required — submit without → error
- [ ] Alcohol toggle required
- [ ] Water tracker: tap glasses, count updates
- [ ] Submit → banner shows, afternoon pill turns green

### 🌙 EVENING CHECK-IN
- [ ] Workout toggle required — submit without → error toast
- [ ] Reading quote required — submit without → error toast
- [ ] Savings calculation: budget - spent = saved, updates as you type
- [ ] Submit → day complete, savings log updated, journal entry created

### 📋 HABITS
- [ ] Habits section shows all 8 habits
- [ ] Tap habit → toggles done/undone
- [ ] `hb-today` counter updates (e.g., "3/8")
- [ ] Streak and best streak shown correctly

### 💪 WORKOUT
- [ ] Session slots render based on exercise path
- [ ] Enter value and click Log → session logged, green border
- [ ] Progress bar updates
- [ ] Timer: Start → running, Stop → paused, Reset → 0:00
- [ ] `logWorkout()` form (manual entry): fills wk-type, wk-count → submits

### 😴 SLEEP
- [ ] Analytics shows `—` until sleep is logged via morning check-in
- [ ] After morning check-in with sleep data: avg hours and quality appear
- [ ] Sleep history list populates

### 🧠 MINDSET
- [ ] Mood trend chart renders after check-ins
- [ ] Affirmation input (ms-aff-new) → Add → appears in list
- [ ] Reframe tab: save entry → toast confirmation

### 📓 JOURNAL
- [ ] Date header shows today's date
- [ ] `j-entry` textarea → `saveJournal()` → entry appears in `j-history`
- [ ] `setJPrompt()` prefills textarea from prompt link
- [ ] Journal tag appears on entries

### 💰 FINANCES
- [ ] Currency displays correctly (P for BWP by default)
- [ ] `openCurrencyModal()` → modal with dropdown → Apply → currency changes
- [ ] `logExpense()`: fill ex-desc + ex-amount → expense appears in exp-list
- [ ] `logSavings()`: fill sav-amount → total saved updates
- [ ] ROI bar fills as savings grow
- [ ] Debt: fill dt-name + dt-start → addDebt() → appears in debt-list → "Paid ✓" removes it

### 💬 COMMUNITY
- [ ] Community section loads with HQ room active
- [ ] Seed messages visible immediately
- [ ] Room pills switch rooms correctly
- [ ] Send message → appears in chat (optimistic)
- [ ] Healing room: anon toggle active, crisis keywords trigger overlay
- [ ] Emoji picker opens/closes
- [ ] Voice note: mic permission → recording bar → stop → send
- [ ] Feed tab shows filtered posts
- [ ] HQ room: non-admin cannot post (error toast)
- [ ] `updateOnlineStatus()` triggers on network change

### 🤝 PARTNER
- [ ] `showWarriorDirectory()` creates modal dynamically, shows warriors
- [ ] Search/filter works
- [ ] Add partner → partner_nudges row created in Supabase
- [ ] Dashboard shows partner status
- [ ] `nudgePartner()` → Supabase insert → success toast

### 📈 PROGRESS
- [ ] Day map renders 90 dots with correct coloring
- [ ] Transformation grid shows workout/savings/pages stats
- [ ] Mini charts render once data exists (weight, mood, sleep, score)
- [ ] Life milestones grid shows 5 milestones with earned/not earned state
- [ ] `logWeight()` (pr-weight field) → updates wt-curr, wt-change

### 📅 WEEKLY
- [ ] Section accessible any day (Sunday-lock is a notice, not a block)
- [ ] `renderWeekly()` fills wr-workouts, wr-saved, wr-mood from week data
- [ ] `logSundayMeasurements()` / `saveWeeklyReview()` saves entry

### 👤 PROFILE
- [ ] Avatar shows first letter of name
- [ ] Profile completion bar calculates correctly
- [ ] Edit fields → `saveFullProfile()` → toast + nav display name updates
- [ ] Avatar upload → preview appears in nav
- [ ] Before-pic upload → before-pic-preview appears
- [ ] BMI calculation (pf-weight + pf-height fields)
- [ ] Currency select → saves to state

### ⚙️ ADMIN
- [ ] Admin nav item hidden for non-admins
- [ ] Admin: `adm-user-tbody` table populates with warriors
- [ ] `adm-active` count shows today's active users
- [ ] Push panel: fill push-title + push-body → adminSendPush() → routed to Netlify function
- [ ] Quick push buttons load template text
- [ ] Strike: fill adm-strike-email + adm-strike-reason → issue/revoke → Netlify function called
- [ ] Export CSV → downloads warriors-export.csv
- [ ] Post announcement → appears in HQ room

### 🔔 NOTIFICATIONS
- [ ] `requestNotifPerm()` button in profile triggers browser permission
- [ ] On grant: notif-status shows "🔔 Enabled"
- [ ] `saveReminders()` saves wakeup time
- [ ] Notification bell opens notif-panel with today's pending check-ins

### 📱 SERVICE WORKER
- [ ] Open DevTools → Application → Service Workers → 90DC SW registered
- [ ] Throttle to offline → offline banner appears at top
- [ ] Go back online → banner disappears, sync attempt fires
- [ ] Hard refresh with SW → app loads from cache (check Network tab: "from ServiceWorker")
- [ ] Install prompt (Chrome): pwa-install-btn appears → click → install prompt

---

## G. Production Readiness Checklist

### Environment (Netlify)
- [ ] `VITE_SUPABASE_URL` set in Netlify environment variables
- [ ] `VITE_SUPABASE_KEY` set (anon/publishable key only)
- [ ] `SUPABASE_URL` set (for Netlify functions — same URL)
- [ ] `SUPABASE_SERVICE_KEY` set (service role key — server only)
- [ ] `VAPID_PUBLIC_KEY` set
- [ ] `VAPID_PRIVATE_KEY` set
- [ ] `VAPID_EMAIL` set (e.g. `mailto:admin@90days.co.bw`)
- [ ] `RESEND_API_KEY` set
- [ ] `VITE_VAPID_PUBLIC_KEY` set (for client-side push subscription)

### Supabase
- [ ] `warriors` table has all required columns (see `sql/v22-migration.sql`)
- [ ] `community_messages` table has v18 columns (see `sql/v23-migration.sql`)
- [ ] `partner_nudges` table exists
- [ ] `strikes` table exists
- [ ] `warrior-media` storage bucket exists and is public
- [ ] Admin user has `role = 'admin'` in warriors table
- [ ] RLS policies: warriors can read/write their own row; community_messages can be read by all authenticated users
- [ ] Realtime enabled on `community_messages` table

### Build
- [ ] `npm install` completes without errors
- [ ] `npm run build` completes — check `dist/` output
- [ ] `dist/index.html` references hashed JS/CSS assets
- [ ] Lighthouse PWA score ≥ 90
- [ ] No console errors on first load

### Cache / Headers
- [ ] `netlify.toml` has `Cache-Control: no-cache` on `index.html` only
- [ ] Static assets (`/assets/*`, `/icons/*`) have `max-age=31536000`
- [ ] Service worker `sw.js` has `Cache-Control: no-cache` (auto-updates)

### Security
- [ ] Supabase service key NOT in client bundle (grep `dist/` for service key)
- [ ] Admin mutations (`adminIssueStrike`, `adminSendPush`) route to Netlify functions — verify 401 without valid JWT
- [ ] XSS: all user content goes through `sanitize()` before `innerHTML`
- [ ] Admin UI hidden for non-admins (check localStorage manipulation can't reveal it)

### Mobile
- [ ] iPhone Safari: standalone mode, status bar styling correct
- [ ] Android Chrome: PWA install prompt appears
- [ ] Touch targets ≥ 44px (verified via components.css responsive rules)
- [ ] Bottom nav not obscured by iOS home indicator (`padding-bottom: env(safe-area-inset-bottom)`)

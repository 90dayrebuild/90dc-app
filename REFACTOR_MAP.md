# 90DC v2 — Function-to-File Mapping

## A. New Folder Structure

```
90-days-challenge/
├── index.html                          # Shell HTML (kept minimal — no JS/CSS blobs)
├── package.json
├── vite.config.js
├── netlify.toml
├── .env.example
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   ├── manifest.json
│   ├── sw.js
│   └── content/                        # ← Static JSON (fetched at runtime, cached by SW)
│       ├── prompts.json
│       ├── badges.json
│       ├── quotes.json
│       └── podcasts.json
├── src/
│   ├── main.js                         # Entry point — boots all modules
│   ├── services/
│   │   └── supabase.js                 # Single Supabase client (key from env)
│   ├── store/
│   │   └── appStore.js                 # Reactive state store (replaces global S)
│   ├── utils/
│   │   ├── sanitize.js                 # XSS protection — sanitize(), esc(), setText()
│   │   ├── toast.js                    # showToast(), showPersistentToast()
│   │   ├── date.js                     # todayStr(), daysBetween(), formatDayLabel()
│   │   ├── router.js                   # showPage(), switchSec(), switchTab()
│   │   └── ui.js                       # setLogoImages(), toggleMobileMore(), updateMV()
│   ├── content/
│   │   ├── contentLoader.js            # Loads JSON content once, caches in memory
│   │   ├── prompts.json
│   │   ├── badges.json
│   │   └── quotes.json
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── authService.js          # doLogin, doSignup, doLogout, verify2FA, restoreSession
│   │   │   └── authUI.js               # switchAuth(), initAuthListeners()
│   │   ├── onboarding/
│   │   │   └── onboarding.js           # nextOb, selectPath, completeOnboarding, partner search
│   │   ├── checkins/
│   │   │   └── checkins.js             # Morning/afternoon/evening check-ins, habits, tasks
│   │   ├── progress/
│   │   │   └── progress.js             # getRank, streak, score, milestones, leaderboard
│   │   ├── community/
│   │   │   └── community.js            # Warrior Center — chat, feed, voice, images, realtime
│   │   ├── profile/
│   │   │   └── profile.js              # Profile fields, avatar, BMI, partner, directory
│   │   ├── admin/
│   │   │   └── admin.js                # Admin UI (reads only) + proxied mutations
│   │   ├── workout/
│   │   │   └── workout.js              # Workout logging, session slots, weekly tracking
│   │   ├── finances/
│   │   │   └── finances.js             # Expenses, savings, debts, ROI
│   │   ├── mindset/
│   │   │   └── mindset.js              # Affirmations, mindset entries, journal
│   │   ├── notifications/
│   │   │   └── notifications.js        # Push sub, in-app reminders, VAPID
│   │   ├── badges/
│   │   │   └── badges.js               # Badge rendering, unlock check
│   │   └── dashboard/
│   │       └── dashboard.js            # renderDash, today mission, getting-started
│   └── styles/
│       ├── main.css                    # Design tokens, reset, utilities, components
│       ├── community.css               # Warrior Center specific styles
│       └── admin.css                   # Admin panel styles
└── netlify/
    └── functions/
        ├── admin-strike.js             # ← NEW: secure strike issue/revoke
        ├── admin-send-push.js          # ← NEW: secure broadcast push
        ├── admin-announce.js           # ← NEW: secure HQ announcement
        ├── scheduled-push.js           # Existing: hourly cron push
        ├── send-email.js               # Existing: welcome/transactional email
        └── send-push.js                # Existing: individual push
```

---

## B. Function-to-File Mapping

### Auth (`src/modules/auth/`)
| Function | File |
|---|---|
| `doLogin` | `authService.js` |
| `doSignup` | `authService.js` |
| `doLogout` | `authService.js` |
| `verify2FA` | `authService.js` |
| `tfaNext` | `authService.js` |
| `restoreSession` | `authService.js` |
| `canUseRecoveryToken` | `authService.js` |
| `useRecoveryToken` | `authService.js` |
| `showRecoveryTokenPrompt` | `authService.js` |
| `switchAuth` | `authUI.js` |
| `initAuthListeners` | `authUI.js` |

### Store (`src/store/`)
| Function | File |
|---|---|
| `getState` | `appStore.js` |
| `setState` | `appStore.js` |
| `subscribe` | `appStore.js` |
| `save` | `appStore.js` |
| `saveNow` | `appStore.js` |
| `load` | `appStore.js` |
| `syncToSupabase` | `appStore.js` |
| `loadFromSupabase` | `appStore.js` |
| `exportData` | `appStore.js` |
| `importData` | `appStore.js` |
| `_saveLocal` | `appStore.js` (private) |

### Routing (`src/utils/router.js`)
| Function | File |
|---|---|
| `showPage` | `router.js` |
| `switchSec` | `router.js` |
| `switchTab` | `router.js` |
| `scrollTo2` | `router.js` |
| `registerSection` | `router.js` |

### Check-ins (`src/modules/checkins/`)
| Function | File |
|---|---|
| `completeMorningCheckin` | `checkins.js` |
| `renderMorning` | `checkins.js` |
| `checkMorningMood` | `checkins.js` |
| `updateMorningWakeDisplay` | `checkins.js` |
| `showAfternoonCheckin` | `checkins.js` |
| `acToggle` | `checkins.js` |
| `submitAfternoonCheckinFull` | `checkins.js` |
| `showEveningCheckin` | `checkins.js` |
| `ecToggle` | `checkins.js` |
| `updateEveSavings` | `checkins.js` |
| `submitEveningCheckinFull` | `checkins.js` |
| `doDailyCheckin` | `checkins.js` |
| `confirmCheckin` | `checkins.js` |
| `toggleTask` | `checkins.js` |
| `toggleAddTaskForm` | `checkins.js` |
| `addInlineTask` | `checkins.js` |
| `renderDaily3` | `checkins.js` |
| `renderDashHabits` | `checkins.js` |
| `toggleHabit` | `checkins.js` |
| `initWaterTracker` | `checkins.js` |
| `toggleWater` | `checkins.js` |
| `issueWarning` | `checkins.js` |
| `logRuleBreak` | `checkins.js` |
| `triggerChallengeRestart` | `checkins.js` |
| `confirmChallengeRestart` | `checkins.js` |
| `checkDangerZone` | `checkins.js` |
| `showCrisisModal` | `checkins.js` |
| `getDailyQuote` | `checkins.js` |
| `renderDailyQuote` | `checkins.js` |

### Progress (`src/modules/progress/`)
| Function | File |
|---|---|
| `getRank` | `progress.js` |
| `getWarriorRank` | `progress.js` |
| `calcDisciplineScore` | `progress.js` |
| `getScoreLabel` | `progress.js` |
| `updateDisciplineScore` | `progress.js` |
| `updateRing` | `progress.js` |
| `updateStreakAndRank` | `progress.js` |
| `updateSidebarRank` | `progress.js` |
| `checkMilestone` | `progress.js` |
| `showMilestoneOverlay` | `progress.js` |
| `showStreakMilestone` | `progress.js` |
| `shareStreakMilestone` | `progress.js` |
| `advanceDayIfNeeded` | `progress.js` |
| `showReturnFlow` | `progress.js` |
| `commitReturn` | `progress.js` |
| `useStreakFreeze` | `progress.js` |
| `checkLifeMilestones` | `progress.js` |
| `showLifeMilestoneOverlay` | `progress.js` |
| `shareLifeMilestone` | `progress.js` |
| `loadLeaderboard` | `progress.js` |
| `renderStreakCalendar` | `progress.js` |
| `checkROI` | `progress.js` |
| `showRoiModal` | `progress.js` |
| `renderScoreChart` | `progress.js` |
| `miniChart` | `progress.js` |
| `renderProgress` | `progress.js` |
| `getStreakMultiplier` | `progress.js` |

### Community (`src/modules/community/`)
| Function | File |
|---|---|
| `renderCommunity` | `community.js` |
| `wcSwitchRoom` | `community.js` |
| `wcSwitchView` | `community.js` |
| `wcLoadMessages` | `community.js` |
| `wcLoadMore` | `community.js` |
| `wcSubscribe` | `community.js` |
| `wcRenderMessages` | `community.js` |
| `wcAppendMessage` | `community.js` |
| `wcSendMsg` | `community.js` |
| `wcToggleRecording` | `community.js` |
| `wcStartRecording` | `community.js` |
| `wcStopRecording` | `community.js` |
| `wcCancelRecording` | `community.js` |
| `wcFmtDur` | `community.js` |
| `wcPlayAudio` | `community.js` |
| `wcTriggerImage` | `community.js` |
| `wcHandleImage` | `community.js` |
| `wcClearImage` | `community.js` |
| `wcViewImage` | `community.js` |
| `wcToggleEmoji` | `community.js` |
| `wcInsertEmoji` | `community.js` |
| `wcCycleCat` | `community.js` |
| `wcReact` | `community.js` |
| `wcSetReply` | `community.js` |
| `wcClearReply` | `community.js` |
| `wcDeleteMsg` | `community.js` |
| `wcLoadPartners` | `community.js` |
| `wcRenderOppLock` | `community.js` |
| `wcLoadFeed` | `community.js` |
| `wcFilterFeed` | `community.js` |
| `wcRenderFeed` | `community.js` |

### Profile (`src/modules/profile/`)
| Function | File |
|---|---|
| `renderProfile` | `profile.js` |
| `loadProfileFields` | `profile.js` |
| `calcProfileCompletion` | `profile.js` |
| `saveProfileField` | `profile.js` |
| `saveFullProfile` | `profile.js` |
| `handleAvatarUpload` | `profile.js` |
| `handleBeforePic` | `profile.js` |
| `calcBMI` | `profile.js` |
| `showPartnerModal` | `profile.js` |
| `savePartner` | `profile.js` |
| `removePartner` | `profile.js` |
| `addAccountabilityPartner` | `profile.js` |
| `showWarriorDirectory` | `profile.js` |
| `renderDirectory` | `profile.js` |
| `filterDirectory` | `profile.js` |
| `showWarriorProfile` | `profile.js` |
| `addPartnerFromProfile` | `profile.js` |
| `nudgePartner` | `profile.js` |
| `checkIncomingNudges` | `profile.js` |
| `setCurrency` | `profile.js` |
| `fetchPartnerStatus` | `profile.js` |

### Admin (`src/modules/admin/` + `netlify/functions/`)
| Function | Client/Server |
|---|---|
| `renderAdmin` | `admin.js` (client read-only) |
| `adminExportCSV` | `admin.js` (client read-only) |
| `adminQuickPush` | `admin.js` (UI only — loads form) |
| `adminSendPush` | `admin.js` → `netlify/functions/admin-send-push.js` |
| `adminIssueStrike` | `admin.js` → `netlify/functions/admin-strike.js` |
| `adminRevokeStrike` | `admin.js` → `netlify/functions/admin-strike.js` |
| `postAnnouncement` | `admin.js` → `netlify/functions/admin-announce.js` |
| `adminFixMissingRows` | `admin.js` (client diagnostics) |

### Onboarding (`src/modules/onboarding/`)
| Function | File |
|---|---|
| `nextOb` | `onboarding.js` |
| `selectPath` | `onboarding.js` |
| `completeOnboarding` | `onboarding.js` |
| `searchWarriorsForPartner` | `onboarding.js` |
| `selectObPartner` | `onboarding.js` |
| `clearObPartner` | `onboarding.js` |
| `completeOnboardingWithPartner` | `onboarding.js` |

### Utils
| Function | File |
|---|---|
| `sanitize`, `esc`, `setText`, `setHTML` | `utils/sanitize.js` |
| `showToast`, `showPersistentToast`, `dismissToast` | `utils/toast.js` |
| `todayStr`, `daysBetween`, `formatDayLabel`, `fmtDuration` | `utils/date.js` |
| `showPage`, `switchSec`, `switchTab`, `scrollTo2` | `utils/router.js` |
| `setLogoImages`, `animateCounterEl`, `toggleMobileMore`, `toggleFaq` | `utils/ui.js` |

### Content
| Constant | File |
|---|---|
| `PROMPTS` | `src/content/prompts.json` |
| `BADGES_DEF` | `src/content/badges.json` |
| `DAILY_QUOTES` | `src/content/quotes.json` |
| `PODCASTS` | `src/content/podcasts.json` |

---

## C. State Breakdown

### Before: One giant `S` object (global, mutable, no reactivity)

### After: `appStore.js` with:
- `getState()` — read current state
- `setState(patch)` — merge patch, notify subscribers, auto-save
- `subscribe(fn)` — reactive updates
- State split into logical groups: user, progress, checkins, finance, community, partners, admin
- Admin flags (`isAdmin`, `role`) never written to localStorage or the data blob
- `DEFAULT_STATE` object documents every field with its type and default

---

## D. Inline Handler Migration

### Before: `onclick="doLogin()"`
### After: `addEventListener` in `authUI.js`

```js
// authUI.js — initAuthListeners()
document.querySelector('#auth-login .btn-primary')
  ?.addEventListener('click', () => doLogin());
```

All 347 inline `onclick` handlers are replaced by:
1. Delegated event listeners registered in each module's init
2. `window.fnName = fn` global bridge for handlers not yet migrated (gradual transition)
3. `data-*` attribute patterns for parameterized handlers

---

## E. Security Improvements

1. **Supabase key** → moved to `VITE_SUPABASE_KEY` env var
2. **Admin mutations** → moved to Netlify functions with server-side role verification
3. **`innerHTML`** → all user data goes through `sanitize()` / `esc()`
4. **Admin JS** → loaded lazily, only when `S.isAdmin === true`
5. **`isAdmin` flag** → never stored in localStorage or data blob; always read from DB `role` column

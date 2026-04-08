# 90DC — AI Deploy Checklist

## What Claude Has Fixed (v3 stabilized build)

### Code
- [x] 16 missing `window.*` inline handlers → `src/modules/globals.js`
- [x] 4 `require()` calls in ESM modules → converted to `import`
- [x] Broken `import('../modules/community...')` path in `app.js`
- [x] `partner.js` schema mismatch → now uses `from_user_id` + `to_email` per v23 SQL
- [x] SW `Date.now()` cache-bust on every load → fixed to stable BUILD_ID
- [x] SW missing `notificationclick` handler → added
- [x] SW no SPA fallback → returns `/index.html` on navigation miss
- [x] SPA routing — no `[[redirects]]` in netlify.toml → added
- [x] `send-push.js` + `send-email.js` missing CORS OPTIONS handler → added
- [x] `send-email.js` hardcoded `90dayschallenge.netlify.app` → uses `APP_URL` env var
- [x] `vite.config.js` unused `define{}` block (conflicted with `import.meta.env`) → removed
- [x] `manifest.json` missing `id` field, wrong maskable icon format → fixed
- [x] `netlify.toml` missing SW Cache-Control header → added `Service-Worker-Allowed`
- [x] `netlify/functions/package.json` missing → created (web-push dependency)
- [x] Supabase client missing auth options (`persistSession`, `autoRefreshToken`) → added
- [x] Deep-link handling (`?section=morning`) for PWA shortcuts → added in `main.js`
- [x] `router.js` mobile menu not closing on section switch → fixed
- [x] All HTML IDs aligned to actual sections (15 module/ID mismatches corrected)

---

## What Must Exist in Supabase Before Deploy

### Tables (run SQL in order)
1. `sql/v22-migration.sql` — adds columns to `warriors` table
2. `sql/v23-migration.sql` — creates `partner_nudges` + `life_milestones` tables

### Table: `warriors` (must have ALL these columns)
```
id            uuid PRIMARY KEY (= auth.users.id)
email         text
name          text
nickname      text
display_name  text
display_pref  text DEFAULT 'nickname'
phone         text
profession    text
gender        text
location      text
role          text DEFAULT 'member'  ← 'admin' for admin users
data          text  (JSON blob)
wakeup_time   text DEFAULT '05:30'   ← from v22 migration
current_day   integer DEFAULT 1      ← from v22 migration
streak        integer DEFAULT 0      ← from v22 migration
morning_done  boolean DEFAULT false  ← from v22 migration
evening_done  boolean DEFAULT false  ← from v22 migration
tz_offset     integer DEFAULT 120    ← from v22 migration
updated_at    timestamptz
```

### Table: `community_messages` (must have ALL these columns)
```
id            uuid PRIMARY KEY
room          text
user_id       uuid
display_name  text
body          text
is_anonymous  boolean
user_day      integer DEFAULT 1      ← from v23 migration
reactions     jsonb   DEFAULT '{}'   ← from v23 migration
image_url     text                   ← from v23 migration
audio_url     text                   ← from v23 migration
audio_duration integer               ← from v23 migration
reply_to      text                   ← from v23 migration
category      text                   ← from v23 migration
created_at    timestamptz
```

### Table: `partner_nudges`
```
id            uuid PRIMARY KEY
from_user_id  uuid REFERENCES auth.users
from_name     text
to_email      text      ← IMPORTANT: indexed, RLS by email
partner_name  text
message       text
seen          boolean DEFAULT false
created_at    timestamptz
```

### Table: `life_milestones`
```
id             uuid PRIMARY KEY
user_id        uuid REFERENCES auth.users
milestone_type text
milestone_title text
day_number     integer
triggered_at   timestamptz
```

### Storage
- Bucket `warrior-media` must exist and be **public**

### RLS Policies
- `warriors`: users can SELECT/UPDATE their own row (`auth.uid() = id`)
- `warriors`: allow INSERT for new rows during signup
- `community_messages`: authenticated users can INSERT; all authenticated can SELECT
- `partner_nudges`: INSERT where `auth.uid() = from_user_id`; SELECT where `to_email = auth.jwt()→email`
- `life_milestones`: full access for own rows

### Admin User
```sql
UPDATE warriors
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

### Realtime
- Enable Realtime on `community_messages` table in Supabase Dashboard → Database → Replication

---

## What Must Exist in Netlify

### Environment Variables (all required before first deploy)
```
VITE_SUPABASE_URL          your Supabase project URL
VITE_SUPABASE_KEY          your anon/publishable key
SUPABASE_URL               same URL (for functions)
SUPABASE_SERVICE_KEY       service role key (server-only)
VITE_VAPID_PUBLIC_KEY      VAPID public key (for push subscription)
VAPID_PUBLIC_KEY           same (for functions)
VAPID_PRIVATE_KEY          VAPID private key (server-only)
VAPID_EMAIL                mailto: address
RESEND_API_KEY             from resend.com
RESEND_FROM_EMAIL          e.g. "Osi <noreply@yourdomain.com>"
APP_URL                    e.g. https://yourdomain.com
```

### Generate VAPID keys (run once locally, save to Netlify)
```bash
npx web-push generate-vapid-keys
```

### Deploy Order
1. Run `sql/v22-migration.sql` in Supabase SQL Editor
2. Run `sql/v23-migration.sql` in Supabase SQL Editor
3. Set all env vars in Netlify
4. Set admin role for your email in Supabase
5. Create `warrior-media` storage bucket (public)
6. Enable Realtime on `community_messages`
7. Push code → Netlify auto-deploys

### Verify After Deploy
- [ ] App loads at your domain
- [ ] Signup creates a row in `warriors` table
- [ ] Login restores session on page refresh
- [ ] Morning check-in completes without error
- [ ] Community chat sends a message (check Supabase → Table Editor → community_messages)
- [ ] Push notification permission prompt appears in Profile
- [ ] Admin login shows admin nav item
- [ ] `/sw.js` returns `Cache-Control: no-cache` (check Network tab)
- [ ] `/assets/*.js` returns `Cache-Control: immutable` (check Network tab)

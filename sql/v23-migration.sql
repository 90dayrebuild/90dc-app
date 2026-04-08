-- ============================================================
-- 90 Days Challenge — v22 Schema Migration
-- Run this in Supabase: Dashboard → SQL Editor → New Query
-- ============================================================
-- Purpose: Extract the most operationally important fields from
-- the warriors.data JSON blob into native columns so that:
--   1. The hourly scheduled-push job can query wakeup times
--      without deserializing thousands of full data blobs.
--   2. Admin reporting can filter/sort by day, streak, check-in
--      status without loading every user's full state.
--   3. Future analytics can run efficiently against real columns.
--
-- These columns are written by syncToSupabase() in v22.
-- They are always kept in sync with the blob — they are NOT
-- a replacement for warriors.data, just queryable mirrors.
-- ============================================================

-- Add queryable columns to warriors table
ALTER TABLE warriors
  ADD COLUMN IF NOT EXISTS wakeup_time  TEXT    DEFAULT '05:30',
  ADD COLUMN IF NOT EXISTS current_day  INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS morning_done BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS evening_done BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tz_offset    INTEGER DEFAULT 120;

-- Index the columns the scheduled push job queries every hour
-- (wakeup_time so we can find warriors whose local time matches,
--  tz_offset so we can calculate local time server-side)
CREATE INDEX IF NOT EXISTS idx_warriors_wakeup_time ON warriors(wakeup_time);
CREATE INDEX IF NOT EXISTS idx_warriors_tz_offset   ON warriors(tz_offset);

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_warriors_streak      ON warriors(streak DESC);
CREATE INDEX IF NOT EXISTS idx_warriors_current_day ON warriors(current_day DESC);

-- Backfill existing warriors from their data blobs
-- This extracts the fields for any user who already has data.
-- Safe to run multiple times (uses COALESCE to not overwrite non-null values).
UPDATE warriors
SET
  wakeup_time  = COALESCE(NULLIF(wakeup_time, '05:30'), data::jsonb->>'wakeupTime', '05:30'),
  current_day  = COALESCE(
    NULLIF(current_day, 1),
    (data::jsonb->>'day')::integer,
    1
  ),
  streak       = COALESCE(
    NULLIF(streak, 0),
    (data::jsonb->>'currentStreak')::integer,
    (data::jsonb->>'streak')::integer,
    0
  ),
  morning_done = COALESCE(
    NULLIF(morning_done, false),
    (data::jsonb->>'morningDone')::boolean,
    false
  ),
  evening_done = COALESCE(
    NULLIF(evening_done, false),
    (data::jsonb->>'eveningDone')::boolean,
    false
  ),
  tz_offset    = COALESCE(
    NULLIF(tz_offset, 120),
    (data::jsonb->>'tzOffset')::integer,
    120
  )
WHERE data IS NOT NULL AND data != '' AND data != '{}';

-- Verify migration ran correctly
SELECT
  COUNT(*)                                        AS total_warriors,
  COUNT(*) FILTER (WHERE wakeup_time IS NOT NULL) AS have_wakeup_time,
  COUNT(*) FILTER (WHERE current_day > 1)         AS past_day_1,
  COUNT(*) FILTER (WHERE streak > 0)              AS have_streak,
  MIN(current_day)                                AS min_day,
  MAX(current_day)                                AS max_day,
  MAX(streak)                                     AS top_streak
FROM warriors;

-- ============================================================
-- After running this migration, set these env vars in Netlify:
--   RESEND_API_KEY        — from resend.com dashboard
--   RESEND_FROM_EMAIL     — e.g. "Osi <noreply@90dayschallenge.co.bw>"
--                           (domain must be verified in Resend)
--   VAPID_PUBLIC_KEY      — your VAPID public key
--   VAPID_PRIVATE_KEY     — your VAPID private key
--   VAPID_EMAIL           — mailto: for VAPID claims
--   SUPABASE_URL          — your Supabase project URL
--   SUPABASE_SERVICE_KEY  — Supabase service role key
-- ============================================================

-- ============================================================
-- 90 Days Challenge — v23 Addendum
-- Run AFTER v22-migration.sql
-- New tables for: partner nudges, life milestones
-- ============================================================

-- Partner nudges table (enables real-time nudge between partners)
CREATE TABLE IF NOT EXISTS partner_nudges (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  from_name     text NOT NULL DEFAULT 'Warrior',
  to_email      text NOT NULL,
  partner_name  text NOT NULL DEFAULT 'Partner',
  message       text NOT NULL,
  seen          boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- Index so we can query nudges by recipient email fast
CREATE INDEX IF NOT EXISTS idx_partner_nudges_to_email ON partner_nudges(to_email);
CREATE INDEX IF NOT EXISTS idx_partner_nudges_created  ON partner_nudges(created_at DESC);

-- RLS: users can insert their own nudges, read nudges sent to their email
ALTER TABLE partner_nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "nudges_insert_own"
  ON partner_nudges FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY IF NOT EXISTS "nudges_select_by_email"
  ON partner_nudges FOR SELECT
  USING (to_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Life milestones log (persistent across devices — supplements local S.lifeMilestonesShown)
CREATE TABLE IF NOT EXISTS life_milestones (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type text NOT NULL,
  milestone_title text NOT NULL,
  day_number     integer,
  triggered_at   timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_life_milestones_unique
  ON life_milestones(user_id, milestone_type);

ALTER TABLE life_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "milestones_own"
  ON life_milestones FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify
SELECT 'partner_nudges' AS table_name, COUNT(*) AS rows FROM partner_nudges
UNION ALL
SELECT 'life_milestones', COUNT(*) FROM life_milestones;

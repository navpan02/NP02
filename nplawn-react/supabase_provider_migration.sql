-- ============================================================
-- NPLawn Provider Marketplace — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Provider business profiles
CREATE TABLE IF NOT EXISTS provider_profiles (
  email               TEXT PRIMARY KEY,
  business_name       TEXT,
  description         TEXT,
  phone               TEXT,
  address             TEXT,
  years_in_business   INT,
  team_size           INT,
  equipment           TEXT,
  license_number      TEXT,
  services_offered    TEXT[]    DEFAULT '{}',
  service_areas       TEXT[]    DEFAULT '{}',  -- ZIP codes
  portfolio           JSONB     DEFAULT '[]',
  rating              NUMERIC,
  total_jobs          INT       DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Homeowner quote requests (open marketplace requests)
CREATE TABLE IF NOT EXISTS quote_requests (
  id              TEXT PRIMARY KEY,
  homeowner_name  TEXT,
  homeowner_email TEXT,
  service_type    TEXT,
  address         TEXT,
  zip_code        TEXT,
  property_size   TEXT,
  description     TEXT,
  photos          JSONB     DEFAULT '[]',
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  status          TEXT      DEFAULT 'open'   -- open | closed
);

-- 3. Quotes submitted by providers
CREATE TABLE IF NOT EXISTS provider_quotes (
  id                  TEXT PRIMARY KEY,
  quote_request_id    TEXT REFERENCES quote_requests(id) ON DELETE CASCADE,
  provider_id         TEXT REFERENCES provider_profiles(email) ON DELETE CASCADE,
  homeowner_name      TEXT,
  service_type        TEXT,
  price_type          TEXT,   -- flat | range
  price               NUMERIC,
  price_max           NUMERIC,
  estimated_duration  TEXT,
  validity_days       INT,
  notes               TEXT,
  status              TEXT DEFAULT 'pending', -- pending | accepted | rejected | withdrawn
  submitted_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Scheduled / completed jobs
CREATE TABLE IF NOT EXISTS provider_jobs (
  id                   TEXT PRIMARY KEY,
  provider_id          TEXT REFERENCES provider_profiles(email) ON DELETE CASCADE,
  quote_id             TEXT,
  homeowner_name       TEXT,
  homeowner_email      TEXT,
  service_type         TEXT,
  address              TEXT,
  scheduled_date       DATE,
  scheduled_time       TEXT,
  status               TEXT DEFAULT 'scheduled', -- scheduled | in-progress | complete
  is_recurring         BOOLEAN DEFAULT FALSE,
  recurring_frequency  TEXT,
  notes                TEXT
);

-- 5. In-app messages between providers and homeowners
CREATE TABLE IF NOT EXISTS provider_messages (
  id          TEXT PRIMARY KEY,
  thread_id   TEXT,
  from_id     TEXT,
  from_name   TEXT,
  to_id       TEXT,
  content     TEXT,
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  read        BOOLEAN DEFAULT FALSE
);

-- 6. Provider availability settings
CREATE TABLE IF NOT EXISTS provider_availability (
  provider_id         TEXT PRIMARY KEY REFERENCES provider_profiles(email) ON DELETE CASCADE,
  weekly_windows      JSONB,
  blocked_dates       TEXT[]  DEFAULT '{}',
  accepting_requests  BOOLEAN DEFAULT TRUE,
  max_jobs_per_day    INT     DEFAULT 4,
  max_jobs_per_week   INT     DEFAULT 18
);

-- ============================================================
-- Indexes for common query patterns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_quote_requests_zip    ON quote_requests(zip_code);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_provider_quotes_pid   ON provider_quotes(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_quotes_reqid ON provider_quotes(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_provider_jobs_pid     ON provider_jobs(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_jobs_date    ON provider_jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_messages_thread       ON provider_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_to           ON provider_messages(to_id);

-- ============================================================
-- Row Level Security (enable per table, then add policies)
-- Uncomment when ready to lock down access per authenticated user.
-- ============================================================
-- ALTER TABLE provider_profiles    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE provider_quotes      ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE provider_jobs        ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE provider_messages    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "providers manage own profile"
--   ON provider_profiles FOR ALL USING (email = auth.email());
--
-- CREATE POLICY "providers manage own quotes"
--   ON provider_quotes FOR ALL USING (provider_id = auth.email());
--
-- CREATE POLICY "providers manage own jobs"
--   ON provider_jobs FOR ALL USING (provider_id = auth.email());
--
-- CREATE POLICY "providers read own messages"
--   ON provider_messages FOR SELECT USING (from_id = auth.email() OR to_id = auth.email());
--
-- CREATE POLICY "providers send messages"
--   ON provider_messages FOR INSERT WITH CHECK (from_id = auth.email());
--
-- CREATE POLICY "providers manage own availability"
--   ON provider_availability FOR ALL USING (provider_id = auth.email());

-- ============================================================
-- Demo seed data (matches the provider@nplawn.com test account)
-- ============================================================
INSERT INTO quote_requests (id, homeowner_name, homeowner_email, service_type, address, zip_code, property_size, description, submitted_at, status)
VALUES
  ('qr001', 'Raj Patel',   'raj@example.com',   'Lawn Mowing',      '402 Elm St, Naperville',     '60540', 'Medium (3000–5000 sqft)', 'Need weekly mowing, backyard has a slight slope.',              NOW() - INTERVAL '1 hour',  'open'),
  ('qr002', 'Sarah Kim',   'sarah@example.com', 'Tree Trimming',    '88 Oak Ave, Lisle',           '60563', 'Large (5000+ sqft)',      '3 mature oaks need crown thinning before summer storms.',       NOW() - INTERVAL '1 day',   'open'),
  ('qr003', 'Mike Torres', 'mike@example.com',  'Aeration & Seeding','211 Birch Ct, Woodridge',   '60517', 'Small (under 3000 sqft)', 'Lawn is patchy, looking for spring aeration + overseeding.',   NOW() - INTERVAL '2 days',  'open')
ON CONFLICT (id) DO NOTHING;

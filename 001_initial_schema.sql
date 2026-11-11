-- ═══════════════════════════════════════════════════════════
-- CalcHub — Initial Database Schema
-- Run: supabase db push  OR paste in Supabase SQL editor
-- ═══════════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. PROFILES (extends auth.users) ─────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user'   -- 'user' | 'admin' | 'moderator'
                CHECK (role IN ('user', 'admin', 'moderator')),
  plan          TEXT NOT NULL DEFAULT 'free'   -- 'free' | 'pro' | 'lifetime'
                CHECK (plan IN ('free', 'pro', 'lifetime')),
  plan_expires_at TIMESTAMPTZ,
  preferences   JSONB NOT NULL DEFAULT '{}',   -- theme, language, font_size etc.
  calc_count    INTEGER NOT NULL DEFAULT 0,    -- total calculations done
  is_banned     BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. CALCULATION HISTORY ────────────────────────────────
CREATE TABLE public.calculations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  calc_id       TEXT NOT NULL,        -- e.g. 'emi', 'bmi', 'sip'
  section_id    TEXT NOT NULL,        -- e.g. 'finance', 'health'
  calc_name     TEXT NOT NULL,
  inputs        JSONB NOT NULL DEFAULT '{}',
  result        JSONB NOT NULL DEFAULT '{}',
  is_saved      BOOLEAN NOT NULL DEFAULT FALSE,
  label         TEXT,                 -- user-given label for saved calcs
  session_id    TEXT,                 -- for anonymous usage tracking
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. FAVOURITES ─────────────────────────────────────────
CREATE TABLE public.favourites (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  calc_id       TEXT NOT NULL,
  section_id    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, calc_id)
);

-- ── 4. ADMIN BANNERS ──────────────────────────────────────
CREATE TABLE public.banners (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  subtitle      TEXT,
  cta_text      TEXT,
  cta_link      TEXT,
  bg_color_1    TEXT NOT NULL DEFAULT '#4f83e3',
  bg_color_2    TEXT NOT NULL DEFAULT '#2dd4bf',
  emoji         TEXT NOT NULL DEFAULT '🧮',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  show_to       TEXT NOT NULL DEFAULT 'all'   -- 'all' | 'free' | 'pro' | 'guest'
                CHECK (show_to IN ('all', 'free', 'pro', 'guest')),
  priority      INTEGER NOT NULL DEFAULT 0,
  calc_id       TEXT,                         -- link directly to a calculator
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. SITE SETTINGS ──────────────────────────────────────
CREATE TABLE public.site_settings (
  key           TEXT PRIMARY KEY,
  value         JSONB NOT NULL,
  updated_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. ANALYTICS EVENTS ───────────────────────────────────
CREATE TABLE public.analytics_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type    TEXT NOT NULL,  -- 'calc_view' | 'calc_run' | 'page_view' | 'search'
  calc_id       TEXT,
  section_id    TEXT,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id    TEXT,
  meta          JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. REVIEWS ────────────────────────────────────────────
CREATE TABLE public.reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  calc_id       TEXT NOT NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  is_approved   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, calc_id)
);

-- ── 8. NOTIFICATIONS ──────────────────────────────────────
CREATE TABLE public.notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'info'  -- 'info' | 'success' | 'warning' | 'error'
                CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  link          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════ INDEXES ════════════════════════════════
CREATE INDEX idx_calculations_user_id    ON public.calculations(user_id);
CREATE INDEX idx_calculations_calc_id    ON public.calculations(calc_id);
CREATE INDEX idx_calculations_created_at ON public.calculations(created_at DESC);
CREATE INDEX idx_favourites_user_id      ON public.favourites(user_id);
CREATE INDEX idx_analytics_event_type    ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_calc_id       ON public.analytics_events(calc_id);
CREATE INDEX idx_analytics_created_at    ON public.analytics_events(created_at DESC);
CREATE INDEX idx_notifications_user_id   ON public.notifications(user_id, is_read);

-- ═══════════════ ROW LEVEL SECURITY ═════════════════════
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;

-- ── Profiles policies ──
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Calculations policies ──
CREATE POLICY "Users can view own calculations"
  ON public.calculations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations"
  ON public.calculations FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own calculations"
  ON public.calculations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations"
  ON public.calculations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all calculations"
  ON public.calculations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Favourites policies ──
CREATE POLICY "Users manage own favourites"
  ON public.favourites FOR ALL USING (auth.uid() = user_id);

-- ── Banners policies ──
CREATE POLICY "Anyone can view active banners"
  ON public.banners FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins manage banners"
  ON public.banners FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Site settings policies ──
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT USING (TRUE);

CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Analytics policies ──
CREATE POLICY "Anyone can insert analytics"
  ON public.analytics_events FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can read analytics"
  ON public.analytics_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Notifications policies ──
CREATE POLICY "Users manage own notifications"
  ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ── Reviews policies ──
CREATE POLICY "Anyone can read approved reviews"
  ON public.reviews FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage reviews"
  ON public.reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ═══════════════ TRIGGERS ════════════════════════════════
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN NEW.email = ANY(string_to_array(current_setting('app.admin_emails', TRUE), ','))
         THEN 'admin' ELSE 'user' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ═══════════════ DEFAULT DATA ════════════════════════════
INSERT INTO public.site_settings (key, value) VALUES
  ('maintenance_mode',    '{"enabled": false, "message": "CalcHub is under maintenance. Back soon!"}'),
  ('registration_open',   '"true"'),
  ('max_free_saves',      '10'),
  ('max_pro_saves',       '1000'),
  ('featured_calculators', '["emi", "bmi", "sip", "gst", "cgpa"]'),
  ('announcement',        '{"text": "", "link": "", "active": false}')
ON CONFLICT (key) DO NOTHING;

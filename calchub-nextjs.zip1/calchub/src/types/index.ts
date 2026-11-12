// ══════════════════════════════════════════════
// CalcHub — TypeScript Types
// ══════════════════════════════════════════════

// ── Auth & Users ──────────────────────────────
export type UserRole = 'user' | 'admin' | 'moderator'
export type UserPlan = 'free' | 'pro' | 'lifetime'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  plan: UserPlan
  plan_expires_at: string | null
  preferences: UserPreferences
  calc_count: number
  is_banned: boolean
  ban_reason: string | null
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  theme?: 'dark' | 'light' | 'system'
  language?: string
  font_size?: 'sm' | 'md' | 'lg' | 'xl'
  currency?: string
  notifications_email?: boolean
  notifications_push?: boolean
}

// ── Calculators ───────────────────────────────
export interface Calculator {
  id: string
  name: string
  emoji: string
  desc: string
  tags?: string[]
  popular?: boolean
  new?: boolean
}

export interface Section {
  id: string
  name: string
  emoji: string
  color: string
  rgb: string
  desc: string
  calcs: Calculator[]
}

// ── Calculation History ───────────────────────
export interface Calculation {
  id: string
  user_id: string | null
  calc_id: string
  section_id: string
  calc_name: string
  inputs: Record<string, unknown>
  result: Record<string, unknown>
  is_saved: boolean
  label: string | null
  created_at: string
}

// ── Favourite ─────────────────────────────────
export interface Favourite {
  id: string
  user_id: string
  calc_id: string
  section_id: string
  created_at: string
}

// ── Banner ────────────────────────────────────
export type BannerAudience = 'all' | 'free' | 'pro' | 'guest'

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  cta_text: string | null
  cta_link: string | null
  bg_color_1: string
  bg_color_2: string
  emoji: string
  is_active: boolean
  show_to: BannerAudience
  priority: number
  calc_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// ── Analytics ─────────────────────────────────
export type EventType = 'calc_view' | 'calc_run' | 'page_view' | 'search' | 'login' | 'register'

export interface AnalyticsEvent {
  id: string
  event_type: EventType
  calc_id: string | null
  section_id: string | null
  user_id: string | null
  session_id: string | null
  meta: Record<string, unknown>
  created_at: string
}

export interface AnalyticsSummary {
  total_users: number
  total_calculations: number
  today_calculations: number
  popular_calcs: Array<{ calc_id: string; count: number }>
  daily_counts: Array<{ date: string; count: number }>
  section_breakdown: Array<{ section_id: string; count: number }>
}

// ── Review ────────────────────────────────────
export interface Review {
  id: string
  user_id: string
  calc_id: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  profile?: Pick<Profile, 'full_name' | 'avatar_url'>
}

// ── Notification ──────────────────────────────
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  link: string | null
  created_at: string
}

// ── Site Settings ─────────────────────────────
export interface SiteSettings {
  maintenance_mode: { enabled: boolean; message: string }
  registration_open: boolean
  max_free_saves: number
  max_pro_saves: number
  featured_calculators: string[]
  announcement: { text: string; link: string; active: boolean }
}

// ── API Responses ─────────────────────────────
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// ── Admin Dashboard ───────────────────────────
export interface AdminStats {
  total_users: number
  new_users_today: number
  new_users_week: number
  total_calculations: number
  calcs_today: number
  calcs_week: number
  pro_users: number
  banned_users: number
  active_banners: number
}

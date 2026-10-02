import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Anime, Part, SiteSettings, SupabaseHealth } from '../types';

// Default Supabase credentials provided by user
export const DEFAULT_SUPABASE_PROJECT_ID = 'hljfolgjqdyovfrmlpew';
export const DEFAULT_SUPABASE_URL = `https://${DEFAULT_SUPABASE_PROJECT_ID}.supabase.co`;
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_EY9H4OPWHrHnl1IRydNd9g_FUSvEgjK';

// Check if overridden in localStorage or env
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('ans_custom_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('ans_custom_supabase_key') : null;

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || storedUrl || DEFAULT_SUPABASE_URL).trim();
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || storedKey || DEFAULT_SUPABASE_ANON_KEY).trim();

// Create the Supabase client instance
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Seed Data for initial load and fallback
export const SEED_ANIME: Anime[] = [
  {
    id: 'anm_chrono_blade',
    title: 'Chrono Blade: Zero',
    slug: 'chrono-blade-zero',
    description: 'In the fractured metropolis of Neo Kyoto, an exiled chronomancer must shatter the timeline to prevent the awakening of the Void Sovereign. An original high-octane temporal action series with breathtaking blade sequences and rich worldbuilding.',
    thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    banner_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    genre: ['Action', 'Sci-Fi', 'Fantasy'],
    status: 'Ongoing',
    rating: '16+',
    studio: 'ANS Original Studios',
    release_year: 2026,
    published: true,
    featured: true,
    views: 14820,
    created_at: '2026-09-01T12:00:00Z',
    updated_at: '2026-09-28T14:30:00Z',
  },
  {
    id: 'anm_cyber_valkyrie',
    title: 'Cyber Valkyrie: Neo Tokyo',
    slug: 'cyber-valkyrie-neo-tokyo',
    description: 'Under the neon haze of 2099 Tokyo, cybernetic enforcer Kayo uncovers a conspiracy deep within the megacorporation that built her mechanical wings. High-intensity tactical combat meets emotional cyberpunk storytelling.',
    thumbnail_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    banner_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    genre: ['Cyberpunk', 'Mecha', 'Action'],
    status: 'Ongoing',
    rating: '16+',
    studio: 'ANS Animation Lab',
    release_year: 2026,
    published: true,
    featured: true,
    views: 9420,
    created_at: '2026-09-05T10:00:00Z',
    updated_at: '2026-09-27T16:00:00Z',
  },
  {
    id: 'anm_spirits_mist',
    title: 'Spirits of the Mist: Kitsune Tale',
    slug: 'spirits-of-the-mist',
    description: 'Deep within the ancient bamboo valleys of Mt. Hiei, an orphaned shrine maiden forms an eternal pact with a celestial nine-tailed spirit to defend the ethereal boundary between mortals and yokai.',
    thumbnail_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    banner_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    genre: ['Fantasy', 'Supernatural', 'Drama'],
    status: 'Completed',
    rating: '13+',
    studio: 'Misty Horizon Project',
    release_year: 2025,
    published: true,
    featured: false,
    views: 18350,
    created_at: '2026-08-15T09:00:00Z',
    updated_at: '2026-09-20T11:20:00Z',
  },
  {
    id: 'anm_void_drifter',
    title: 'Void Drifter: Star Horizon',
    slug: 'void-drifter-star-horizon',
    description: 'Beyond the charted star lanes lies the Nebula of Echoes. A ragtag crew of bounty scavengers stumble upon an ancient alien flagship carrying the final coordinates to humanity\'s forgotten origin world.',
    thumbnail_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    banner_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    genre: ['Sci-Fi', 'Space', 'Adventure'],
    status: 'Ongoing',
    rating: '13+',
    studio: 'Orbit Arts Collective',
    release_year: 2026,
    published: true,
    featured: false,
    views: 7190,
    created_at: '2026-09-12T14:00:00Z',
    updated_at: '2026-09-26T08:15:00Z',
  },
  {
    id: 'anm_ronin_dynasty',
    title: 'Echoes of the Ronin: Shadow Dynasty',
    slug: 'echoes-of-the-ronin',
    description: 'When the imperial court is seized by occult warlords, a solitary masterless swordsman wielding a cursed dark-iron nodachi journeys through snow-capped mountain passes to rescue the rightful heir.',
    thumbnail_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    banner_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
    genre: ['Action', 'Fantasy', 'Historical'],
    status: 'Ongoing',
    rating: '16+',
    studio: 'Blade & Brush Studio',
    release_year: 2026,
    published: true,
    featured: false,
    views: 11240,
    created_at: '2026-09-18T10:00:00Z',
    updated_at: '2026-09-29T10:00:00Z',
  },
  {
    id: 'anm_solaria_academy',
    title: 'Solaria Academy: Spellforge',
    slug: 'solaria-academy-spellforge',
    description: 'At the prestigious floating citadel of Solaria, students forge mystical weapons powered by stellar cores. Zero, an ungifted transfer student, unlocks an ancient lost blueprint that threatens the school\'s hierarchical balance.',
    thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    banner_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1600&q=80',
    genre: ['Fantasy', 'Adventure', 'School'],
    status: 'Completed',
    rating: '13+',
    studio: 'Starlight Animation',
    release_year: 2025,
    published: true,
    featured: false,
    views: 8930,
    created_at: '2026-07-10T12:00:00Z',
    updated_at: '2026-09-15T09:00:00Z',
  },
];

export const SEED_PARTS: Part[] = [
  // Chrono Blade: Zero parts
  {
    id: 'prt_cb_1',
    anime_id: 'anm_chrono_blade',
    part_number: 1,
    title: 'Part 1: The Broken Pendulum',
    description: 'Ren awakens in the burning ruins of Sector 7 with no memory of how he shattered the primary timeline.',
    video_type: 'stream_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '12:14',
    thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    published: true,
    views: 6540,
    created_at: '2026-09-01T12:30:00Z',
    updated_at: '2026-09-01T12:30:00Z',
  },
  {
    id: 'prt_cb_2',
    anime_id: 'anm_chrono_blade',
    part_number: 2,
    title: 'Part 2: Echoes of Steel',
    description: 'Pursued by temporal inquisitors, Ren must duel his former mentor across the shifting skyscrapers of Neo Kyoto.',
    video_type: 'stream_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '09:56',
    thumbnail_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    published: true,
    views: 4890,
    created_at: '2026-09-08T15:00:00Z',
    updated_at: '2026-09-08T15:00:00Z',
  },
  {
    id: 'prt_cb_3',
    anime_id: 'anm_chrono_blade',
    part_number: 3,
    title: 'Part 3: The Void Sovereign Awakening',
    description: 'The ritual begins at the Zenith Citadel as the countdown reaches zero. Can time be bent one last time?',
    video_type: 'stream_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: '14:48',
    thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    published: true,
    views: 3390,
    created_at: '2026-09-22T18:00:00Z',
    updated_at: '2026-09-22T18:00:00Z',
  },
  // Cyber Valkyrie parts
  {
    id: 'prt_cv_1',
    anime_id: 'anm_cyber_valkyrie',
    part_number: 1,
    title: 'Part 1: Protocol Chimera',
    description: 'Enforcer Kayo receives an unlogged black-box distress beacon from deep beneath the Shinjuku Undergrid.',
    video_type: 'stream_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '10:53',
    thumbnail_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    published: true,
    views: 5210,
    created_at: '2026-09-05T11:00:00Z',
    updated_at: '2026-09-05T11:00:00Z',
  },
  {
    id: 'prt_cv_2',
    anime_id: 'anm_cyber_valkyrie',
    part_number: 2,
    title: 'Part 2: Wings of Titanium',
    description: 'Her cybernetic modifications begin desynchronizing as the corporate strike team closes in.',
    video_type: 'stream_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '12:14',
    thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    published: true,
    views: 4210,
    created_at: '2026-09-19T14:00:00Z',
    updated_at: '2026-09-19T14:00:00Z',
  },
  // Spirits of the Mist parts
  {
    id: 'prt_sm_1',
    anime_id: 'anm_spirits_mist',
    part_number: 1,
    title: 'Part 1: The Nine-Tailed Shrine',
    description: 'On the night of the autumn moon eclipse, the seal on the thousand-year stone begins to crack.',
    video_type: 'stream_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: '15:20',
    thumbnail_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    published: true,
    views: 11200,
    created_at: '2026-08-15T10:00:00Z',
    updated_at: '2026-08-15T10:00:00Z',
  },
  {
    id: 'prt_sm_2',
    anime_id: 'anm_spirits_mist',
    part_number: 2,
    title: 'Part 2: Fireflies and Spirit Flame',
    description: 'The priestess and the spirit embark on a pilgrimage across the misty borderlands.',
    video_type: 'stream_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '11:15',
    thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    published: true,
    views: 7150,
    created_at: '2026-08-28T14:00:00Z',
    updated_at: '2026-08-28T14:00:00Z',
  },
  // Void Drifter part
  {
    id: 'prt_vd_1',
    anime_id: 'anm_void_drifter',
    part_number: 1,
    title: 'Part 1: Derelict Beacon',
    description: 'The salvage trawler "Starlight Wanderer" picks up a rhythmic distress ping from a dead dreadnought.',
    video_type: 'stream_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '12:14',
    thumbnail_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    published: true,
    views: 7190,
    created_at: '2026-09-12T15:00:00Z',
    updated_at: '2026-09-12T15:00:00Z',
  },
  // Echoes of the Ronin part
  {
    id: 'prt_er_1',
    anime_id: 'anm_ronin_dynasty',
    part_number: 1,
    title: 'Part 1: The Blood Red Snow',
    description: 'Along the frozen mountain pass of Shinano, shadow warriors ambush the royal caravan.',
    video_type: 'stream_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '15:00',
    thumbnail_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    published: true,
    views: 6120,
    created_at: '2026-09-18T10:30:00Z',
    updated_at: '2026-09-18T10:30:00Z',
  },
  // Solaria Academy part
  {
    id: 'prt_sa_1',
    anime_id: 'anm_solaria_academy',
    part_number: 1,
    title: 'Part 1: The Spark of Solaria',
    description: 'Entrance examinations at the sky citadel push apprentice mages to manifest their core weapon forms.',
    video_type: 'stream_url',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '10:53',
    thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    published: true,
    views: 4590,
    created_at: '2026-07-10T13:00:00Z',
    updated_at: '2026-07-10T13:00:00Z',
  },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  website_name: 'ANS Anime',
  logo_url: '',
  tagline: 'Connected with Supabase Cloud Database',
  description: 'Stream exclusive high-definition original anime series, episodic productions, and animations with live Supabase database sync.',
  default_thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  social_links: {
    discord: 'https://discord.gg/ansanime',
    twitter: 'https://twitter.com/ansanime',
    youtube: 'https://youtube.com/@ansanime',
  },
  analytics_code: '',
  seo_title: 'ANS Anime - Stream Original Anime & Series with Supabase',
  seo_description: 'Discover and stream cutting-edge indie anime series, multi-part episodes, and original stories in HD, backed by Supabase.',
  categories: [
    'Action',
    'Sci-Fi',
    'Cyberpunk',
    'Fantasy',
    'Supernatural',
    'Space',
    'Mecha',
    'Adventure',
    'Historical',
    'Drama',
    'Comedy',
    'Mystery',
    'Romance',
    'Thriller',
  ],
  ads: {
    popup_enabled: false,
    popup_code: '<!-- Adsterra / Network Popunder Tag Example -->\n<script type="text/javascript">\n  console.log("ANS Anime ad tag initialized");\n</script>',
    popup_interval_minutes: 30,
    preroll_enabled: false,
    preroll_type: 'video',
    preroll_content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    preroll_target_url: 'https://ansanime.com',
    preroll_skip_seconds: 5,
    preroll_title: 'Sponsor Announcement',
  },
};

// Local storage keys for hybrid fallback
const LOCAL_ANIME_KEY = 'ans_supabase_fallback_anime';
const LOCAL_PARTS_KEY = 'ans_supabase_fallback_parts';
const LOCAL_SETTINGS_KEY = 'ans_supabase_fallback_settings';

export function getLocalAnime(): Anime[] {
  try {
    const raw = localStorage.getItem(LOCAL_ANIME_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch {}
  return SEED_ANIME;
}

export function saveLocalAnime(list: Anime[]) {
  try {
    localStorage.setItem(LOCAL_ANIME_KEY, JSON.stringify(list));
  } catch {}
}

export function getLocalParts(): Part[] {
  try {
    const raw = localStorage.getItem(LOCAL_PARTS_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch {}
  return SEED_PARTS;
}

export function saveLocalParts(list: Part[]) {
  try {
    localStorage.setItem(LOCAL_PARTS_KEY, JSON.stringify(list));
  } catch {}
}

export function getLocalSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : DEFAULT_SETTINGS.categories,
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveLocalSettings(settings: SiteSettings) {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

// Complete SQL Schema Generator for Supabase SQL Editor
export const SUPABASE_SETUP_SQL = `-- ========================================================
-- ANS Anime Database Schema for Supabase
-- Project ID: ${DEFAULT_SUPABASE_PROJECT_ID}
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- ========================================================

-- 1. Anime Table
CREATE TABLE IF NOT EXISTS public.anime (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  banner_url TEXT,
  genre TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Ongoing',
  rating TEXT DEFAULT '13+',
  studio TEXT,
  release_year INTEGER DEFAULT 2026,
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Anime Parts (Episodes) Table
CREATE TABLE IF NOT EXISTS public.parts (
  id TEXT PRIMARY KEY,
  anime_id TEXT NOT NULL REFERENCES public.anime(id) ON DELETE CASCADE,
  part_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_type TEXT DEFAULT 'stream_url',
  video_url TEXT NOT NULL,
  duration TEXT,
  thumbnail_url TEXT,
  published BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE(anime_id, part_number)
);

-- 3. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  settings JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. User Reviews & Ratings Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id TEXT NOT NULL REFERENCES public.anime(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. User Watchlist Table
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id TEXT NOT NULL REFERENCES public.anime(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, anime_id)
);

-- 6. Enable Row Level Security (RLS) with permissive read access for public streaming
ALTER TABLE public.anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running to avoid conflicts
DROP POLICY IF EXISTS "Public Read Published Anime" ON public.anime;
DROP POLICY IF EXISTS "Allow All Anime Operations" ON public.anime;
DROP POLICY IF EXISTS "Public Read Published Parts" ON public.parts;
DROP POLICY IF EXISTS "Allow All Parts Operations" ON public.parts;
DROP POLICY IF EXISTS "Public Read Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow All Settings Operations" ON public.site_settings;
DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow Public Reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow User Watchlist" ON public.watchlist;

-- Allow public read of published anime & parts
CREATE POLICY "Public Read Published Anime" ON public.anime FOR SELECT USING (true);
CREATE POLICY "Public Read Published Parts" ON public.parts FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);

-- Allow public insertion and updates for streaming views and admin tasks
CREATE POLICY "Allow All Anime Operations" ON public.anime FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Parts Operations" ON public.parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Settings Operations" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow User Watchlist" ON public.watchlist FOR ALL USING (true) WITH CHECK (true);

-- 7. Insert Initial Site Settings
INSERT INTO public.site_settings (id, settings)
VALUES ('default', '${JSON.stringify(DEFAULT_SETTINGS).replace(/'/g, "''")}')
ON CONFLICT (id) DO UPDATE SET settings = EXCLUDED.settings;

-- 8. Storage Bucket for Poster Thumbnails and Videos
INSERT INTO storage.buckets (id, name, public) VALUES ('anime-media', 'anime-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read anime-media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload to anime-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update in anime-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete in anime-media" ON storage.objects;

CREATE POLICY "Public Read anime-media bucket" ON storage.objects FOR SELECT USING (bucket_id = 'anime-media');
CREATE POLICY "Allow Upload to anime-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'anime-media');
CREATE POLICY "Allow Update in anime-media" ON storage.objects FOR UPDATE USING (bucket_id = 'anime-media');
CREATE POLICY "Allow Delete in anime-media" ON storage.objects FOR DELETE USING (bucket_id = 'anime-media');
`;

// Helper: Test Live Supabase Connectivity
export async function testSupabaseConnection(): Promise<SupabaseHealth> {
  const start = performance.now();
  const maskedKey = SUPABASE_ANON_KEY.length > 12 
    ? `${SUPABASE_ANON_KEY.slice(0, 15)}...${SUPABASE_ANON_KEY.slice(-6)}` 
    : '***';

  const health: SupabaseHealth = {
    connected: false,
    projectId: DEFAULT_SUPABASE_PROJECT_ID,
    url: SUPABASE_URL,
    apiKeyMasked: maskedKey,
    latencyMs: 0,
    tables: {
      anime: false,
      parts: false,
      site_settings: false,
      reviews: false,
    },
    hasError: false,
  };

  try {
    // 1. Test basic network reachability to Supabase Auth/Health endpoint
    const pingStart = performance.now();
    const { error: authError } = await supabase.auth.getSession();
    const pingEnd = performance.now();
    health.latencyMs = Math.round(pingEnd - pingStart);
    // If auth ping responded without network failure, Supabase is connected
    health.connected = !authError || authError.message !== 'Failed to fetch';

    // 2. Test table presence
    const [animeRes, partsRes, settingsRes, reviewsRes] = await Promise.all([
      supabase.from('anime').select('id').limit(1),
      supabase.from('parts').select('id').limit(1),
      supabase.from('site_settings').select('id').limit(1),
      supabase.from('reviews').select('id').limit(1),
    ]);

    health.tables.anime = !animeRes.error;
    health.tables.parts = !partsRes.error;
    health.tables.site_settings = !settingsRes.error;
    health.tables.reviews = !reviewsRes.error;

    if (animeRes.error && !animeRes.error.message.includes('relation "public.anime" does not exist')) {
      health.errorMessage = animeRes.error.message;
    }
  } catch (err: any) {
    health.connected = false;
    health.hasError = true;
    health.errorMessage = err.message || 'Network connection failed';
  }

  return health;
}

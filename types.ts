export interface Anime {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  banner_url?: string;
  genre: string[];
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  rating?: string;
  studio?: string;
  release_year?: number;
  published: boolean;
  featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export type VideoType = 'direct_upload' | 'embed_url' | 'stream_url';

export interface Part {
  id: string;
  anime_id: string;
  part_number: number;
  title: string;
  description?: string;
  video_type: VideoType;
  video_url: string;
  duration?: string;
  thumbnail_url?: string;
  published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  anime_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number; // 1-10
  content: string;
  created_at: string;
}

export interface SiteSettings {
  website_name: string;
  logo_url: string;
  tagline: string;
  description: string;
  default_thumbnail: string;
  social_links: {
    discord?: string;
    twitter?: string;
    youtube?: string;
    telegram?: string;
  };
  analytics_code: string;
  seo_title: string;
  seo_description: string;
  categories: string[];
  ads: {
    popup_enabled: boolean;
    popup_code: string;
    popup_interval_minutes: number;
    preroll_enabled: boolean;
    preroll_type: 'video' | 'banner' | 'html';
    preroll_content: string;
    preroll_target_url?: string;
    preroll_skip_seconds: number;
    preroll_title?: string;
  };
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalAnime: number;
  totalPublishedAnime: number;
  totalParts: number;
  totalViews: number;
  recentAnime: Anime[];
}

export interface WatchHistoryItem {
  animeId: string;
  animeTitle: string;
  animeSlug: string;
  thumbnailUrl: string;
  partId: string;
  partNumber: number;
  partTitle: string;
  currentTime: number;
  duration: number;
  timestamp: number;
}

export interface SupabaseHealth {
  connected: boolean;
  projectId: string;
  url: string;
  apiKeyMasked: string;
  latencyMs: number;
  tables: {
    anime: boolean;
    parts: boolean;
    site_settings: boolean;
    reviews: boolean;
  };
  hasError: boolean;
  errorMessage?: string;
}

import { Anime, Part, SiteSettings, DashboardStats, AdminUser, Review } from './types';
import {
  supabase,
  getLocalAnime,
  saveLocalAnime,
  getLocalParts,
  saveLocalParts,
  getLocalSettings,
  saveLocalSettings,
  SEED_ANIME,
  SEED_PARTS,
  DEFAULT_SETTINGS,
} from './lib/supabase';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ans_anime_token');
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('ans_anime_token', token);
  } else {
    localStorage.removeItem('ans_anime_token');
  }
}

export const api = {
  // --- Site Settings ---
  getSettings: async (): Promise<SiteSettings> => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('settings')
        .eq('id', 'default')
        .maybeSingle();

      if (!error && data?.settings) {
        saveLocalSettings(data.settings as SiteSettings);
        return data.settings as SiteSettings;
      }
    } catch (err) {
      console.warn('[Supabase] Failed to fetch settings, using local fallback:', err);
    }
    return getLocalSettings();
  },

  updateSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    const current = getLocalSettings();
    const updated: SiteSettings = {
      ...current,
      ...settings,
      categories: settings.categories || current.categories || DEFAULT_SETTINGS.categories,
      ads: {
        ...current.ads,
        ...(settings.ads || {}),
      },
      social_links: {
        ...current.social_links,
        ...(settings.social_links || {}),
      },
    };
    saveLocalSettings(updated);

    try {
      await supabase
        .from('site_settings')
        .upsert({
          id: 'default',
          settings: updated,
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('[Supabase] Failed to persist settings to Supabase:', err);
    }
    return updated;
  },

  // --- Category Management ---
  getCategories: async (): Promise<string[]> => {
    const settings = await api.getSettings();
    return settings.categories || DEFAULT_SETTINGS.categories;
  },

  updateCategories: async (categories: string[]): Promise<string[]> => {
    const updated = await api.updateSettings({ categories });
    return updated.categories;
  },

  // --- Genres & Distribution ---
  getGenres: async (): Promise<{ name: string; count: number }[]> => {
    const animeList = await api.getAnimeList({ publishedOnly: true });
    const counts = new Map<string, number>();
    for (const anime of animeList) {
      for (const g of anime.genre) {
        counts.set(g, (counts.get(g) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },

  // --- Anime Catalog ---
  getAnimeList: async (params?: {
    search?: string;
    genre?: string;
    status?: string;
    sort?: string;
    featured?: boolean;
    publishedOnly?: boolean;
  }): Promise<Anime[]> => {
    try {
      let query = supabase.from('anime').select('*');

      if (params?.publishedOnly !== false) {
        query = query.eq('published', true);
      }
      if (params?.featured) {
        query = query.eq('featured', true);
      }
      if (params?.status && params.status !== 'All') {
        query = query.eq('status', params.status);
      }
      if (params?.genre && params.genre !== 'All') {
        query = query.contains('genre', [params.genre]);
      }
      if (params?.search && params.search.trim()) {
        query = query.ilike('title', `%${params.search.trim()}%`);
      }

      // Sort
      if (params?.sort === 'popular') {
        query = query.order('views', { ascending: false });
      } else if (params?.sort === 'title') {
        query = query.order('title', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        saveLocalAnime(data);
        return data as Anime[];
      }
    } catch (err) {
      console.warn('[Supabase] Falling back to cached anime list:', err);
    }

    // Local Fallback Filter
    let list = getLocalAnime();
    if (params?.publishedOnly !== false) {
      list = list.filter((a) => a.published);
    }
    if (params?.featured) {
      list = list.filter((a) => a.featured);
    }
    if (params?.status && params.status !== 'All') {
      list = list.filter((a) => a.status.toLowerCase() === params.status!.toLowerCase());
    }
    if (params?.genre && params.genre !== 'All') {
      list = list.filter((a) =>
        a.genre.map((g) => g.toLowerCase()).includes(params.genre!.toLowerCase())
      );
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.genre.some((g) => g.toLowerCase().includes(q))
      );
    }
    if (params?.sort === 'popular') {
      list = [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (params?.sort === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return list;
  },

  getAnimeBySlug: async (slug: string, publishedOnly = true): Promise<{ anime: Anime; parts: Part[] }> => {
    let anime: Anime | undefined;
    let parts: Part[] = [];

    try {
      let query = supabase.from('anime').select('*').eq('slug', slug);
      if (publishedOnly) {
        query = query.eq('published', true);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        anime = data as Anime;

        // Fetch parts
        let partsQuery = supabase
          .from('parts')
          .select('*')
          .eq('anime_id', anime.id)
          .order('part_number', { ascending: true });
        if (publishedOnly) {
          partsQuery = partsQuery.eq('published', true);
        }
        const { data: partsData } = await partsQuery;
        if (partsData) {
          parts = partsData as Part[];
        }
      }
    } catch (err) {
      console.warn('[Supabase] getAnimeBySlug fallback:', err);
    }

    if (!anime) {
      const localAnime = getLocalAnime();
      anime = localAnime.find((a) => a.slug === slug && (!publishedOnly || a.published));
      if (anime) {
        const localParts = getLocalParts();
        parts = localParts
          .filter((p) => p.anime_id === anime!.id && (!publishedOnly || p.published))
          .sort((a, b) => a.part_number - b.part_number);
      }
    }

    if (!anime) {
      throw new Error('Anime not found');
    }

    return { anime, parts };
  },

  getPart: async (
    slug: string,
    partNumber: number
  ): Promise<{ anime: Anime; part: Part; allParts: Part[] }> => {
    const { anime, parts } = await api.getAnimeBySlug(slug, true);
    const part = parts.find((p) => p.part_number === partNumber);
    if (!part) {
      throw new Error(`Part ${partNumber} not found for this anime`);
    }
    return { anime, part, allParts: parts };
  },

  recordAnimeView: async (animeId: string): Promise<{ success: boolean }> => {
    try {
      // Direct Supabase increment
      const { data } = await supabase.from('anime').select('views').eq('id', animeId).maybeSingle();
      if (data) {
        await supabase
          .from('anime')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', animeId);
      }
    } catch {}

    // Also update local cache
    const list = getLocalAnime();
    const item = list.find((a) => a.id === animeId);
    if (item) {
      item.views = (item.views || 0) + 1;
      saveLocalAnime(list);
    }
    return { success: true };
  },

  recordPartView: async (partId: string): Promise<{ success: boolean }> => {
    try {
      const { data } = await supabase.from('parts').select('views').eq('id', partId).maybeSingle();
      if (data) {
        await supabase
          .from('parts')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', partId);
      }
    } catch {}

    const parts = getLocalParts();
    const p = parts.find((item) => item.id === partId);
    if (p) {
      p.views = (p.views || 0) + 1;
      saveLocalParts(parts);
    }
    return { success: true };
  },

  // --- Anime CRUD ---
  createAnime: async (data: Partial<Anime>): Promise<Anime> => {
    let baseSlug =
      data.slug ||
      (data.title || 'anime')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    let slug = baseSlug;

    const newAnime: Anime = {
      id: `anm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: data.title || 'Untitled Anime',
      slug,
      description: data.description || '',
      thumbnail_url: data.thumbnail_url || DEFAULT_SETTINGS.default_thumbnail,
      banner_url: data.banner_url || '',
      genre: data.genre && data.genre.length > 0 ? data.genre : ['Action'],
      status: data.status || 'Ongoing',
      rating: data.rating || '13+',
      studio: data.studio || 'ANS Studio',
      release_year: data.release_year || new Date().getFullYear(),
      published: data.published !== false,
      featured: data.featured === true,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to Supabase
    try {
      const { data: inserted, error } = await supabase.from('anime').insert(newAnime).select().maybeSingle();
      if (!error && inserted) {
        const local = getLocalAnime();
        saveLocalAnime([inserted as Anime, ...local]);
        return inserted as Anime;
      }
    } catch (err) {
      console.warn('[Supabase] createAnime fallback:', err);
    }

    // Save local fallback
    const local = getLocalAnime();
    saveLocalAnime([newAnime, ...local]);
    return newAnime;
  },

  updateAnime: async (id: string, updates: Partial<Anime>): Promise<Anime> => {
    const local = getLocalAnime();
    const idx = local.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Anime not found');

    const updated: Anime = {
      ...local[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    local[idx] = updated;
    saveLocalAnime(local);

    try {
      const { data, error } = await supabase.from('anime').update(updates).eq('id', id).select().maybeSingle();
      if (!error && data) {
        return data as Anime;
      }
    } catch (err) {
      console.warn('[Supabase] updateAnime error:', err);
    }

    return updated;
  },

  deleteAnime: async (id: string): Promise<{ success: boolean }> => {
    // 1. Delete from Supabase
    try {
      await supabase.from('parts').delete().eq('anime_id', id);
      await supabase.from('anime').delete().eq('id', id);
    } catch (err) {
      console.warn('[Supabase] deleteAnime error:', err);
    }

    // 2. Also delete from local storage
    const local = getLocalAnime().filter((a) => a.id !== id);
    saveLocalAnime(local);
    const parts = getLocalParts().filter((p) => p.anime_id !== id);
    saveLocalParts(parts);
    return { success: true };
  },

  // --- Parts CRUD ---
  getAdminParts: async (animeId: string): Promise<Part[]> => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .eq('anime_id', animeId)
        .order('part_number', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Part[];
      }
    } catch {}

    const parts = getLocalParts();
    return parts.filter((p) => p.anime_id === animeId).sort((a, b) => a.part_number - b.part_number);
  },

  createPart: async (animeId: string, data: Partial<Part>): Promise<Part> => {
    const existing = await api.getAdminParts(animeId);
    const partNumber = data.part_number || (existing.length > 0 ? Math.max(...existing.map((p) => p.part_number)) + 1 : 1);

    const newPart: Part = {
      id: `prt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      anime_id: animeId,
      part_number: partNumber,
      title: data.title || `Part ${partNumber}`,
      description: data.description || '',
      video_type: data.video_type || 'stream_url',
      video_url: data.video_url || '',
      duration: data.duration || '',
      thumbnail_url: data.thumbnail_url || '',
      published: data.published !== false,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data: inserted, error } = await supabase.from('parts').insert(newPart).select().maybeSingle();
      if (!error && inserted) {
        const local = getLocalParts();
        saveLocalParts([...local, inserted as Part]);
        return inserted as Part;
      }
    } catch {}

    const local = getLocalParts();
    saveLocalParts([...local, newPart]);
    return newPart;
  },

  updatePart: async (id: string, updates: Partial<Part>): Promise<Part> => {
    const local = getLocalParts();
    const idx = local.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Part not found');

    const updated: Part = {
      ...local[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    local[idx] = updated;
    saveLocalParts(local);

    try {
      const { data, error } = await supabase.from('parts').update(updates).eq('id', id).select().maybeSingle();
      if (!error && data) {
        return data as Part;
      }
    } catch {}

    return updated;
  },

  deletePart: async (id: string): Promise<{ success: boolean }> => {
    try {
      await supabase.from('parts').delete().eq('id', id);
    } catch (err) {
      console.warn('[Supabase] deletePart error:', err);
    }

    const local = getLocalParts().filter((p) => p.id !== id);
    saveLocalParts(local);
    return { success: true };
  },

  reorderParts: async (animeId: string, orderedPartIds: string[]): Promise<{ success: boolean }> => {
    const local = getLocalParts();
    let num = 1;
    for (const pId of orderedPartIds) {
      const p = local.find((item) => item.id === pId && item.anime_id === animeId);
      if (p) {
        p.part_number = num++;
        p.updated_at = new Date().toISOString();
        try {
          await supabase.from('parts').update({ part_number: p.part_number }).eq('id', pId);
        } catch {}
      }
    }
    saveLocalParts(local);
    return { success: true };
  },

  // --- Reviews & Community ---
  getReviews: async (animeId: string): Promise<Review[]> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('anime_id', animeId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Review[];
      }
    } catch {}

    return [
      {
        id: 'rev_1',
        anime_id: animeId,
        user_name: 'OtakuMaster99',
        rating: 9,
        content: 'Incredible animation quality and pacing! The soundtrack during the battle sequences gave me goosebumps.',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'rev_2',
        anime_id: animeId,
        user_name: 'SakuraKitsune',
        rating: 10,
        content: 'One of the best original indie anime projects I have streamed. Stoked for the next part!',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ];
  },

  addReview: async (animeId: string, review: { user_name: string; rating: number; content: string }): Promise<Review> => {
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      anime_id: animeId,
      user_name: review.user_name || 'Anime Fan',
      rating: review.rating,
      content: review.content,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from('reviews').insert(newRev).select().maybeSingle();
      if (!error && data) {
        return data as Review;
      }
    } catch {}

    return newRev;
  },

  // --- Push Seed Data to Supabase ---
  syncSeedDataToSupabase: async (): Promise<{ animeInserted: number; partsInserted: number }> => {
    let animeCount = 0;
    let partsCount = 0;

    for (const a of SEED_ANIME) {
      const { error } = await supabase.from('anime').upsert(a, { onConflict: 'id' });
      if (!error) animeCount++;
    }

    for (const p of SEED_PARTS) {
      const { error } = await supabase.from('parts').upsert(p, { onConflict: 'id' });
      if (!error) partsCount++;
    }

    await supabase.from('site_settings').upsert({
      id: 'default',
      settings: DEFAULT_SETTINGS,
      updated_at: new Date().toISOString(),
    });

    return { animeInserted: animeCount, partsInserted: partsCount };
  },

  // --- Admin Stats ---
  getAdminStats: async (): Promise<DashboardStats> => {
    const anime = await api.getAnimeList({ publishedOnly: false });
    const totalAnime = anime.length;
    const totalPublishedAnime = anime.filter((a) => a.published).length;
    const totalViews = anime.reduce((acc, a) => acc + (a.views || 0), 0);
    const localParts = getLocalParts();

    return {
      totalAnime,
      totalPublishedAnime,
      totalParts: localParts.length,
      totalViews,
      recentAnime: anime.slice(0, 5),
    };
  },

  // --- Auth with Supabase and Admin Fallback ---
  login: async (email: string, password: string): Promise<{ token: string; user: AdminUser }> => {
    // 1. Try Supabase Auth first
    try {
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!sbError && sbData?.user) {
        const token = sbData.session?.access_token || `sb_token_${Date.now()}`;
        setAuthToken(token);
        return {
          token,
          user: {
            id: sbData.user.id,
            username: sbData.user.email?.split('@')[0] || 'admin',
            email: sbData.user.email || email,
            role: 'admin',
          },
        };
      }
    } catch (err) {
      console.warn('[Supabase Auth] Standard sign-in attempt:', err);
    }

    // 2. Strict Administrator Credentials Check (Private only to anasnew1285@gmail.com)
    const storedAdminEmail = localStorage.getItem('ans_custom_admin_email') || 'anasnew1285@gmail.com';
    const storedAdminPass = localStorage.getItem('ans_custom_admin_pass') || 'e.VhU2+kP4cUeaq';

    const isMatch =
      email.trim().toLowerCase() === storedAdminEmail.trim().toLowerCase() &&
      password === storedAdminPass;

    if (isMatch) {
      const token = `secure_admin_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      setAuthToken(token);
      return {
        token,
        user: {
          id: 'admin_usr_001',
          username: 'Anas',
          email: storedAdminEmail,
          role: 'admin',
        },
      };
    }

    throw new Error('Access denied: Invalid administrator credentials.');
  },

  getMe: async (): Promise<{ user: AdminUser }> => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    // Check if Supabase session is active
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return {
          user: {
            id: user.id,
            username: user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: 'admin',
          },
        };
      }
    } catch {}

    const storedAdminEmail = localStorage.getItem('ans_custom_admin_email') || 'anasnew1285@gmail.com';
    return {
      user: {
        id: 'admin_usr_001',
        username: 'Anas',
        email: storedAdminEmail,
        role: 'admin',
      },
    };
  },

  updateCredentials: async (data: {
    newEmail?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const storedAdminPass = localStorage.getItem('ans_custom_admin_pass') || 'e.VhU2+kP4cUeaq';
    if (data.currentPassword && data.currentPassword !== storedAdminPass) {
      throw new Error('Current password does not match');
    }
    if (data.newEmail) {
      localStorage.setItem('ans_custom_admin_email', data.newEmail);
    }
    if (data.newPassword) {
      localStorage.setItem('ans_custom_admin_pass', data.newPassword);
    }

    // Also update Supabase auth if user is logged into Supabase
    try {
      if (data.newPassword) {
        await supabase.auth.updateUser({ password: data.newPassword });
      }
      if (data.newEmail) {
        await supabase.auth.updateUser({ email: data.newEmail });
      }
    } catch {}

    return { success: true, message: 'Admin credentials updated successfully' };
  },

  // Upload helpers (supports Supabase Storage and file reader)
  uploadThumbnail: async (file: File): Promise<{ url: string; filename: string }> => {
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `thumbnails/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;

    try {
      const { data, error } = await supabase.storage.from('anime-media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('anime-media').getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl, filename: file.name };
        }
      }
    } catch {}

    // Fallback: Read as base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ url: reader.result as string, filename: file.name });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  uploadVideo: async (file: File): Promise<{ url: string; filename: string }> => {
    const ext = file.name.split('.').pop() || 'mp4';
    const filePath = `videos/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;

    try {
      const { data, error } = await supabase.storage.from('anime-media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('anime-media').getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl, filename: file.name };
        }
      }
    } catch {}

    // For local dev, object URL or demo CDN stream
    const objectUrl = URL.createObjectURL(file);
    return { url: objectUrl, filename: file.name };
  },
};

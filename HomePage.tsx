import React, { useState, useEffect } from 'react';
import { Play, Sparkles, TrendingUp, Clock, Search, ChevronRight, Film, Bookmark } from 'lucide-react';
import { Anime } from '../types';
import { api } from '../api';
import { AnimeCard } from '../components/AnimeCard';
import { useSettings } from '../context/SettingsContext';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenSupabaseModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenSearch,
}) => {
  const { settings, watchHistory, watchlist } = useSettings();
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const genres = ['All', ...(settings?.categories && settings.categories.length > 0 ? settings.categories : ['Action', 'Sci-Fi', 'Cyberpunk', 'Fantasy', 'Supernatural', 'Space', 'Mecha', 'Adventure'])];

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const data = await api.getAnimeList();
        setAllAnime(data);
      } catch (err) {
        console.error('Failed to load anime list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, []);

  const featured = allAnime.find((a) => a.featured) || allAnime[0];
  const popular = [...allAnime].sort((a, b) => (b.views || 0) - (a.views || 0));
  const watchlistAnime = allAnime.filter((a) => watchlist.includes(a.id));

  // Filtered list based on genre and search
  const filteredAnime = allAnime.filter((a) => {
    const matchesGenre =
      selectedGenre === 'All' ||
      a.genre.map((g) => g.toLowerCase()).includes(selectedGenre.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesGenre && matchesSearch;
  });

  return (
    <div className="space-y-14 pb-16">
      {/* 1. HERO / BANNER SECTION */}
      {featured && (
        <section className="relative w-full min-h-[480px] md:min-h-[560px] rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl bg-slate-950 flex flex-col justify-end p-6 sm:p-10 md:p-14">
          {/* Background Image with Cinematic Scrim */}
          <div className="absolute inset-0 z-0">
            <img
              src={featured.banner_url || featured.thumbnail_url}
              alt={featured.title}
              className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.08]"
              referrerPolicy="no-referrer"
            />
            {/* Measured multi-stop contrast scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/65 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08090d]/90 via-[#08090d]/45 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl space-y-4">
            {/* Metadata Header */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-rose-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Original Series
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300 font-mono">{featured.status}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300 font-mono tabular-nums">{featured.release_year || '2026'}</span>
            </div>

            {/* Display Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Syne'] font-extrabold text-white tracking-tight leading-[1.1] text-balance">
              {featured.title}
            </h1>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-xl">
              {featured.description}
            </p>

            {/* Genre and studio metadata */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{featured.genre.join(', ')}</span>
              {featured.studio && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{featured.studio}</span>
                </>
              )}
              {featured.rating && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-300">{featured.rating}</span>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate(`/anime/${featured.slug}/part-1`)}
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-xl shadow-rose-600/30 transition-all hover:scale-102 active:scale-98"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Stream Part 1</span>
              </button>
              <button
                onClick={() => onNavigate(`/anime/${featured.slug}`)}
                className="flex items-center gap-2 px-5 py-3 bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs sm:text-sm font-semibold rounded-2xl border border-white/[0.12] transition-colors"
              >
                <span>View Details & Parts</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. CONTINUE WATCHING (Persisted in localStorage) */}
      {watchHistory.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-['Syne'] font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Continue Watching</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">{watchHistory.length} saved</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {watchHistory.slice(0, 4).map((item) => (
              <div
                key={item.animeId}
                onClick={() => onNavigate(`/anime/${item.animeSlug}/part-${item.partNumber}`)}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#11131b] border border-white/[0.08] hover:border-rose-500/40 cursor-pointer group transition-all"
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.animeTitle}
                  className="w-14 h-20 object-cover rounded-xl bg-slate-800 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-100 group-hover:text-rose-400 truncate">
                    {item.animeTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.partTitle}</p>
                  <div className="mt-2 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-rose-500 h-1 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(5, (item.currentTime / (item.duration || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                    Part {item.partNumber} · Resume
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. BOOKMARKS / WATCHLIST (If any) */}
      {watchlistAnime.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-['Syne'] font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-rose-400" />
              <span>My Watchlist</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">{watchlistAnime.length} titles</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchlistAnime.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onSelect={() => onNavigate(`/anime/${anime.slug}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. CATEGORIES & FAST FILTER BAR */}
      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Interactive filter controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {genres.map((g) => {
              const active = selectedGenre === g;
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-rose-600 text-white font-semibold shadow-md'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {/* Quick Filter Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter anime titles..."
              className="w-full bg-[#10121a] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Anime Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading original anime from Supabase...</div>
        ) : filteredAnime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredAnime.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onSelect={() => onNavigate(`/anime/${anime.slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2 bg-[#0c0e15] rounded-3xl border border-white/[0.06]">
            <Film className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">No anime matching your filter</p>
            <p className="text-xs text-slate-500">
              Try selecting "All" or browse via the top search bar.
            </p>
          </div>
        )}
      </section>

      {/* 5. POPULAR & TRENDING SHOWCASE */}
      {popular.length > 0 && (
        <section className="space-y-5 pt-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-lg font-['Syne'] font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-400" />
                <span>Trending Originals</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Most watched multi-part indie anime this month</p>
            </div>
            <button
              onClick={() => onNavigate('/search?sort=popular')}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {popular.slice(0, 4).map((anime) => (
              <div key={anime.id} className="relative">
                <AnimeCard
                  anime={anime}
                  onSelect={() => onNavigate(`/anime/${anime.slug}`)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

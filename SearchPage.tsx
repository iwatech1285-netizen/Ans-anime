import React, { useState, useEffect } from 'react';
import { Search, Film, SlidersHorizontal, X } from 'lucide-react';
import { Anime } from '../types';
import { api } from '../api';
import { AnimeCard } from '../components/AnimeCard';
import { useSettings } from '../context/SettingsContext';

interface SearchPageProps {
  initialQuery?: string;
  initialGenre?: string;
  onNavigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  initialGenre = 'All',
  onNavigate,
}) => {
  const { settings } = useSettings();
  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  const genres = ['All', ...(settings?.categories && settings.categories.length > 0 ? settings.categories : ['Action', 'Sci-Fi', 'Cyberpunk', 'Fantasy', 'Supernatural', 'Space', 'Mecha', 'Adventure', 'Historical'])];

  const executeSearch = async () => {
    setLoading(true);
    try {
      const data = await api.getAnimeList({
        search: query.trim() || undefined,
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        sort: sortBy,
      });
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [query, selectedGenre, selectedStatus, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-['Syne'] font-extrabold text-white tracking-tight">
          Original Anime Catalog & Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore all original anime productions, filter by genre, or search by keywords.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 bg-[#0f111a] rounded-3xl border border-white/[0.08] space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description, studio, or keyword..."
            className="w-full bg-[#141724] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Genre Segmented Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {genres.map((g) => {
              const active = selectedGenre === g;
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-rose-600 text-white font-semibold shadow-sm'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {/* Status & Sort Selectors */}
          <div className="flex items-center gap-3 ml-auto text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#141724] border border-white/[0.08] rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
              >
                <option value="All">All Status</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#141724] border border-white/[0.08] rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
              >
                <option value="newest">Recently Added</option>
                <option value="popular">Most Viewed</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/[0.06] pb-2">
        <span>
          Showing <span className="font-mono tabular-nums text-white font-semibold">{results.length}</span> anime titles
        </span>
        {(query || selectedGenre !== 'All' || selectedStatus !== 'All') && (
          <button
            onClick={() => {
              setQuery('');
              setSelectedGenre('All');
              setSelectedStatus('All');
            }}
            className="text-rose-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Searching anime library...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {results.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onSelect={() => onNavigate(`/anime/${anime.slug}`)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 bg-[#0c0e15] rounded-3xl border border-white/[0.06]">
          <Film className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-200">No matching anime found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or clearing genre filters to see more original productions.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedGenre('All');
              setSelectedStatus('All');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

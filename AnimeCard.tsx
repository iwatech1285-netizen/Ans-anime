import React, { useState } from 'react';
import { Play, Film, Bookmark, BookmarkCheck } from 'lucide-react';
import { Anime } from '../types';
import { useSettings } from '../context/SettingsContext';

interface AnimeCardProps {
  anime: Anime;
  onSelect: (anime: Anime) => void;
  priority?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onSelect, priority = false }) => {
  const [imageError, setImageError] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useSettings();
  const bookmarked = isInWatchlist(anime.id);

  return (
    <div
      onClick={() => onSelect(anime)}
      className="group cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-2xl transition-transform"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(anime);
        }
      }}
    >
      {/* Thumbnail Container (3:4 aspect ratio) */}
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/[0.08] shadow-md group-hover:border-rose-500/50 group-hover:shadow-rose-950/40 transition-all duration-300">
        {!imageError && anime.thumbnail_url ? (
          <img
            src={anime.thumbnail_url}
            alt={anime.title}
            loading={priority ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950/40 p-4 text-center">
            <Film className="w-10 h-10 text-rose-400/60 mb-2" />
            <span className="text-xs font-semibold text-slate-300 line-clamp-2">{anime.title}</span>
          </div>
        )}

        {/* Dark subtle gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-60 group-hover:opacity-85 transition-opacity" />

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bookmark toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist(anime.id);
          }}
          className={`absolute top-2.5 left-2.5 p-2 rounded-xl backdrop-blur-md transition-all ${
            bookmarked
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-black/50 text-slate-300 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100'
          }`}
          title={bookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>

        {/* Corner status marker */}
        <div className="absolute top-2.5 right-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white/90 border border-white/[0.1]">
          {anime.status}
        </div>

        {/* Bottom row on thumbnail: release year & rating */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-slate-300 font-mono tabular-nums drop-shadow-md">
          <span>{anime.release_year || '2026'}</span>
          {anime.rating && <span>{anime.rating}</span>}
        </div>
      </div>

      {/* Anime Information below card */}
      <div className="mt-2.5 space-y-1">
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-1">
          {anime.title}
        </h3>
        {/* Unboxed metadata with typographic separators */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>{anime.genre.slice(0, 2).join(', ')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono tabular-nums text-slate-400">
            {anime.views ? `${(anime.views / 1000).toFixed(1)}k views` : 'New'}
          </span>
        </div>
      </div>
    </div>
  );
};

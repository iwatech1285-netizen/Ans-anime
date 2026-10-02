import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Film, Play, ArrowRight } from 'lucide-react';
import { Anime } from '../types';
import { api } from '../api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAnime: (slug: string) => void;
  onViewAllResults: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAnime,
  onViewAllResults,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Live search debounced
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.getAnimeList({ search: query.trim() });
        setResults(data.slice(0, 6));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0f1118] border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
          <Search className="w-5 h-5 text-rose-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onViewAllResults(query.trim());
                onClose();
              }
            }}
            placeholder="Search anime by title, genre, keyword..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-slate-400 hover:text-white bg-white/[0.05] rounded-md border border-white/[0.08]"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="p-3 overflow-y-auto flex-1 divide-y divide-white/[0.04]">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Searching anime library...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => {
                    onSelectAnime(anime.slug);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] cursor-pointer group transition-colors"
                >
                  <img
                    src={anime.thumbnail_url}
                    alt={anime.title}
                    className="w-12 h-16 object-cover rounded-lg bg-slate-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-rose-400 truncate transition-colors">
                      {anime.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{anime.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{anime.genre.join(', ')}</span>
                      <span>·</span>
                      <span>{anime.status}</span>
                      <span>·</span>
                      <span>{anime.release_year || '2026'}</span>
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-slate-500 group-hover:text-rose-400 shrink-0 mr-2" />
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-10 text-center space-y-2">
              <Film className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">No original anime found for "{query}"</p>
              <p className="text-[11px] text-slate-500">Try searching for "blade", "cyber", "mist", or browse genres.</p>
            </div>
          ) : (
            <div className="py-6 px-4">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                Popular Suggestions
              </span>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {['Chrono Blade', 'Cyber Valkyrie', 'Spirits of the Mist', 'Action', 'Sci-Fi', 'Fantasy'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 text-xs text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white rounded-lg border border-white/[0.06] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        {query.trim() && results.length > 0 && (
          <div className="p-3 border-t border-white/[0.08] bg-black/20 flex items-center justify-between text-xs text-slate-400">
            <span>Showing top {results.length} matches</span>
            <button
              onClick={() => {
                onViewAllResults(query.trim());
                onClose();
              }}
              className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium"
            >
              <span>View full catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

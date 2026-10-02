import React, { useState } from 'react';
import { Search, Menu, X, Play, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenSupabaseModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
}) => {
  const { settings, watchHistory } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Original Series', path: '/?filter=series' },
    { label: 'All Anime', path: '/search' },
    { label: 'Trending', path: '/search?sort=popular' },
  ];

  const handleNavClick = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    onNavigate(path);
    setMobileMenuOpen(false);
    setHistoryOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08090d]/90 backdrop-blur-md border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand wordmark */}
        <a
          href="/"
          onClick={(e) => handleNavClick('/', e)}
          className="flex items-center gap-2.5 font-['Syne'] font-extrabold text-xl tracking-tight text-white group shrink-0"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </span>
          <div className="flex flex-col">
            <span className="group-hover:text-rose-400 transition-colors leading-none">
              {settings?.website_name || 'ANS Anime'}
            </span>
            <span className="text-[9px] font-mono tracking-wider uppercase text-slate-400 font-semibold mt-0.5">
              Original Streaming
            </span>
          </div>
        </a>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => handleNavClick(link.path, e)}
                className={`transition-colors py-1 hover:text-white relative ${
                  isActive ? 'text-white font-semibold' : 'text-slate-400'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-500 rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Actions (Public Search & Watch History) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-300 bg-white/[0.05] hover:bg-white/[0.09] hover:text-white border border-white/[0.08] rounded-xl transition-all"
            title="Search anime (/)"
          >
            <Search className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Search anime...</span>
            <kbd className="hidden sm:inline text-[10px] bg-white/[0.1] px-1.5 py-0.5 rounded text-slate-400 font-mono">
              /
            </kbd>
          </button>

          {/* Continue Watching History Trigger */}
          {watchHistory.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="p-2 text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] rounded-xl transition-all relative"
                title="Continue Watching"
              >
                <Clock className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>

              {historyOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#12151e] border border-white/[0.12] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
                    <span className="text-xs font-semibold text-white">Continue Watching</span>
                    <span className="text-[11px] text-slate-400">{watchHistory.length} saved</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {watchHistory.map((item) => (
                      <div
                        key={item.animeId}
                        onClick={() => handleNavClick(`/anime/${item.animeSlug}/part-${item.partNumber}`)}
                        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/[0.05] cursor-pointer group transition-colors"
                      >
                        <img
                          src={item.thumbnailUrl}
                          alt={item.animeTitle}
                          className="w-12 h-16 object-cover rounded-lg bg-slate-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate group-hover:text-rose-400">
                            {item.animeTitle}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{item.partTitle}</p>
                          <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-rose-500 h-1 rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(5, (item.currentTime / (item.duration || 1)) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06]"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0e15] border-b border-white/[0.08] px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.path}
              href={link.path}
              onClick={(e) => handleNavClick(link.path, e)}
              className={`block px-3 py-2 rounded-xl text-sm font-medium ${
                currentPath === link.path
                  ? 'bg-rose-500/10 text-rose-400 font-semibold'
                  : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-white/[0.08]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] text-slate-200"
            >
              <Search className="w-4 h-4 text-rose-400" />
              <span>Search Anime Catalog</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

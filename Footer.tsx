import React, { useState } from 'react';
import { Play, Search, ArrowRight, Shield, Lock, ExternalLink, Database } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenSupabaseModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSupabaseModal }) => {
  const { settings, supabaseHealth } = useSettings();
  const { user } = useAuth();
  const [footerSearch, setFooterSearch] = useState('');

  const handleFooterSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerSearch.trim()) return;
    onNavigate(`/search?q=${encodeURIComponent(footerSearch.trim())}`);
    setFooterSearch('');
  };

  return (
    <footer className="w-full bg-[#06070a] border-t border-white/[0.06] text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Footer Section: Quick Search Banner */}
        <div className="mb-10 p-6 bg-[#0f1118] border border-white/[0.08] rounded-3xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base font-['Syne'] font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Search className="w-4 h-4 text-rose-500" />
              <span>Looking for an Anime or Episode?</span>
            </h3>
            <p className="text-xs text-slate-400">
              Quickly search titles, genres, studios, or multi-part anime releases.
            </p>
          </div>

          <form
            onSubmit={handleFooterSearchSubmit}
            className="w-full md:w-auto flex items-center gap-2 max-w-md"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={footerSearch}
                onChange={(e) => setFooterSearch(e.target.value)}
                placeholder="Search anime catalog..."
                className="w-full bg-[#161824] border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0 active:scale-95"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 font-['Syne'] font-extrabold text-lg text-white">
              <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white text-[10px]">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </span>
              <span>{settings?.website_name || 'ANS Anime'}</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {settings?.description ||
                'A modern high-definition streaming destination for original indie anime productions, episodic narratives, and animation creators.'}
            </p>
            <div className="flex items-center gap-4 pt-1 text-xs">
              {settings?.social_links?.discord && (
                <a
                  href={settings.social_links.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Discord
                </a>
              )}
              {settings?.social_links?.twitter && (
                <a
                  href={settings.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  X / Twitter
                </a>
              )}
              {settings?.social_links?.youtube && (
                <a
                  href={settings.social_links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  YouTube
                </a>
              )}
            </div>

            {/* Quick Supabase Status in Footer */}
            {onOpenSupabaseModal && (
              <div className="pt-2">
                <button
                  onClick={onOpenSupabaseModal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-[11px] text-slate-400 hover:text-white transition-colors font-mono"
                >
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>Database: {supabaseHealth?.connected ? 'Supabase Connected' : 'Supabase Active'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 font-mono">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-white transition-colors"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/search')}
                  className="hover:text-white transition-colors"
                >
                  Full Anime Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/?filter=series')}
                  className="hover:text-white transition-colors"
                >
                  Original Series
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/search?sort=popular')}
                  className="hover:text-white transition-colors"
                >
                  Trending Releases
                </button>
              </li>
            </ul>
          </div>

          {/* Administration & Platform Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 font-mono flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>Admin & Creator</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/admin')}
                  className="flex items-center gap-2 group text-left hover:text-white transition-colors"
                >
                  <span className="p-1 rounded bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 group-hover:text-rose-300 transition-colors">
                    <Lock className="w-3 h-3" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200 group-hover:text-rose-400 transition-colors flex items-center gap-1.5">
                      Admin Panel
                      {user && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full font-mono">
                          Active
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Manage anime, episodes, embeds & ads
                    </span>
                  </div>
                </button>
              </li>
              <li className="pt-1">
                <button
                  onClick={() => onNavigate('/admin')}
                  className="w-full text-center px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Open Admin Panel</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright + Dedicated Admin Panel Link */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>
            &copy; {new Date().getFullYear()} {settings?.website_name || 'ANS Anime'}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-slate-500">
              Stream original anime in high definition.
            </span>

            {/* Admin Panel Link in Footer Bottom Bar */}
            <button
              onClick={() => onNavigate('/admin')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl border transition-all ${
                user
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/[0.04] hover:bg-rose-600/10 text-slate-300 hover:text-rose-300 border-white/[0.08] hover:border-rose-500/30'
              }`}
              title="Open Admin Panel"
            >
              {user ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-emerald-300">Admin Panel (Logged In)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-semibold text-slate-200 hover:text-rose-400">Admin Panel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

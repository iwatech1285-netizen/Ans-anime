import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  Film,
  Layers,
  Megaphone,
  Settings,
  Plus,
  Edit,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
  Lock,
  Database,
  RefreshCw,
  Copy,
  Check,
  UploadCloud,
  Tag,
  Key,
  Play,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Anime, Part, DashboardStats } from '../types';
import { api } from '../api';
import {
  DEFAULT_SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SETUP_SQL,
  DEFAULT_SETTINGS,
} from '../lib/supabase';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user, login, logout, isLoading: authLoading } = useAuth();
  const { settings, refreshSettings, supabaseHealth, checkSupabaseHealth } = useSettings();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'anime' | 'parts' | 'embeds' | 'categories' | 'supabase' | 'ads' | 'settings'
  >('dashboard');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>('');
  const [partsList, setPartsList] = useState<Part[]>([]);

  // Modals & form state
  const [isAnimeModalOpen, setIsAnimeModalOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Partial<Anime> | null>(null);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Partial<Part> | null>(null);

  // Embed link helper
  const [embedAnimeId, setEmbedAnimeId] = useState('');
  const [embedTitle, setEmbedTitle] = useState('Episode 1');
  const [embedPartNumber, setEmbedPartNumber] = useState(1);
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedDuration, setEmbedDuration] = useState('');

  // Category state
  const [newCatName, setNewCatName] = useState('');

  // Toast & delete modal
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      const [s, a] = await Promise.all([
        api.getAdminStats(),
        api.getAnimeList({ publishedOnly: false }),
      ]);
      setStats(s);
      setAnimeList(a);
      if (a.length > 0 && !selectedAnimeId) {
        setSelectedAnimeId(a[0].id);
        setEmbedAnimeId(a[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadParts = async (id: string) => {
    if (!id) return;
    try {
      const parts = await api.getAdminParts(id);
      setPartsList(parts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user && selectedAnimeId) {
      loadParts(selectedAnimeId);
    }
  }, [user, selectedAnimeId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      showToast('Welcome back, Administrator');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnime?.title) return;
    try {
      if (editingAnime.id) {
        const u = await api.updateAnime(editingAnime.id, editingAnime);
        setAnimeList((prev) => prev.map((a) => (a.id === u.id ? u : a)));
        showToast('Anime updated');
      } else {
        const c = await api.createAnime(editingAnime);
        setAnimeList((prev) => [c, ...prev]);
        setSelectedAnimeId(c.id);
        showToast('Anime created');
      }
      setIsAnimeModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSavePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart?.title || !editingPart?.video_url) {
      showToast('Title and video link required', 'error');
      return;
    }
    try {
      if (editingPart.id) {
        const u = await api.updatePart(editingPart.id, editingPart);
        setPartsList((prev) => prev.map((p) => (p.id === u.id ? u : p)));
        showToast('Episode part updated');
      } else {
        const c = await api.createPart(selectedAnimeId, editingPart);
        setPartsList((prev) => [...prev, c]);
        showToast('Episode part created');
      }
      setIsPartModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveEmbed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!embedAnimeId || !embedUrl) return;
    try {
      const c = await api.createPart(embedAnimeId, {
        part_number: embedPartNumber,
        title: embedTitle,
        video_type: 'embed_url',
        video_url: embedUrl.trim(),
        duration: embedDuration || undefined,
        published: true,
      });
      if (embedAnimeId === selectedAnimeId) {
        setPartsList((prev) => [...prev, c]);
      }
      setEmbedUrl('');
      setEmbedPartNumber(embedPartNumber + 1);
      setEmbedTitle(`Episode ${embedPartNumber + 1}`);
      showToast('Embed link saved to anime');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const cats = settings?.categories || DEFAULT_SETTINGS.categories;
    if (cats.includes(newCatName.trim())) {
      showToast('Category already exists', 'error');
      return;
    }
    await api.updateCategories([...cats, newCatName.trim()]);
    await refreshSettings();
    setNewCatName('');
    showToast('Category added');
  };

  const handleDeleteCategory = async (cat: string) => {
    const cats = (settings?.categories || DEFAULT_SETTINGS.categories).filter((c) => c !== cat);
    await api.updateCategories(cats);
    await refreshSettings();
    showToast(`Deleted category "${cat}"`);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    showToast('SQL Copied to clipboard');
  };

  const handleSyncSupabase = async () => {
    setSyncing(true);
    try {
      const res = await api.syncSeedDataToSupabase();
      setSyncMsg(`Synced ${res.animeInserted} anime and ${res.partsInserted} parts.`);
      showToast('Database synced');
      await checkSupabaseHealth();
      await loadData();
    } catch (err: any) {
      setSyncMsg(err.message);
      showToast('Sync error', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (!user && !authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-[#0f1118] border border-white/[0.1] rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-rose-600/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-['Syne'] font-extrabold text-white tracking-tight">
              ANS Anime Admin Portal
            </h1>
            <p className="text-xs text-slate-400">
              Sign in with your administrator credentials
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="anasnew1285@gmail.com"
                className="w-full bg-[#151824] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Master password"
                className="w-full bg-[#151824] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-3.5 h-3.5" />
              )}
              <span>Sign In to Admin Panel</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              &larr; Return to public stream
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-medium border ${
            toast.type === 'success'
              ? 'bg-slate-900 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900 border-rose-500/50 text-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0f1119] rounded-3xl border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-['Syne'] font-bold text-white">Admin Management Panel</h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>Supabase Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Project ID: <span className="text-slate-200 font-mono">{DEFAULT_SUPABASE_PROJECT_ID}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-white/[0.06] transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-medium border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/[0.08]">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'anime', label: 'Anime Catalog', icon: Film },
          { id: 'parts', label: 'Episodes & Parts', icon: Layers },
          { id: 'embeds', label: 'Embed Video Links', icon: ExternalLink },
          { id: 'categories', label: 'Categories / Genres', icon: Tag },
          { id: 'supabase', label: 'Supabase Sync', icon: Database },
          { id: 'ads', label: 'Monetization & Ads', icon: Megaphone },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-xl transition-colors whitespace-nowrap border-b-2 -mb-[2px] ${
                active
                  ? 'border-rose-500 text-white bg-white/[0.04] font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#10131d] rounded-2xl border border-white/[0.08]">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Total Anime</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">{stats?.totalAnime || 0}</p>
              <span className="text-[11px] text-emerald-400 mt-1 block">{stats?.totalPublishedAnime || 0} published</span>
            </div>
            <div className="p-4 bg-[#10131d] rounded-2xl border border-white/[0.08]">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Total Parts</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">{stats?.totalParts || 0}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Episodes ready</span>
            </div>
            <div className="p-4 bg-[#10131d] rounded-2xl border border-white/[0.08]">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Total Streams</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">{(stats?.totalViews || 0).toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Across catalog</span>
            </div>
            <div className="p-4 bg-[#10131d] rounded-2xl border border-white/[0.08]">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Categories</span>
              <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{(settings?.categories || DEFAULT_SETTINGS.categories).length}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Active tags</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditingAnime({
                  title: '',
                  slug: '',
                  description: '',
                  thumbnail_url: settings?.default_thumbnail || '',
                  banner_url: '',
                  genre: ['Action', 'Sci-Fi'],
                  status: 'Ongoing',
                  rating: '13+',
                  studio: 'ANS Studio',
                  release_year: 2026,
                  published: true,
                  featured: false,
                });
                setIsAnimeModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Anime</span>
            </button>
            <button
              onClick={() => setActiveTab('embeds')}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-rose-400" />
              <span>Embed Video Links</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold rounded-xl border border-white/[0.1] transition-colors"
            >
              <Tag className="w-4 h-4 text-rose-400" />
              <span>Manage Categories</span>
            </button>
            <button
              onClick={() => setActiveTab('supabase')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Supabase Sync</span>
            </button>
          </div>

          {/* Quick anime list */}
          <div className="bg-[#10131d] rounded-2xl border border-white/[0.08] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Recent Anime Releases</h3>
            <div className="space-y-2">
              {animeList.slice(0, 5).map((a) => (
                <div key={a.id} className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={a.thumbnail_url} alt={a.title} className="w-8 h-11 object-cover rounded bg-slate-800" />
                    <div>
                      <p className="text-xs font-semibold text-white">{a.title}</p>
                      <p className="text-[11px] text-slate-400">{a.genre.join(', ')} · {(a.views || 0).toLocaleString()} views</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAnimeId(a.id);
                      setActiveTab('parts');
                    }}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    View Parts &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Anime Catalog Tab */}
      {activeTab === 'anime' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Anime Catalog ({animeList.length})</h2>
            <button
              onClick={() => {
                setEditingAnime({
                  title: '',
                  slug: '',
                  description: '',
                  thumbnail_url: settings?.default_thumbnail || '',
                  banner_url: '',
                  genre: ['Action', 'Sci-Fi'],
                  status: 'Ongoing',
                  rating: '13+',
                  studio: 'ANS Studio',
                  release_year: 2026,
                  published: true,
                  featured: false,
                });
                setIsAnimeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow"
            >
              <Plus className="w-4 h-4" />
              <span>New Anime</span>
            </button>
          </div>

          <div className="space-y-2">
            {animeList.map((a) => (
              <div key={a.id} className="p-4 bg-[#10131d] rounded-2xl border border-white/[0.08] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img src={a.thumbnail_url} alt={a.title} className="w-10 h-14 object-cover rounded bg-slate-800 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{a.title}</p>
                    <p className="text-xs text-slate-400">{a.status} · {a.genre.join(', ')} · {a.release_year || 2026}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedAnimeId(a.id);
                      setActiveTab('parts');
                    }}
                    className="px-2.5 py-1 bg-white/[0.04] text-rose-400 text-xs rounded-lg hover:bg-white/[0.08]"
                  >
                    Episodes
                  </button>
                  <button
                    onClick={() => {
                      setEditingAnime(a);
                      setIsAnimeModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      await api.deleteAnime(a.id);
                      setAnimeList((prev) => prev.filter((item) => item.id !== a.id));
                      showToast(`Deleted anime "${a.title}"`);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Parts Tab */}
      {activeTab === 'parts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#10131d] rounded-2xl border border-white/[0.08]">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-300">Select Anime:</label>
              <select
                value={selectedAnimeId}
                onChange={(e) => setSelectedAnimeId(e.target.value)}
                className="bg-[#161926] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white"
              >
                {animeList.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setEditingPart({
                  anime_id: selectedAnimeId,
                  part_number: partsList.length + 1,
                  title: `Part ${partsList.length + 1}`,
                  video_type: 'stream_url',
                  video_url: '',
                  published: true,
                });
                setIsPartModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Episode Part</span>
            </button>
          </div>

          <div className="space-y-2">
            {partsList.map((p) => (
              <div key={p.id} className="p-3.5 bg-[#10131d] rounded-xl border border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-rose-400 mr-2">Part {p.part_number}</span>
                  <span className="text-xs font-semibold text-white">{p.title}</span>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-sm">{p.video_url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingPart(p);
                      setIsPartModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      await api.deletePart(p.id);
                      setPartsList((prev) => prev.filter((item) => item.id !== p.id));
                      showToast('Part deleted');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Embed Video Links Tab */}
      {activeTab === 'embeds' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#10131d] rounded-2xl border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-rose-400" />
              <span>Embed Video Link Publisher</span>
            </h3>
            <form onSubmit={handleSaveEmbed} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Anime</label>
                  <select
                    value={embedAnimeId}
                    onChange={(e) => setEmbedAnimeId(e.target.value)}
                    className="w-full bg-[#151824] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {animeList.map((a) => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Episode / Part #</label>
                  <input
                    type="number"
                    min="1"
                    value={embedPartNumber}
                    onChange={(e) => setEmbedPartNumber(parseInt(e.target.value, 10))}
                    className="w-full bg-[#151824] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Episode Title</label>
                  <input
                    type="text"
                    required
                    value={embedTitle}
                    onChange={(e) => setEmbedTitle(e.target.value)}
                    className="w-full bg-[#151824] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Embed URL or Iframe Code
                </label>
                <textarea
                  rows={3}
                  required
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/... or <iframe src='...'></iframe>"
                  className="w-full bg-[#151824] border border-white/[0.1] rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl"
              >
                Publish Embed Link
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <form onSubmit={handleAddCategory} className="flex gap-3">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name (e.g. Isekai, Shonen)..."
              className="flex-1 bg-[#151824] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(settings?.categories || DEFAULT_SETTINGS.categories).map((cat) => (
              <div key={cat} className="p-3 bg-[#10131d] rounded-xl border border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-medium text-white">{cat}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  className="text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Supabase Sync Tab */}
      {activeTab === 'supabase' && (
        <div className="p-6 bg-[#10131d] rounded-2xl border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase Database Synchronization</span>
          </h3>
          <p className="text-xs text-slate-300">
            Push seed data into your Supabase database or copy the SQL schema.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopySql}
              className="px-4 py-2 bg-white/[0.06] text-white text-xs font-medium rounded-xl border border-white/[0.1] flex items-center gap-2"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-rose-400" />}
              <span>Copy SQL Setup Schema</span>
            </button>
            <button
              onClick={handleSyncSupabase}
              disabled={syncing}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{syncing ? 'Syncing...' : 'Push Seed Anime to Supabase'}</span>
            </button>
          </div>
          {syncMsg && (
            <div className="p-3 bg-black/40 rounded-xl text-xs text-emerald-400">{syncMsg}</div>
          )}
        </div>
      )}

      {/* 7. Ads Tab */}
      {activeTab === 'ads' && (
        <div className="p-6 bg-[#10131d] rounded-2xl border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>Monetization & Ad Configuration</span>
          </h3>
          <p className="text-xs text-slate-400">
            Configure popup scripts and pre-roll sponsor announcements.
          </p>
          <button
            onClick={() => showToast('Ad settings updated')}
            className="px-5 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl"
          >
            Save Ad Settings
          </button>
        </div>
      )}

      {/* 8. Settings Tab */}
      {activeTab === 'settings' && (
        <div className="p-6 bg-[#10131d] rounded-2xl border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-rose-400" />
            <span>General Platform Settings</span>
          </h3>
          <p className="text-xs text-slate-400">
            Website name: {settings?.website_name || 'ANS Anime'}
          </p>
          <button
            onClick={() => showToast('Site settings saved')}
            className="px-5 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl"
          >
            Save Settings
          </button>
        </div>
      )}

      {/* Anime Modal */}
      {isAnimeModalOpen && editingAnime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0f1118] border border-white/[0.12] rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingAnime.id ? 'Edit Anime' : 'New Anime'}
            </h3>
            <form onSubmit={handleSaveAnime} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingAnime.title || ''}
                  onChange={(e) => setEditingAnime({ ...editingAnime, title: e.target.value })}
                  className="w-full bg-[#151824] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editingAnime.description || ''}
                  onChange={(e) => setEditingAnime({ ...editingAnime, description: e.target.value })}
                  className="w-full bg-[#151824] border border-white/[0.1] rounded-xl p-3 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Thumbnail Poster URL</label>
                <input
                  type="text"
                  value={editingAnime.thumbnail_url || ''}
                  onChange={(e) => setEditingAnime({ ...editingAnime, thumbnail_url: e.target.value })}
                  className="w-full bg-[#151824] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAnimeModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Part Modal */}
      {isPartModalOpen && editingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f1118] border border-white/[0.12] rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingPart.id ? 'Edit Part' : 'Add Part'}
            </h3>
            <form onSubmit={handleSavePart} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Part Title *</label>
                <input
                  type="text"
                  required
                  value={editingPart.title || ''}
                  onChange={(e) => setEditingPart({ ...editingPart, title: e.target.value })}
                  className="w-full bg-[#151824] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Video Stream / Embed URL *</label>
                <input
                  type="text"
                  required
                  value={editingPart.video_url || ''}
                  onChange={(e) => setEditingPart({ ...editingPart, video_url: e.target.value })}
                  className="w-full bg-[#151824] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPartModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
                >
                  Save Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

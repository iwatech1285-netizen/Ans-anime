import React, { useState, useEffect } from 'react';
import {
  Share2,
  Calendar,
  Eye,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  Play,
  Bookmark,
  BookmarkCheck,
  Star,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Anime, Part, Review } from '../types';
import { api } from '../api';
import { VideoPlayer } from '../components/VideoPlayer';
import { useSettings } from '../context/SettingsContext';

interface AnimeDetailPageProps {
  slug: string;
  initialPartNum?: number;
  onNavigate: (path: string) => void;
}

export const AnimeDetailPage: React.FC<AnimeDetailPageProps> = ({
  slug,
  initialPartNum,
  onNavigate,
}) => {
  const { isInWatchlist, toggleWatchlist } = useSettings();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [relatedAnime, setRelatedAnime] = useState<Anime[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Review Form
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(10);
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        const res = await api.getAnimeBySlug(slug);
        if (!isMounted) return;
        setAnime(res.anime);
        setParts(res.parts);

        // Select initial part or first part
        if (res.parts.length > 0) {
          const targetPart = initialPartNum
            ? res.parts.find((p) => p.part_number === initialPartNum) || res.parts[0]
            : res.parts[0];
          setSelectedPart(targetPart);
        }

        // Record view count
        api.recordAnimeView(res.anime.id).catch(() => {});

        // Fetch reviews
        api.getReviews(res.anime.id).then((r) => {
          if (isMounted) setReviews(r);
        });

        // Load recommended anime
        const all = await api.getAnimeList();
        if (isMounted) {
          setRelatedAnime(all.filter((a) => a.id !== res.anime.id).slice(0, 4));
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load anime');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [slug, initialPartNum]);

  const handleSelectPart = (part: Part) => {
    setSelectedPart(part);
    window.history.pushState({}, '', `/anime/${slug}/part-${part.part_number}`);
    api.recordPartView(part.id).catch(() => {});
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anime || !newReviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const added = await api.addReview(anime.id, {
        user_name: newReviewAuthor.trim() || 'Anonymous Fan',
        rating: newReviewRating,
        content: newReviewText.trim(),
      });
      setReviews([added, ...reviews]);
      setNewReviewText('');
      setNewReviewAuthor('');
    } catch (err) {
      console.error('Failed to add review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading anime stream and episodes...</p>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Anime Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested anime does not exist or may have been unpublished by the creator.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    );
  }

  const bookmarked = isInWatchlist(anime.id);

  return (
    <div className="space-y-10 pb-16">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to catalog</span>
      </button>

      {/* VIDEO PLAYER SECTION */}
      {selectedPart ? (
        <section className="space-y-4">
          <VideoPlayer
            anime={anime}
            part={selectedPart}
            allParts={parts}
            onSelectPart={handleSelectPart}
          />
        </section>
      ) : (
        <div className="p-8 text-center bg-[#10131d] rounded-3xl border border-white/[0.08] space-y-2">
          <p className="text-sm font-semibold text-slate-200">No episodes/parts available yet</p>
          <p className="text-xs text-slate-400">
            The creator hasn't published any parts for this anime yet. Check back soon!
          </p>
        </div>
      )}

      {/* ANIME DETAILS & EPISODE SELECTOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Metadata & Episodes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Overview */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 bg-[#0f111a] rounded-3xl border border-white/[0.08]">
            {/* Poster thumbnail */}
            <div className="w-32 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border border-white/[0.1] shrink-0 shadow-lg">
              <img
                src={anime.thumbnail_url}
                alt={anime.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Information */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider">
                  {anime.status}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWatchlist(anime.id)}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                      bookmarked
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/[0.08]'
                    }`}
                  >
                    {bookmarked ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Add to Watchlist</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 bg-white/[0.04] rounded-xl border border-white/[0.08] transition-colors"
                    title="Share link"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-['Syne'] font-extrabold text-white tracking-tight">
                {anime.title}
              </h1>

              {/* Unboxed Metadata Line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>{anime.genre.join(', ')}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {anime.release_year || '2026'}
                </span>
                {anime.studio && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{anime.studio}</span>
                  </>
                )}
                {anime.rating && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-300">{anime.rating}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono tabular-nums">
                  <Eye className="w-3 h-3" />
                  {(anime.views || 0).toLocaleString()} views
                </span>
              </div>

              {/* Synopsis */}
              <div className="pt-2">
                <h3 className="text-xs font-semibold uppercase font-mono text-slate-400 tracking-wider mb-1">
                  Synopsis
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{anime.description}</p>
              </div>
            </div>
          </div>

          {/* PARTS / EPISODES LIST */}
          <div className="bg-[#0f111a] rounded-3xl border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-['Syne'] font-bold text-white flex items-center gap-2">
                  <span>Available Parts & Episodes</span>
                  <span className="text-xs font-normal text-slate-400">({parts.length} parts)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any part to instantly switch video playback
                </p>
              </div>
            </div>

            {parts.length > 0 ? (
              <div className="space-y-2.5">
                {parts.map((p) => {
                  const isActive = selectedPart?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPart(p)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isActive
                          ? 'bg-rose-500/10 border-rose-500/50 shadow-md shadow-rose-950/20'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-rose-600 text-white shadow-md'
                              : 'bg-white/[0.06] text-slate-400'
                          }`}
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                              Part {p.part_number}
                            </span>
                            <span className="text-sm font-semibold text-slate-100 truncate">
                              {p.title}
                            </span>
                          </div>
                          {p.description && (
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3 text-right">
                        {p.duration && (
                          <span className="text-xs font-mono text-slate-400 tabular-nums">
                            {p.duration}
                          </span>
                        )}
                        {isActive && (
                          <span className="hidden sm:inline text-[10px] font-mono font-semibold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            Now Playing
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                No published parts found for this anime.
              </p>
            )}
          </div>

          {/* COMMUNITY REVIEWS & COMMENTS */}
          <div className="bg-[#0f111a] rounded-3xl border border-white/[0.08] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-['Syne'] font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-400" />
                <span>Audience Reviews & Discussions</span>
                <span className="text-xs font-normal text-slate-400">({reviews.length})</span>
              </h3>
            </div>

            {/* Post Review Form */}
            <form onSubmit={handleReviewSubmit} className="space-y-3 p-4 bg-[#141724] rounded-2xl border border-white/[0.06]">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="Your handle or username..."
                  className="bg-[#1b1f30] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 sm:w-1/2"
                />
                <div className="flex items-center gap-2 sm:w-1/2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span>Rating:</span>
                  </span>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(parseInt(e.target.value, 10))}
                    className="bg-[#1b1f30] border border-white/[0.08] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                      <option key={num} value={num}>
                        {num} / 10 {num >= 9 ? '★ Masterpiece' : num >= 7 ? '★ Great' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                rows={2}
                required
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your thoughts on this episode and series..."
                className="w-full bg-[#1b1f30] border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview || !newReviewText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'Posting...' : 'Post Review'}</span>
                </button>
              </div>
            </form>

            {/* Review List */}
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{rev.user_name}</span>
                      <span className="flex items-center gap-0.5 text-amber-400 font-mono">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{rev.rating}/10</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rev.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="space-y-4">
          <div className="p-5 bg-[#0f111a] rounded-3xl border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-['Syne'] font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>More Original Anime</span>
            </h3>
            <div className="space-y-3">
              {relatedAnime.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate(`/anime/${item.slug}`)}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/[0.05] cursor-pointer group transition-colors"
                >
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-14 h-20 object-cover rounded-xl bg-slate-900 border border-white/[0.06] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-rose-400 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.genre.slice(0, 2).join(', ')}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                      <span>{item.status}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{item.release_year || '2026'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

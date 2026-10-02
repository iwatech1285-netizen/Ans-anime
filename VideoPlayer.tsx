import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  SkipForward,
  ExternalLink,
} from 'lucide-react';
import { Part, Anime } from '../types';
import { useSettings } from '../context/SettingsContext';

interface VideoPlayerProps {
  anime: Anime;
  part: Part;
  allParts: Part[];
  onSelectPart: (part: Part) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  anime,
  part,
  allParts,
  onSelectPart,
}) => {
  const { settings, saveWatchProgress } = useSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<{ time: number } | null>(null);

  // Pre-roll Ad State
  const [adActive, setAdActive] = useState(false);
  const [adSecondsLeft, setAdSecondsLeft] = useState(5);
  const [canSkipAd, setCanSkipAd] = useState(false);

  const controlsTimeoutRef = useRef<any>(null);

  // Key for local storage resume timestamp
  const resumeKey = `ans_resume_${anime.id}_${part.id}`;

  // Check if embed URL vs direct stream
  const isEmbed =
    part.video_type === 'embed_url' ||
    part.video_url.includes('youtube.com') ||
    part.video_url.includes('youtu.be') ||
    part.video_url.includes('vimeo.com') ||
    part.video_url.includes('<iframe');

  // Initialize resume time & pre-roll ad trigger
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);

    // Check saved timestamp
    try {
      const savedTimeStr = localStorage.getItem(resumeKey);
      if (savedTimeStr) {
        const savedTime = parseFloat(savedTimeStr);
        if (savedTime > 10) {
          setResumePrompt({ time: savedTime });
        }
      }
    } catch {}

    // Check if pre-roll ad should fire
    if (settings?.ads?.preroll_enabled) {
      setAdActive(true);
      const skipSecs = settings.ads.preroll_skip_seconds || 5;
      setAdSecondsLeft(skipSecs);
      setCanSkipAd(false);
    } else {
      setAdActive(false);
    }
  }, [anime.id, part.id, settings?.ads?.preroll_enabled]);

  // Pre-roll ad countdown
  useEffect(() => {
    if (!adActive) return;
    if (adSecondsLeft > 0) {
      const timer = setTimeout(() => {
        setAdSecondsLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkipAd(true);
    }
  }, [adActive, adSecondsLeft]);

  const handleSkipAd = () => {
    setAdActive(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Video time tracking & watch history save
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Save resume timestamp to localStorage every 5 seconds
    if (Math.floor(current) % 5 === 0 && current > 3) {
      try {
        localStorage.setItem(resumeKey, current.toString());
      } catch {}
      saveWatchProgress({
        animeId: anime.id,
        animeTitle: anime.title,
        animeSlug: anime.slug,
        thumbnailUrl: anime.thumbnail_url,
        partId: part.id,
        partNumber: part.part_number,
        partTitle: part.title,
        currentTime: current,
        duration: duration || 1,
      });
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (adActive) return;
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSkipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds)
    );
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume > 0 ? volume : 0.5;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleResume = (resume: boolean) => {
    if (resume && resumePrompt && videoRef.current) {
      videoRef.current.currentTime = resumePrompt.time;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    setResumePrompt(null);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkipTime(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkipTime(10);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Autoplay next part when video ends
  const handleVideoEnded = () => {
    setIsPlaying(false);
    const nextPart = allParts.find((p) => p.part_number === part.part_number + 1);
    if (nextPart) {
      onSelectPart(nextPart);
    }
  };

  // Format time (mm:ss or hh:mm:ss)
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Mouse activity auto-hiding controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3000);
  };

  // Convert embed code/URL to clean iframe src
  const getEmbedSrc = (urlOrIframe: string) => {
    if (urlOrIframe.includes('<iframe')) {
      const match = urlOrIframe.match(/src=["']([^"']+)["']/);
      return match ? match[1] : '';
    }
    if (urlOrIframe.includes('youtube.com/watch?v=')) {
      const id = urlOrIframe.split('v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    }
    if (urlOrIframe.includes('youtu.be/')) {
      const id = urlOrIframe.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    }
    if (urlOrIframe.includes('vimeo.com/')) {
      const id = urlOrIframe.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return urlOrIframe;
  };

  const nextPart = allParts.find((p) => p.part_number === part.part_number + 1);

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl select-none group"
      >
        {/* RESUME PLAYBACK NOTIFICATION */}
        {resumePrompt && !adActive && (
          <div className="absolute top-4 left-4 right-4 z-30 max-w-md mx-auto bg-slate-900/90 backdrop-blur-md border border-rose-500/40 rounded-2xl p-3.5 flex items-center justify-between text-xs text-white shadow-xl">
            <div>
              <p className="font-semibold text-rose-300">Resume Playback?</p>
              <p className="text-slate-300">
                You were at <span className="font-mono">{formatTime(resumePrompt.time)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleResume(false)}
                className="px-2.5 py-1 text-slate-400 hover:text-white rounded hover:bg-white/[0.08]"
              >
                Start Over
              </button>
              <button
                onClick={() => handleResume(true)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg shadow-sm"
              >
                Resume
              </button>
            </div>
          </div>
        )}

        {/* PRE-ROLL ADVERTISEMENT LAYER */}
        {adActive && (
          <div className="absolute inset-0 z-30 bg-[#090b10] flex flex-col justify-between p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                  Advertisement
                </span>
                <span className="text-xs text-slate-300">
                  {settings?.ads?.preroll_title || 'Sponsor Highlight'}
                </span>
              </div>
              <div>
                {canSkipAd ? (
                  <button
                    onClick={handleSkipAd}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
                  >
                    <span>Skip to Anime</span>
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="px-3 py-1.5 bg-black/60 border border-white/[0.1] rounded-lg text-xs font-mono tabular-nums text-slate-300">
                    Video plays in {adSecondsLeft}s
                  </div>
                )}
              </div>
            </div>

            {/* Ad Content Display */}
            <div className="flex-1 flex items-center justify-center my-4 overflow-hidden rounded-xl border border-white/[0.08] bg-black/40">
              {settings?.ads?.preroll_type === 'video' ? (
                <video
                  src={settings.ads.preroll_content}
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleSkipAd}
                  className="w-full h-full object-contain"
                />
              ) : settings?.ads?.preroll_type === 'banner' ? (
                <a
                  href={settings?.ads?.preroll_target_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative max-w-full max-h-full flex flex-col items-center"
                >
                  <img
                    src={settings.ads.preroll_content}
                    alt="Sponsor Ad"
                    className="max-h-72 object-contain rounded-lg shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <span className="mt-2 text-xs text-rose-400 group-hover:underline flex items-center gap-1">
                    Visit Sponsor <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              ) : (
                <div
                  className="p-6 text-center text-slate-300 text-sm"
                  dangerouslySetInnerHTML={{ __html: settings?.ads?.preroll_content || '' }}
                />
              )}
            </div>

            <div className="text-center text-[11px] text-slate-500">
              Ad support keeps ANS Anime original productions free to stream.
            </div>
          </div>
        )}

        {/* EMBED PLAYER vs DIRECT HTML5 VIDEO */}
        {isEmbed ? (
          <iframe
            src={getEmbedSrc(part.video_url)}
            title={part.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={part.video_url}
              poster={part.thumbnail_url || anime.banner_url || anime.thumbnail_url}
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleVideoEnded}
              playsInline
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* CENTER PLAY BUTTON OVERLAY */}
            {!isPlaying && !adActive && (
              <button
                onClick={togglePlay}
                aria-label="Play video"
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl shadow-rose-950 hover:bg-rose-500 hover:scale-105 transition-all z-10"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
            )}

            {/* VIDEO CONTROLS OVERLAY */}
            <div
              className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-5 pb-3.5 pt-12 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Seek Bar */}
              <div className="relative mb-2.5 flex items-center group/scrubber">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Video scrubber"
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:h-2 transition-all focus:outline-none"
                />
              </div>

              {/* Control Buttons Row */}
              <div className="flex items-center justify-between text-white text-xs">
                {/* Left Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 hover:text-rose-400 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <button
                    onClick={() => handleSkipTime(-10)}
                    className="p-1 text-slate-300 hover:text-white transition-colors"
                    title="Rewind 10s"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSkipTime(10)}
                    className="p-1 text-slate-300 hover:text-white transition-colors"
                    title="Forward 10s"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button
                      onClick={toggleMute}
                      className="p-1 text-slate-300 hover:text-white transition-colors"
                      aria-label="Toggle mute"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      aria-label="Volume"
                      className="w-16 h-1 bg-white/30 rounded appearance-none cursor-pointer accent-rose-500 opacity-80 group-hover/vol:opacity-100"
                    />
                  </div>

                  {/* Time Display */}
                  <span className="font-mono tabular-nums text-[11px] text-slate-300 ml-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                  {/* Next Episode Button */}
                  {nextPart && (
                    <button
                      onClick={() => onSelectPart(nextPart)}
                      className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-medium transition-colors"
                      title={`Next: ${nextPart.title}`}
                    >
                      <span>Next Part</span>
                      <SkipForward className="w-3 h-3" />
                    </button>
                  )}

                  {/* Playback Speed selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-[11px] font-mono tabular-nums transition-colors"
                    >
                      {playbackSpeed}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-9 right-0 bg-[#161822] border border-white/[0.12] rounded-xl shadow-2xl p-1 w-24 text-[11px] z-30">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => handleSpeedChange(spd)}
                            className={`w-full text-left px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors ${
                              playbackSpeed === spd ? 'text-rose-400 font-bold' : 'text-slate-300'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1 text-slate-300 hover:text-white transition-colors"
                    aria-label="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Part Title and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-[#10131d] rounded-2xl border border-white/[0.08]">
        <div>
          <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider">
            Part {part.part_number} of {allParts.length}
          </span>
          <h2 className="text-xl font-['Syne'] font-bold text-white tracking-tight">{part.title}</h2>
          {part.description && (
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {part.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {nextPart && (
            <button
              onClick={() => onSelectPart(nextPart)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-98"
            >
              <span>Next: Part {nextPart.part_number}</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

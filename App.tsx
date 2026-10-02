import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { AdPopup } from './components/AdPopup';
import { SupabaseStatusModal } from './components/SupabaseStatusModal';
import { HomePage } from './pages/HomePage';
import { AnimeDetailPage } from './pages/AnimeDetailPage';
import { SearchPage } from './pages/SearchPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Sync state with browser URL popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut "/" for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route parser
  const renderRoute = () => {
    // 1. Admin Page
    if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
      return <AdminPage onNavigate={navigate} />;
    }

    // 2. Search Page
    if (currentPath === '/search') {
      const searchParams = new URLSearchParams(window.location.search);
      const q = searchParams.get('q') || '';
      const genre = searchParams.get('genre') || 'All';
      return (
        <SearchPage
          initialQuery={q}
          initialGenre={genre}
          onNavigate={navigate}
        />
      );
    }

    // 3. Anime Details Page: /anime/:slug or /anime/:slug/part-:num
    if (currentPath.startsWith('/anime/')) {
      const segments = currentPath.replace(/^\/anime\//, '').split('/');
      const slug = segments[0];
      let partNum: number | undefined;
      if (segments[1] && segments[1].startsWith('part-')) {
        const parsed = parseInt(segments[1].replace('part-', ''), 10);
        if (!isNaN(parsed)) {
          partNum = parsed;
        }
      }
      return (
        <AnimeDetailPage
          slug={slug}
          initialPartNum={partNum}
          onNavigate={navigate}
        />
      );
    }

    // 4. Default: Homepage
    return (
      <HomePage
        onNavigate={navigate}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
      />
    );
  };

  const isAdminRoute = currentPath === '/admin' || currentPath.startsWith('/admin/');

  return (
    <AuthProvider>
      <SettingsProvider>
        <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 font-sans selection:bg-rose-600/30 selection:text-rose-200">
          {isAdminRoute ? (
            /* Standalone Dedicated Admin Portal Page with Back link */
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <AdminPage onNavigate={navigate} />
            </div>
          ) : (
            /* Public Streaming Platform Layout */
            <>
              {/* Top Bar Navigation */}
              <Navbar
                currentPath={currentPath}
                onNavigate={navigate}
                onOpenSearch={() => setSearchModalOpen(true)}
              />

              {/* Main View Area */}
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
                {renderRoute()}
              </main>

              {/* Footer with Dedicated Admin Panel Links */}
              <Footer
                onNavigate={navigate}
                onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
              />
            </>
          )}

          {/* Global Search Modal */}
          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            onSelectAnime={(slug) => navigate(`/anime/${slug}`)}
            onViewAllResults={(query) => navigate(`/search?q=${encodeURIComponent(query)}`)}
          />

          {/* Supabase Status Modal */}
          <SupabaseStatusModal
            isOpen={supabaseModalOpen}
            onClose={() => setSupabaseModalOpen(false)}
          />

          {/* Sandboxed Ad Popup */}
          {!isAdminRoute && <AdPopup />}
        </div>
      </SettingsProvider>
    </AuthProvider>
  );
}

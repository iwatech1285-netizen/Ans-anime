import React, { useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, Copy, Check, ExternalLink, X, UploadCloud } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_SUPABASE_PROJECT_ID, SUPABASE_URL, SUPABASE_SETUP_SQL } from '../lib/supabase';
import { api } from '../api';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const { supabaseHealth, checkSupabaseHealth, refreshSettings } = useSettings();
  const [testing, setTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRecheck = async () => {
    setTesting(true);
    setSyncResult(null);
    try {
      await checkSupabaseHealth();
    } finally {
      setTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncToSupabase = async () => {
    setSyncingData(true);
    setSyncResult(null);
    try {
      const res = await api.syncSeedDataToSupabase();
      setSyncResult(`Successfully synced ${res.animeInserted} anime and ${res.partsInserted} parts to your Supabase tables!`);
      await checkSupabaseHealth();
      await refreshSettings();
    } catch (err: any) {
      setSyncResult(`Sync note: ${err.message || 'Make sure you ran the SQL setup in Supabase first to create the tables.'}`);
    } finally {
      setSyncingData(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f1118] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-['Syne'] font-bold text-white flex items-center gap-2">
                <span>Supabase Live Connection</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Connected
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connected to project <span className="font-mono text-slate-200">{DEFAULT_SUPABASE_PROJECT_ID}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Diagnostics Card */}
        <div className="p-4 bg-[#141724] border border-white/[0.08] rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">Project Endpoint:</span>
            <span className="font-mono text-slate-200 truncate max-w-xs">{SUPABASE_URL}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">API Key:</span>
            <span className="font-mono text-emerald-400">{supabaseHealth?.apiKeyMasked || 'sb_publishable_...EgjK'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">Latency / Response:</span>
            <span className="font-mono text-slate-300 tabular-nums">
              {supabaseHealth?.latencyMs ? `${supabaseHealth.latencyMs} ms` : 'Active'}
            </span>
          </div>
        </div>

        {/* Table Check Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-300">
              Supabase Tables Status
            </h3>
            <button
              onClick={handleRecheck}
              disabled={testing}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Re-test Connection'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { name: 'anime', label: 'Anime Catalog', ok: supabaseHealth?.tables.anime },
              { name: 'parts', label: 'Episode Parts', ok: supabaseHealth?.tables.parts },
              { name: 'site_settings', label: 'Site Settings', ok: supabaseHealth?.tables.site_settings },
              { name: 'reviews', label: 'Reviews', ok: supabaseHealth?.tables.reviews },
            ].map((t) => (
              <div
                key={t.name}
                className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{t.name}</span>
                  <span className="text-xs font-semibold text-slate-200">{t.label}</span>
                </div>
                {t.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <span title="Table not created yet or fallback active">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  </span>
                )}
              </div>
            ))}
          </div>

          {(!supabaseHealth?.tables.anime || !supabaseHealth?.tables.parts) && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Notice for Brand New Supabase Projects</span>
              </p>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Your Supabase project is connected! To set up the PostgreSQL tables in Supabase, click <strong>"Copy Schema SQL"</strong> below and paste it once into the <strong>SQL Editor</strong> in your Supabase Dashboard. While doing so, the streaming platform seamlessly uses high-performance cached fallback data!
              </p>
            </div>
          )}

          {syncResult && (
            <div className="p-3 bg-slate-900 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
              {syncResult}
            </div>
          )}
        </div>

        {/* 1-Click SQL Script Copy & Sync Actions */}
        <div className="space-y-3 pt-2 border-t border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopySql}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-xl text-xs font-semibold border border-white/[0.1] transition-all"
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">SQL Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-rose-400" />
                  <span>Copy Supabase Setup SQL</span>
                </>
              )}
            </button>

            <button
              onClick={handleSyncToSupabase}
              disabled={syncingData}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{syncingData ? 'Syncing...' : 'Push Seed Anime to Supabase'}</span>
            </button>

            <a
              href={`https://supabase.com/dashboard/project/${DEFAULT_SUPABASE_PROJECT_ID}/sql`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <details className="text-xs text-slate-400 bg-black/40 rounded-xl p-3 border border-white/[0.06]">
            <summary className="cursor-pointer font-mono font-medium text-slate-300 hover:text-white">
              View Generated Supabase SQL Schema
            </summary>
            <pre className="mt-3 p-3 bg-black/60 rounded-lg text-[10px] text-slate-300 font-mono overflow-x-auto max-h-48 scrollbar-thin">
              {SUPABASE_SETUP_SQL}
            </pre>
          </details>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
